import {platform} from 'node:os';
import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app} from 'electron';
import fs from 'graceful-fs';
import importSync from 'import-sync';

import {APP_NAME} from '../../../cross/CrossConstants';
import StorageTypes from '../../../cross/StorageTypes';
import {appManager} from '../../index';
import {getExePath, isPortable} from '../../Utilities/Utils';

const {JSONFileSyncPreset} = importSync('lowdb/node');

class BaseStorage {
  private readonly storage;

  private readonly CURRENT_VERSION: number = 0.7;

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.7},
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
      openLastSize: false,
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
      lastSize: undefined,
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

  constructor() {
    const storageFile = is.dev ? `${APP_NAME}-Dev.config` : `${APP_NAME}.config`;
    let storagePath = join(app.getPath('userData'), storageFile);

    if (isPortable()) {
      storagePath = join(getExePath(), `${APP_NAME}_Data`, storageFile);
      const dataFolderPath = join(getExePath(), `${APP_NAME}_Data`);
      if (!fs.existsSync(dataFolderPath)) {
        try {
          fs.mkdirSync(dataFolderPath, {recursive: true});
          console.log(`Created data folder: ${dataFolderPath}`);
        } catch (error) {
          console.error(`Error creating data folder: ${dataFolderPath}`, error);
          throw error;
        }
      } else {
        console.log(`Data folder already exists: ${dataFolderPath}`);
      }
    }

    // @ts-ignore
    this.storage = JSONFileSyncPreset<StorageTypes>(storagePath, this.DEFAULT_DATA);
    this.storage.read();
    this.migration();
  }

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

    const version6to7 = () => {
      this.storage.data.app.openLastSize = false;
      this.storage.data.app.lastSize = undefined;
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
          version6to7();
          break;
        }
        case 0.5: {
          version5to6();
          version6to7();
          break;
        }
        case 0.6: {
          version6to7();
          break;
        }
        default:
          break;
      }

      updateVersion();
    }
  }

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
}

export default BaseStorage;
