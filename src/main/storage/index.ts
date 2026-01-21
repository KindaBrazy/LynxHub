import {platform} from 'node:os';
import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app} from 'electron';
import fs from 'graceful-fs';
import lodash, {isEmpty} from 'lodash';
import {LowSync} from 'lowdb';
import {JSONFileSyncPreset} from 'lowdb/node';

import {APP_NAME} from '../../cross/consts';
import {Get_Default_Hotkeys} from '../../cross/consts/hotkeys';
import {CustomRunBehaviorData, CustomRunBehaviorData_Legacy, FavIcons} from '../../cross/types/ipc';
import StorageTypes from '../../cross/types/storage';
import classHolder from '../core/class_holder';
import {applicationIpc} from '../ipc/application';
import {changeWindowState} from '../ipc/methods';
import {getAbsolutePath, getExePath, getUserAgent, isPortable, lynxEncryptString, lynxEncryptStrings} from '../utils';

/**
 * Base storage class handling low-level storage operations, migrations, and data persistence
 */
class BaseStorage {
  private readonly storage: LowSync<StorageTypes>;

  private readonly CURRENT_VERSION: number = 0.95;
  private migratedTo: number = 0; // Tracks migration state for deferred operations

  private readonly DEFAULT_DATA: StorageTypes = {
    storage: {version: 0.95},
    cards: {
      installedCards: [],
      autoUpdateCards: [],
      pinnedCards: [],
      recentlyUsedCards: [],
      autoUpdateExtensions: [],
      zoomFactor: 1,
      duplicated: [],
      checkUpdateInterval: 30,
      cardTerminalPreCommands: [],
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
      startMaximized: false,
      startupLastActivePage: false,
      dynamicAppTitle: true,
      openLinkExternal: false,
      lastPage: '/homePage',
      hotkeys: Get_Default_Hotkeys(platform()),
      initialized: false,
      inited: false,
      appDataDir: isPortable() ? `./${APP_NAME}_Data` : join(app.getPath('documents'), APP_NAME),
      lastSize: undefined,
      hardwareAcceleration: true,
      disableLoadingAnimations: false,
      collectErrors: true,
      addBreadcrumbs: true,
    },
    terminal: {
      outputColor: false,
      useConpty: 'auto',
      scrollBack: 1000,
      fontSize: 14,
      cursorStyle: 'bar',
      cursorInactiveStyle: 'none',
      blinkCursor: true,
      resizeDelay: 77,
      closeTabOnExit: true,
      enableLigatures: true,
      cdHistory: [],
      quickCommands: [],
    },
    browser: {
      recentAddress: [],
      userAgent: 'lynxhub',
      customUserAgent: getUserAgent('lynxhub'),
      favoriteAddress: [],
      historyAddress: [],
      favIcons: [],
      downloadLocation: join(app.getPath('downloads'), APP_NAME),
      downloadBehavior: 'default',
      clearedDownloads: [],
      volumeSettings: {
        globalMuted: false,
        tabVolumes: {},
      },
    },
    notification: {
      readNotifs: [],
    },
    plugin: {migrated: true, disabledCards: []},
    performance: {
      forceColorProfile: 'default',
      highDpiSupport: false,
      autoplayPolicy: 'default',
      enableAcceleratedVideoDecode: true,
      jsMaxOldSpaceSize: 4096,
      ignoreGpuBlacklist: false,
      diskCacheSize: 0,
      enableWebAssemblySimd: true,
      forceHighPerformanceGpu: false,
      disableGpuVsync: false,
      disableFrameRateLimit: false,
      enableGpuRasterization: true,
      enableZeroCopy: true,
    },
  };

