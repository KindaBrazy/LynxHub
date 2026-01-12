import axios from 'axios';
import {app} from 'electron';

import {toMs} from '../../cross/CrossUtils';
import {otherChannels} from '../../cross/IpcChannelAndTypes';
import ContextMenuManager from './ContextMenuManager';
import {ValidateCards} from './DataValidator';
import ElectronAppManager from './ElectronAppManager';
import LinkPreviewManager from './LinkPreviewManager';
import ExtensionManager from './Plugin/Extensions/ExtensionManager';
import ModuleManager from './Plugin/Modules/ModuleManager';
import {PluginManager} from './Plugin/PluginManager';
import StaticsManager from './StaticsManager';
import StorageManager from './Storage/StorageManager';
import TrayManager from './TrayManager';

class ClassHolder {
  private readonly _storageManager: StorageManager;

  private _moduleManager?: ModuleManager;
  private _extensionManager?: ExtensionManager;
  private _pluginManager?: PluginManager;

  private _staticManager?: StaticsManager;
  private _appManager?: ElectronAppManager;
  private _trayManager?: TrayManager;
  private _cardsValidator?: ValidateCards;
  private _contextMenuManager?: ContextMenuManager;
  private _linkPreviewManager?: LinkPreviewManager;

  private readonly _appStartTime: number;
  private _isOnline: boolean = true;
  private isOnlineInterval: NodeJS.Timeout | undefined = undefined;

  constructor() {
    this._storageManager = new StorageManager();
    this._appStartTime = Date.now();
    this.checkOnline();
  }

  private async checkOnline() {
    const setResult = isOnline => {
      this.isOnline = isOnline;
      if (this.appManager) {
        const webContent = this.appManager.getWebContent();
        if (webContent && !webContent.isDestroyed()) webContent.send(otherChannels.onOnline, isOnline);
      }
    };
    const checkStatus = () => {
      axios
        .request({url: 'https://google.com', timeout: 4000})
        .then(response => {
          setResult(response.statusText.toLowerCase() === 'ok');
        })
        .catch(_ => {
          setResult(false);
        });
    };

    checkStatus();
    this.isOnlineInterval = setInterval(checkStatus, toMs(5, 'seconds'));

    app.on('before-quit', () => {
      clearInterval(this.isOnlineInterval);
      this.isOnlineInterval = undefined;
    });
  }

  public async initializeManagers() {
    this.moduleManager = new ModuleManager();

    this.extensionManager = new ExtensionManager();
    this.extensionManager.setStorageManager(this.storageManager);
    this.extensionManager.setModuleManager(this.moduleManager);

    this.pluginManager = new PluginManager(this.moduleManager, this.extensionManager);

    this.staticManager = new StaticsManager();
    this.appManager = new ElectronAppManager();
    this.extensionManager.setAppManager(this.appManager);
    this.trayManager = new TrayManager();
    this.cardsValidator = new ValidateCards();
    this.contextMenuManager = new ContextMenuManager();
    this.linkPreviewManager = new LinkPreviewManager();
  }

  public async checkStaticsRequirements() {
    try {
      await this.staticManager?.checkRequirements();
    } catch (err) {
      console.warn('StaticsManager initialization failed:', err?.message || err);
    }
  }

  // ----------------> Setters
  private set appManager(value: ClassHolder['_appManager']) {
    this._appManager = value;
  }
  private set trayManager(value: ClassHolder['_trayManager']) {
    this._trayManager = value;
  }
  private set cardsValidator(value: ClassHolder['_cardsValidator']) {
    this._cardsValidator = value;
  }
  private set contextMenuManager(value: ClassHolder['_contextMenuManager']) {
    this._contextMenuManager = value;
  }
  private set linkPreviewManager(value: ClassHolder['_linkPreviewManager']) {
    this._linkPreviewManager = value;
  }
  private set moduleManager(value: ClassHolder['_moduleManager']) {
    this._moduleManager = value;
  }
  private set extensionManager(value: ClassHolder['_extensionManager']) {
    this._extensionManager = value;
  }
  private set pluginManager(value: ClassHolder['_pluginManager']) {
    this._pluginManager = value;
  }
  private set staticManager(value: ClassHolder['_staticManager']) {
    this._staticManager = value;
  }
  private set isOnline(value: ClassHolder['_isOnline']) {
    this._isOnline = value;
  }

  // ----------------> Getters
  get appStartTime(): number {
    return this._appStartTime;
  }
  get storageManager(): StorageManager {
    return this._storageManager;
  }
  get moduleManager() {
    return this._moduleManager;
  }
  get extensionManager() {
    return this._extensionManager;
  }
  get pluginManager() {
    return this._pluginManager;
  }
  get staticManager() {
    return this._staticManager;
  }
  get appManager() {
    return this._appManager;
  }
  get trayManager() {
    return this._trayManager;
  }
  get cardsValidator() {
    return this._cardsValidator;
  }
  get contextMenuManager() {
    return this._contextMenuManager;
  }
  get linkPreviewManager() {
    return this._linkPreviewManager;
  }
  get isOnline(): boolean {
    return this._isOnline;
  }
}

export default new ClassHolder();
