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

  private readonly CURRENT_VERSION: number = 0.1;

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.1},
    cards: {
      installedCards: [],
      autoUpdateCards: [],
      pinnedCards: [],
      recentlyUsedCards: [],
      cardCompactMode: false,
    },
    cardsConfig: {
      preCommands: [],
      customRun: [],
      preOpen: [],
      args: [],
    },
    app: {
      closeConfirm: true,
      terminateAIConfirm: true,
      homeCategory: ['All'],
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
        FULLSCREEN: 'f11',
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
    if (this.getData('storage').version < this.CURRENT_VERSION) {
      // Apply Migration
    }
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