  constructor() {
    // Determine storage file name based on environment
    const storageFile = is.dev ? `${APP_NAME}-Dev.config` : `${APP_NAME}.config`;
    let storagePath = join(app.getPath('userData'), storageFile);

    // Handle portable mode: store data next to executable
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

  /**
   * Called after app is ready to perform deferred migrations that require app initialization
   */
  public onAppReady() {
    // Deferred encryption migration: encrypt browser data after app is ready
    if (this.migratedTo === 0.84) {
      const {recentAddress, favoriteAddress, historyAddress, favIcons} = this.getData('browser');

      this.updateData('browser', {
        recentAddress: lynxEncryptStrings(recentAddress),
        favoriteAddress: lynxEncryptStrings(favoriteAddress),
        historyAddress: lynxEncryptStrings(historyAddress),
        favIcons: favIcons.map(item => ({
          url: lynxEncryptString(item.url),
          favIcon: lynxEncryptString(item.favIcon),
        })),
      });

      this.migratedTo = 0;
    }
  }

  /**
   * Migrates storage data from older versions to current version
   * Migrations are applied sequentially based on stored version
   */
  private migration() {
    try {
      const storeVersion = this.getData('storage').version;

      // If the store is too old, reset to default and exit
      if (storeVersion < 0.4) {
        this.storage.data = {...this.DEFAULT_DATA};
        this.write();
        return;
      }

      // If the version is already current, do nothing
      if (storeVersion >= this.CURRENT_VERSION) {
        return;
      }

      // Migration functions ordered by the version they migrate *from*
      // The key is the version that requires this migration
      const migrations = new Map<number, () => void>([
        [
          0.4,
          () => {
            this.storage.data.terminal = this.DEFAULT_DATA.terminal;
          },
        ],
        [
          0.5,
          () => {
            this.storage.data.cards.duplicated = [];
          },
        ],
        [
          0.6,
          () => {
            this.storage.data.app.openLastSize = false;
            this.storage.data.app.dynamicAppTitle = true;
            this.storage.data.app.lastSize = undefined;
            this.storage.data.cards.checkUpdateInterval = 30;
          },
        ],
        [
          0.7,
          () => {
            // @ts-expect-error: in old versions, there isn't download things
            this.storage.data.browser = {
              favoriteAddress: [],
              historyAddress: [],
              recentAddress: [],
              favIcons: [],
              userAgent: 'lynxhub',
              customUserAgent: getUserAgent('lynxhub'),
            };
            this.storage.data.app.closeTabConfirm = true;
            this.storage.data.app.hotkeys = Get_Default_Hotkeys(platform());
            this.storage.data.app.openLinkExternal = false;
            this.storage.data.cards.zoomFactor = 1;
            this.storage.data.app.hardwareAcceleration = true;
            this.storage.data.app.disableLoadingAnimations = false;
            this.storage.data.notification = {readNotifs: []};
            this.storage.data.app.collectErrors = true;
          },
        ],
        [
          0.81,
          () => {
            this.storage.data.terminal.closeTabOnExit = true;
          },
        ],
        [
          0.82,
          () => {
            const recents = this.storage.data.browser.recentAddress as unknown[] as FavIcons[];
            const urls = recents.map(recent => recent.url);
            this.storage.data.browser.favoriteAddress = [];
            this.storage.data.browser.favIcons = recents;
            this.storage.data.browser.historyAddress = urls;
            this.storage.data.browser.recentAddress = urls;
          },
        ],
        [
          0.83,
          () => {
            this.storage.data.cards.cardTerminalPreCommands = [];
            this.storage.data.app.addBreadcrumbs = true;
            this.migratedTo = 0.84;
          },
        ],
        [
          0.84,
          () => {
            this.storage.data.app.addBreadcrumbs = true;
          },
        ],
        [
          0.85,
          () => {
            this.storage.data.app.inited = false;
          },
        ],
        [
          0.86,
          () => {
            // @ts-expect-error: in old versions, there isn't disable cards
            this.storage.data.plugin = {migrated: false};
          },
        ],
        [
          0.87,
          () => {
            const behavior = this.storage.data.cardsConfig.customRunBehavior;
            if (!isEmpty(behavior)) {
              // @ts-ignore-next-line
              this.storage.data.cardsConfig.customRunBehavior = behavior.map((item: CustomRunBehaviorData_Legacy) => {
                return {
                  cardID: item.cardID,
                  browser: item.browser === 'defaultBrowser' ? 'defaultBrowser' : 'appBrowser',
                  terminal: item.terminal as CustomRunBehaviorData['terminal'],
                  urlCatch: {
                    delay: 10,
                    customUrl: undefined,
                    type: item.browser === 'doNothing' ? 'nothing' : 'module',
                    findLine: undefined,
                  },
                };
              });
            }
            this.storage.data.app.startMaximized = false;
            if (this.storage.data.terminal.scrollBack === 10000) {
              this.storage.data.terminal.scrollBack = 1000;
            }
          },
        ],
        [
          0.88,
          () => {
            this.storage.data.terminal.cdHistory = [];
          },
        ],
        [
          0.89,
          () => {
            // Ensure quickCommands exists on terminal config
            if (!this.storage.data.terminal.quickCommands) {
              this.storage.data.terminal.quickCommands = [];
            }

            // Normalize customRunBehavior.urlCatch.moduleDelay
            const behavior = this.storage.data.cardsConfig.customRunBehavior as CustomRunBehaviorData[];
            if (!isEmpty(behavior)) {
              this.storage.data.cardsConfig.customRunBehavior = behavior.map(item => {
                const urlCatch = item.urlCatch || ({} as CustomRunBehaviorData['urlCatch']);

                return {
                  ...item,
                  urlCatch: {
                    ...urlCatch,
                    moduleDelay:
                      urlCatch.moduleDelay && Number.isFinite(urlCatch.moduleDelay) ? urlCatch.moduleDelay : 0,
                  },
                } as CustomRunBehaviorData;
              });
            }

            // Ensure app.hotkeys contains all default hotkeys (including newly added ones)
            const currentHotkeys = this.storage.data.app.hotkeys || [];
            const defaultHotkeys = Get_Default_Hotkeys(platform());

            const currentNames = currentHotkeys.map(h => h.name);
            const mergedHotkeys = [...currentHotkeys];

            defaultHotkeys.forEach(def => {
              if (!currentNames.includes(def.name)) {
                mergedHotkeys.push(def);
              }
            });

            this.storage.data.app.hotkeys = mergedHotkeys;
          },
        ],
        [
          0.9,
          () => {
            this.storage.data.performance = this.DEFAULT_DATA.performance;
          },
        ],
        [
          0.91,
          () => {
            // Add download location and behavior settings if they don't exist
            if (!this.storage.data.browser.downloadLocation) {
              this.storage.data.browser.downloadLocation = join(app.getPath('downloads'), APP_NAME);
            }
            if (!this.storage.data.browser.downloadBehavior) {
              this.storage.data.browser.downloadBehavior = 'default';
            }
            // Add cleared downloads tracking if it doesn't exist
            if (!this.storage.data.browser.clearedDownloads) {
              this.storage.data.browser.clearedDownloads = [];
            }
          },
        ],
        [
          0.92,
          () => {
            // Add volume settings if they don't exist
            if (!this.storage.data.browser.volumeSettings) {
              this.storage.data.browser.volumeSettings = {
                globalMuted: false,
                tabVolumes: {},
              };
            }
          },
        ],
        [
          0.93,
          () => {
            // Add disabledCards for module card filtering
            if (!this.storage.data.plugin.disabledCards) {
              this.storage.data.plugin.disabledCards = [];
            }
          },
        ],
        [
          0.94,
          () => {
            // Ensure app.hotkeys contains all default hotkeys (including toggleDevTools)
            const currentHotkeys = this.storage.data.app.hotkeys || [];
            const defaultHotkeys = Get_Default_Hotkeys(platform());

            const currentNames = currentHotkeys.map(h => h.name);
            const mergedHotkeys = [...currentHotkeys];

            defaultHotkeys.forEach(def => {
              if (!currentNames.includes(def.name)) {
                mergedHotkeys.push(def);
              }
            });

            this.storage.data.app.hotkeys = mergedHotkeys;
          },
        ],
        [
          0.95,
          () => {
            // Add enableLigatures setting for terminal font ligatures
            if (this.storage.data.terminal.enableLigatures === undefined) {
              this.storage.data.terminal.enableLigatures = true;
            }
          },
        ],
      ]);

      // Apply all necessary migrations sequentially
      for (const [version, migrationFn] of migrations.entries()) {
        if (storeVersion < version) {
          console.log(`Applying migration for v${version}...`);
          migrationFn();
        }
      }

      // Update the stored version to the current application version
      this.updateData('storage', {version: this.CURRENT_VERSION});
    } catch (e) {
      console.error('Failed to migrate storage', e);
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
    this.write();
  }

  /**
   * Returns a deep clone of all storage data
   * Converts relative paths to absolute paths in portable mode
   */
  public getAll(): StorageTypes {
    const data = this.storage.data;
    const result = lodash.cloneDeep(data);

    // Convert relative paths to absolute paths in portable mode
    if (isPortable()) {
      result.cards.installedCards = result.cards.installedCards.map(card => {
        return {id: card.id, dir: getAbsolutePath(getExePath(), card.dir || '')};
      });
    }

    return result;
  }

  public updateData<K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>) {
    this.storage.data[key] = {...this.storage.data[key], ...updateData};
    this.write();
  }

  /**
   * Clears all storage data and restarts the app
   * On Linux portable mode, closes window instead of restarting
   */
  public clearStorage(): void {
    const {appManager} = classHolder;
    this.storage.data = {...this.DEFAULT_DATA};
    this.write();
    if (isPortable() === 'linux') {
      changeWindowState('close');
    } else {
      appManager?.restart();
    }
  }

  /**
   * Writes storage data to disk and adds breadcrumb for tracking
   */
  public write() {
    try {
      this.storage.write();
    } catch (e) {
      console.error('Storage write failed:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      // Check for OOM-related errors
      if (errorMessage.includes('memory') || errorMessage.includes('heap') || errorMessage.includes('allocation')) {
        applicationIpc.send.showToast('Failed to save configs: Out of memory. Try restarting the app.', 'error');
      } else {
        applicationIpc.send.showToast(`Failed to save app configs: ${errorMessage}`, 'error');
      }
    }
  }
}

export default BaseStorage;
