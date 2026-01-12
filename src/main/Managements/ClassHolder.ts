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

  constructor() {
    this._storageManager = new StorageManager();
    this._appStartTime = Date.now();
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
  private set appManager(appManager: ClassHolder['_appManager']) {
    this._appManager = appManager;
  }
  private set trayManager(trayManager: ClassHolder['_trayManager']) {
    this._trayManager = trayManager;
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
  private set moduleManager(moduleManager: ClassHolder['_moduleManager']) {
    this._moduleManager = moduleManager;
  }
  private set extensionManager(extensionManager: ClassHolder['_extensionManager']) {
    this._extensionManager = extensionManager;
  }
  private set pluginManager(pluginManager: ClassHolder['_pluginManager']) {
    this._pluginManager = pluginManager;
  }
  private set staticManager(pluginManager: ClassHolder['_staticManager']) {
    this._staticManager = pluginManager;
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
}

let classHolder: ClassHolder | undefined = undefined;
let initialized = false;
export let isStorageReady = false;

export default function getClassHolder() {
  if (initialized) return classHolder!;

  initialized = true;
  classHolder = new ClassHolder();
  isStorageReady = true;
  return classHolder;
}
