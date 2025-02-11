import {platform} from 'node:os';
import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app} from 'electron';
import importSync from 'import-sync';

import {APP_NAME} from '../../../cross/CrossConstants';
import StorageTypes from '../../../cross/StorageTypes';
import {appManager} from '../../index';
import {getExePath, isPortable} from '../../Utilities/Utils';

const {JSONFileSyncPreset} = importSync('lowdb/node');

class BaseStorage {
  //#region Private Properties

  private readonly storage;

  private readonly STORAGE_FILE = is.dev ? `${APP_NAME}-Dev.config` : `${APP_NAME}.config`;
  private readonly STORAGE_PATH = isPortable()
    ? join(getExePath(), `${APP_NAME}_Data`, this.STORAGE_FILE)
    : join(app.getPath('userData'), this.STORAGE_FILE);

  private readonly CURRENT_VERSION: number = 0.6;

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.5},
    cards: {
      installedCards: [],
      autoUpdateCards: [],
      pinnedCards: [],
      recentlyUsedCards: [],
      cardCompactMode: false,
      autoUpdateExtensions: [],
      cardsDevImage: true,
      cardsDevName: false,
      cardsDesc: true,
      cardsRepoInfo: true,
      zoomFactor: [],
      duplicated: [],
    },
    cardsConfig: {
      preCommands: [],
      customRun: [],
      preOpen: [],
      args: [],
      customRunBehavior: [],
    },
    app: {
      closeConfirm: true,
      terminateAIConfirm: true,
      homeCategory: ['All', 'Pin'],
      darkMode: 'dark',
      taskbarStatus: 'taskbar-tray',
      tooltipStatus: 'essential',
      systemStartup: false,
      startMinimized: false,
      startupLastActivePage: false,
      lastPage: '/homePage',
      discordRP: {
        LynxHub: {
          Enabled: true,
          TimeElapsed: true,
        },
        RunningAI: {
          Enabled: true,
          TimeElapsed: true,
          AIName: true,
        },
      },
      hotkeys: {
        FULLSCREEN: platform() === 'darwin' ? 'f12' : 'f11',
        TOGGLE_NAV: 'alt+a',
        TOGGLE_AI_VIEW: 'alt+q',
        isEnabled: true,
      },
      initialized: false,
      appDataDir: isPortable() ? `./${APP_NAME}_Data` : join(app.getPath('documents'), APP_NAME),
    },
    terminal: {
      outputColor: true,
      useConpty: 'auto',
      scrollBack: 10000,
      fontSize: 14,
      cursorStyle: 'bar',
      cursorInactiveStyle: 'none',
      blinkCursor: true,
      resizeDelay: 77,
    },
  };
  //#endregion

  //#region Constructor

  constructor() {
    // @ts-ignore
    this.storage = JSONFileSyncPreset<StorageTypes>(this.STORAGE_PATH, this.DEFAULT_DATA);
    this.storage.read();
    this.migration();
  }

  //#endregion

  //#region Private Methods

  private migration() {
    const storeVersion = this.getData('storage').version;

    const version4to5 = () => {
      this.storage.data.terminal = this.DEFAULT_DATA.terminal;
      this.storage.write();
    };

    const version5to6 = () => {
      this.storage.data.cards.duplicated = [];
      this.storage.write();
    };

    const updateVersion = () => {
      this.updateData('storage', {version: this.CURRENT_VERSION});
    };

    if (storeVersion < this.CURRENT_VERSION) {
      switch (storeVersion) {
        case 0.4: {
          version4to5();
          version5to6();
          break;
        }
        case 0.5: {
          version5to6();
          break;
        }
        default:
          break;
      }

      updateVersion();
    }
  }

  //#endregion

  //#region Public Methods

  public getData<K extends keyof StorageTypes>(key: K): StorageTypes[K] {
    return this.storage.data[key];
  }

  public getCustomData(id: string) {
    return this.storage.data[id];
  }

  public setCustomData(id: string, data: any) {
    this.storage.data[id] = data;
    this.storage.write();
  }

  public getAll(): StorageTypes {
    return this.storage.data;
  }

  public updateData<K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>) {
    this.storage.data[key] = {...this.storage.data[key], ...updateData};
    this.storage.write();
  }

  public clearStorage(): void {
    this.storage.data = {...this.DEFAULT_DATA};
    this.storage.write();
    appManager.restart();
  }

  //#endregion
}

export default BaseStorage;
