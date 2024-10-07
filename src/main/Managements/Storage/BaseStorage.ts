import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app} from 'electron';
import importSync from 'import-sync';

import {APP_NAME} from '../../../cross/CrossConstants';
import StorageTypes from '../../../cross/StorageTypes';
import {appManager} from '../../index';

const {JSONFileSyncPreset} = importSync('lowdb/node');

class BaseStorage {
  //#region Private Properties

  private readonly storage;

  private readonly STORAGE_FILE = is.dev ? `${APP_NAME}-Dev.config` : `${APP_NAME}.config`;
  private readonly STORAGE_PATH = path.join(app.getPath('userData'), this.STORAGE_FILE);

  private readonly CURRENT_VERSION: number = 0.4;

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.4},
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
      appDataDir: path.join(app.getPath('documents'), APP_NAME),
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

    const version1to2 = () => {
      this.updateData('cards', {autoUpdateExtensions: []});
    };
    const version2to3 = () => {
      this.updateData('cardsConfig', {customRunBehavior: []});
    };

    const version3to4 = () => {
      this.updateData('cards', {
        cardsDevImage: true,
        cardsDevName: false,
        cardsDesc: true,
        cardsRepoInfo: true,
        zoomFactor: [],
      });
    };

    const updateVersion = () => {
      this.updateData('storage', {version: this.CURRENT_VERSION});
    };

    if (storeVersion < this.CURRENT_VERSION) {
      switch (storeVersion) {
        case 0.1: {
          version1to2();
          version2to3();
          version3to4();
          break;
        }
        case 0.2: {
          version2to3();
          version3to4();
          break;
        }
        case 0.3: {
          version3to4();
          break;
        }
        default:
          break;
      }

      updateVersion();
    }
    // Version 0.2 Changes -> autoUpdateExtensions
    // Version 0.3 Changes -> customRunBehavior
  }

  //#endregion

  //#region Public Methods

  public getData<K extends keyof StorageTypes>(key: K): StorageTypes[K] {
    return this.storage.data[key];
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
