import {platform} from 'node:os';
import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app} from 'electron';
import fs from 'graceful-fs';
import {LowSync} from 'lowdb';
import {JSONFileSyncPreset} from 'lowdb/node';

import {APP_NAME} from '../../../cross/CrossConstants';
import StorageTypes from '../../../cross/StorageTypes';
import {appManager} from '../../index';
import {getExePath, isPortable} from '../../Utilities/Utils';
import {changeWindowState} from '../Ipc/Methods/IpcMethods';

class BaseStorage {
  private readonly storage: LowSync<StorageTypes>;

  private readonly CURRENT_VERSION: number = 0.9;

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.9},
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
      checkUpdateInterval: 30,
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
      closeTabConfirm: true,
      terminateAIConfirm: true,
      openLastSize: false,
      homeCategory: ['All', 'Pin'],
      darkMode: 'dark',
      taskbarStatus: 'taskbar-tray',
      tooltipStatus: 'essential',
      systemStartup: false,
      startMinimized: false,
      startupLastActivePage: false,
      dynamicAppTitle: true,
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
    browser: {
      recentAddress: [],
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

    this.storage = JSONFileSyncPreset<StorageTypes>(storagePath, this.DEFAULT_DATA);
    this.storage.read();
    this.migration();
  }

  private migration() {
    const storeVersion = this.getData('storage').version;

    const v4to5 = () => {
      this.storage.data.terminal = this.DEFAULT_DATA.terminal;

      this.storage.write();
    };

    const v5to6 = () => {
      this.storage.data.cards.duplicated = [];

      this.storage.write();
    };

    const v6to7 = () => {
      this.storage.data.app.openLastSize = false;
      this.storage.data.app.dynamicAppTitle = true;
      this.storage.data.app.lastSize = undefined;
      this.storage.data.cards.checkUpdateInterval = 30;

      this.storage.write();
    };

    const v7to8 = () => {
      this.storage.data.browser = {
        recentAddress: [],
      };

      this.storage.write();
    };

    const v8to9 = () => {
      this.storage.data.app.closeTabConfirm = true;

      this.storage.write();
    };

    const updateVersion = () => {
      this.updateData('storage', {version: this.CURRENT_VERSION});
    };

    if (storeVersion < this.CURRENT_VERSION) {
      switch (storeVersion) {
        case 0.4: {
          v4to5();
          v5to6();
          v6to7();
          v7to8();
          v8to9();
          break;
        }
        case 0.5: {
          v5to6();
          v6to7();
          v7to8();
          v8to9();
          break;
        }
        case 0.6: {
          v6to7();
          v7to8();
          v8to9();
          break;
        }
        case 0.7: {
          v7to8();
          v8to9();
          break;
        }
        case 0.8: {
          v8to9();
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
    if (isPortable() === 'linux') {
      changeWindowState('close');
    } else {
      appManager.restart();
    }
  }
}

export default BaseStorage;
