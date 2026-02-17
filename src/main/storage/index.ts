import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {APP_NAME} from '@lynx_common/consts';
import {Get_Default_Hotkeys} from '@lynx_common/consts/hotkeys';
import {CustomRunBehaviorData, CustomRunBehaviorData_Legacy, FavIcons} from '@lynx_common/types/ipc';
import StorageTypes from '@lynx_common/types/storage';
import {applicationIpc} from '@lynx_main/ipc/application';
import {changeWindowState} from '@lynx_main/ipc/methods/windowUtils';
import classHolder from '@lynx_main/managers/classHolder';
import {encryptString, encryptStrings, getAbsolutePath, getExePath, getUserAgent, isPortable} from '@lynx_main/utils';
import {app} from 'electron';
import fs from 'graceful-fs';
import lodash, {isEmpty} from 'lodash';
import {LowSync} from 'lowdb';
import {JSONFileSyncPreset} from 'lowdb/node';

/**
 * Base storage class handling low-level storage operations, migrations, and data persistence
 */
class BaseStorage {
  private readonly storage: LowSync<StorageTypes>;

  private readonly CURRENT_VERSION: number = 0.95;
  private migratedTo: number = 0; // Tracks migration state for deferred operations

  /**
   * Migration functions ordered by version
   */
  private readonly migrations = new Map<number, () => void>([
    [0.4, () => this.migrate_0_4()],
    [0.5, () => this.migrate_0_5()],
    [0.6, () => this.migrate_0_6()],
    [0.7, () => this.migrate_0_7()],
    [0.81, () => this.migrate_0_81()],
    [0.82, () => this.migrate_0_82()],
    [0.83, () => this.migrate_0_83()],
    [0.84, () => this.migrate_0_84()],
    [0.85, () => this.migrate_0_85()],
    [0.86, () => this.migrate_0_86()],
    [0.87, () => this.migrate_0_87()],
    [0.88, () => this.migrate_0_88()],
    [0.89, () => this.migrate_0_89()],
    [0.9, () => this.migrate_0_9()],
    [0.91, () => this.migrate_0_91()],
    [0.92, () => this.migrate_0_92()],
    [0.93, () => this.migrate_0_93()],
    [0.94, () => this.migrate_0_94()],
    [0.95, () => this.migrate_0_95()],
  ]);

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
      hotkeys: Get_Default_Hotkeys(),
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
    this.runStorageMigrations();
  }

  /**
   * Called after app is ready to perform deferred migrations that require app initialization
   */
  public completeDeferredMigrations() {
    // Deferred encryption migration: encrypt browser data after app is ready
    if (this.migratedTo === 0.84) {
      const {recentAddress, favoriteAddress, historyAddress, favIcons} = this.getData('browser');

      this.updateData('browser', {
        recentAddress: encryptStrings(recentAddress),
        favoriteAddress: encryptStrings(favoriteAddress),
        historyAddress: encryptStrings(historyAddress),
        favIcons: favIcons.map(item => ({
          url: encryptString(item.url),
          favIcon: encryptString(item.favIcon),
        })),
      });

      this.migratedTo = 0;
    }
  }

  /**
   * Migrates storage data from older versions to current version
   * Migrations are applied sequentially based on stored version
   */
  private runStorageMigrations() {
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

      // Apply all necessary migrations sequentially using migration chain
      for (const [version, migrationFn] of this.migrations.entries()) {
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

  private migrate_0_4() {
    this.storage.data.terminal = this.DEFAULT_DATA.terminal;
  }

  private migrate_0_5() {
    this.storage.data.cards.duplicated = [];
  }

  private migrate_0_6() {
    this.storage.data.app.openLastSize = false;
    this.storage.data.app.dynamicAppTitle = true;
    this.storage.data.app.lastSize = undefined;
    this.storage.data.cards.checkUpdateInterval = 30;
  }

  private migrate_0_7() {
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
    this.storage.data.app.hotkeys = Get_Default_Hotkeys();
    this.storage.data.app.openLinkExternal = false;
    this.storage.data.cards.zoomFactor = 1;
    this.storage.data.app.hardwareAcceleration = true;
    this.storage.data.app.disableLoadingAnimations = false;
    this.storage.data.notification = {readNotifs: []};
    this.storage.data.app.collectErrors = true;
  }

  private migrate_0_81() {
    this.storage.data.terminal.closeTabOnExit = true;
  }

  private migrate_0_82() {
    const recents = this.storage.data.browser.recentAddress as unknown[] as FavIcons[];
    const urls = recents.map(recent => recent.url);
    this.storage.data.browser.favoriteAddress = [];
    this.storage.data.browser.favIcons = recents;
    this.storage.data.browser.historyAddress = urls;
    this.storage.data.browser.recentAddress = urls;
  }

  private migrate_0_83() {
    this.storage.data.cards.cardTerminalPreCommands = [];
    this.storage.data.app.addBreadcrumbs = true;
    this.migratedTo = 0.84;
  }

  private migrate_0_84() {
    this.storage.data.app.addBreadcrumbs = true;
  }

  private migrate_0_85() {
    this.storage.data.app.inited = false;
  }

  private migrate_0_86() {
    // @ts-expect-error: in old versions, there isn't disable cards
    this.storage.data.plugin = {migrated: false};
  }

  private migrate_0_87() {
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
  }

  private migrate_0_88() {
    this.storage.data.terminal.cdHistory = [];
  }

  private migrate_0_89() {
    if (!this.storage.data.terminal.quickCommands) {
      this.storage.data.terminal.quickCommands = [];
    }

    this.normalizeCustomRunBehavior();
    this.mergeDefaultHotkeys();
  }

  private migrate_0_9() {
    this.storage.data.performance = this.DEFAULT_DATA.performance;
  }

  private migrate_0_91() {
    if (!this.storage.data.browser.downloadLocation) {
      this.storage.data.browser.downloadLocation = join(app.getPath('downloads'), APP_NAME);
    }
    if (!this.storage.data.browser.downloadBehavior) {
      this.storage.data.browser.downloadBehavior = 'default';
    }
    if (!this.storage.data.browser.clearedDownloads) {
      this.storage.data.browser.clearedDownloads = [];
    }
  }

  private migrate_0_92() {
    if (!this.storage.data.browser.volumeSettings) {
      this.storage.data.browser.volumeSettings = {
        globalMuted: false,
        tabVolumes: {},
      };
    }
  }

  private migrate_0_93() {
    if (!this.storage.data.plugin.disabledCards) {
      this.storage.data.plugin.disabledCards = [];
    }
  }

  private migrate_0_94() {
    this.mergeDefaultHotkeys();
  }

  private migrate_0_95() {
    if (this.storage.data.terminal.enableLigatures === undefined) {
      this.storage.data.terminal.enableLigatures = true;
    }
  }

  /**
   * Helper: Normalizes customRunBehavior.urlCatch.moduleDelay
   */
  private normalizeCustomRunBehavior() {
    const behavior = this.storage.data.cardsConfig.customRunBehavior as CustomRunBehaviorData[];
    if (!isEmpty(behavior)) {
      this.storage.data.cardsConfig.customRunBehavior = behavior.map(item => {
        const urlCatch = item.urlCatch || ({} as CustomRunBehaviorData['urlCatch']);

        return {
          ...item,
          urlCatch: {
            ...urlCatch,
            moduleDelay: urlCatch.moduleDelay && Number.isFinite(urlCatch.moduleDelay) ? urlCatch.moduleDelay : 0,
          },
        } as CustomRunBehaviorData;
      });
    }
  }

  /**
   * Helper: Merges default hotkeys with existing ones
   */
  private mergeDefaultHotkeys() {
    const currentHotkeys = this.storage.data.app.hotkeys || [];
    const defaultHotkeys = Get_Default_Hotkeys();

    const currentNames = currentHotkeys.map(h => h.name);
    const mergedHotkeys = [...currentHotkeys];

    defaultHotkeys.forEach(def => {
      if (!currentNames.includes(def.name)) {
        mergedHotkeys.push(def);
      }
    });

    this.storage.data.app.hotkeys = mergedHotkeys;
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
