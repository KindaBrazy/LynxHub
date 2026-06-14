import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {APP_NAME} from '@lynx_common/consts';
import {Get_Default_Hotkeys} from '@lynx_common/consts/hotkeys';
import AppStorageData, {BrowserStorage} from '@lynx_common/types/storage';
import {applicationIpc} from '@lynx_main/ipc/application';
import {changeWindowState} from '@lynx_main/ipc/methods/windowUtils';
import classHolder from '@lynx_main/managers/classHolder';
import {getAbsolutePath, getExePath, getUserAgent, isPortable} from '@lynx_main/utils';
import {app} from 'electron';
import fs from 'graceful-fs';
import {cloneDeep} from 'lodash-es';
import {LowSync} from 'lowdb';
import {JSONFileSyncPreset} from 'lowdb/node';

import {StorageMigrationManager} from './migrations';

/**
 * Base storage class handling low-level storage operations, migrations, and data persistence.
 * Uses `lowdb` for JSON file storage.
 */
class BaseStorage {
  private readonly storage: LowSync<AppStorageData>;
  private readonly browserStorage: LowSync<BrowserStorage>;
  private readonly migrationManager: StorageMigrationManager;

  private readonly DEFAULT_DATA: AppStorageData = {
    storage: {version: 0.97},
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
      customArgs: {
        global: [],
        perCard: [],
      },
    },
    app: {
      closeConfirm: true,
      closeTabConfirm: true,
      terminateAIConfirm: true,
      exitSignalConfirm: false,
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
      sendYWithExit: false,
      openLinkNewTab: false,
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
    // Determine storage file names based on environment
    const storageFile = is.dev ? `${APP_NAME}-Dev.config` : `${APP_NAME}.config`;
    const browserStorageFile = is.dev ? `${APP_NAME}-Browser-Dev.config` : `${APP_NAME}-Browser.config`;
    let storagePath = join(app.getPath('userData'), storageFile);
    let browserStoragePath = join(app.getPath('userData'), browserStorageFile);

    // Handle portable mode: store data next to executable
    if (isPortable()) {
      storagePath = join(getExePath(), `${APP_NAME}_Data`, storageFile);
      browserStoragePath = join(getExePath(), `${APP_NAME}_Data`, browserStorageFile);
      const dataFolderPath = join(getExePath(), `${APP_NAME}_Data`);

      // Ensure data folder exists
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

    // Initialize main storage without writing browser key on default creation
    const mainDefaultData = cloneDeep(this.DEFAULT_DATA);
    delete (mainDefaultData as any).browser;

    this.storage = JSONFileSyncPreset<AppStorageData>(storagePath, mainDefaultData);
    this.storage.read();

    // Initialize browser storage
    this.browserStorage = JSONFileSyncPreset<BrowserStorage>(browserStoragePath, this.DEFAULT_DATA.browser);
    this.browserStorage.read();

    // Migrate existing browser data from main configuration file to browser configuration file
    if (this.storage.data && 'browser' in this.storage.data && (this.storage.data as any).browser) {
      console.log('Migrating browser data to separate configuration file...');
      this.browserStorage.data = {
        ...this.browserStorage.data,
        ...(this.storage.data as any).browser,
      };
      this.writeBrowser();
      delete (this.storage.data as any).browser;
      this.storage.write();
      console.log('Browser data migrated and removed from main config file.');
    }

    // Define interceptor on this.storage.data to virtualize the 'browser' key
    let currentData = this.storage.data;
    const defineBrowserProperty = (obj: any) => {
      if (obj && !Object.prototype.hasOwnProperty.call(obj, 'browser')) {
        Object.defineProperty(obj, 'browser', {
          get: () => this.browserStorage.data,
          set: value => {
            this.browserStorage.data = value;
            this.writeBrowser();
          },
          configurable: true,
          enumerable: false,
        });
      }
    };

    defineBrowserProperty(currentData);

    Object.defineProperty(this.storage, 'data', {
      get: () => currentData,
      set: value => {
        currentData = value;
        defineBrowserProperty(currentData);
      },
      configurable: true,
      enumerable: true,
    });

    this.migrationManager = new StorageMigrationManager(this.storage, this.DEFAULT_DATA, () => this.write());
    this.migrationManager.runStorageMigrations(this.DEFAULT_DATA.storage.version);
  }

  /**
   * Performs deferred migrations that require the app to be fully ready.
   * Example: Encryption which depends on safeStorage availability.
   */
  public completeDeferredMigrations(): void {
    this.migrationManager.completeDeferredMigrations();
  }

  /**
   * Retrieves data from storage by key.
   * @param key - The key of the data to retrieve
   */
  public getData<K extends keyof AppStorageData>(key: K): AppStorageData[K] {
    return this.storage.data[key];
  }

  public static readonly extensionStorages = new Map<string, any>();
  public static readonly keyToExtensionMap = new Map<string, string>();

  /**
   * Retrieves custom data by ID.
   * @param id - The ID of the custom data
   */
  public getCustomData(id: string): any {
    const extensionName = BaseStorage.keyToExtensionMap.get(id);
    if (extensionName) {
      const extStorage = BaseStorage.extensionStorages.get(extensionName);
      if (extStorage) {
        return extStorage.data[id];
      }
    }
    for (const [extName, extStorage] of BaseStorage.extensionStorages.entries()) {
      if (extStorage.data && id in extStorage.data) {
        BaseStorage.keyToExtensionMap.set(id, extName);
        return extStorage.data[id];
      }
    }
    return this.storage.data[id];
  }

  /**
   * Sets custom data by ID and persists to disk.
   * @param id - The ID of the custom data
   * @param data - The data to store
   */
  public setCustomData(id: string, data: any): void {
    const extensionName = BaseStorage.keyToExtensionMap.get(id);
    if (extensionName) {
      const extStorage = BaseStorage.extensionStorages.get(extensionName);
      if (extStorage) {
        extStorage.data[id] = data;
        extStorage.write();
        return;
      }
    }
    for (const [extName, extStorage] of BaseStorage.extensionStorages.entries()) {
      if (extStorage.data && id in extStorage.data) {
        BaseStorage.keyToExtensionMap.set(id, extName);
        extStorage.data[id] = data;
        extStorage.write();
        return;
      }
    }
    this.storage.data[id] = data;
    this.write();
  }

  /**
   * Returns a deep clone of all storage data.
   * Converts relative paths to absolute paths in portable mode.
   */
  public getAll(): AppStorageData {
    const data = this.storage.data;
    const result = cloneDeep(data);
    result.browser = cloneDeep(this.browserStorage.data);

    // Convert relative paths to absolute paths in portable mode
    if (isPortable()) {
      result.cards.installedCards = result.cards.installedCards.map(card => {
        return {id: card.id, dir: getAbsolutePath(getExePath(), card.dir || '')};
      });
    }

    return result;
  }

  /**
   * Updates data for a specific key and persists to disk.
   * @param key - The key of the data to update
   * @param updateData - The partial data to merge
   */
  public updateData<K extends keyof AppStorageData>(key: K, updateData: Partial<AppStorageData[K]>): void {
    this.storage.data[key] = {...this.storage.data[key], ...updateData};
    this.write();
  }

  /**
   * Clears all storage data and restarts the app.
   * On Linux portable mode, closes window instead of restarting.
   */
  public clearStorage(): void {
    const {appManager} = classHolder;
    this.storage.data = {...this.DEFAULT_DATA};
    if (this.storage.data) {
      Object.defineProperty(this.storage.data, 'browser', {
        get: () => this.browserStorage.data,
        set: value => {
          this.browserStorage.data = value;
          this.writeBrowser();
        },
        configurable: true,
        enumerable: false,
      });
    }
    this.browserStorage.data = cloneDeep(this.DEFAULT_DATA.browser);
    this.write();
    this.writeBrowser();
    if (isPortable() === 'linux') {
      changeWindowState('close');
    } else {
      appManager?.restart();
    }
  }

  /**
   * Writes storage data to disk and adds breadcrumb for tracking.
   * Handles Out of Memory errors gracefully.
   */
  public write(): void {
    try {
      this.storage.write();
    } catch (e) {
      console.error('Storage write failed:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      // Check for OOM-related errors
      if (errorMessage.includes('memory') || errorMessage.includes('heap') || errorMessage.includes('allocation')) {
        applicationIpc.send.showToast('Failed to save configs: Out of memory. Try restarting the app.', 'danger');
      } else {
        applicationIpc.send.showToast(`Failed to save app configs: ${errorMessage}`, 'danger');
      }
    }
  }

  /**
   * Writes browser storage data to disk.
   */
  public writeBrowser(): void {
    try {
      this.browserStorage.write();
    } catch (e) {
      console.error('Browser storage write failed:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      applicationIpc.send.showToast(`Failed to save browser configs: ${errorMessage}`, 'danger');
    }
  }
}

export default BaseStorage;
