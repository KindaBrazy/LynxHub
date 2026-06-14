import {join} from 'node:path';

import {APP_NAME} from '@lynx_common/consts';
import {isDev} from '@lynx_common/utils';
import MainWindowManager from '@lynx_main/mainWindow';
import BaseStorage from '@lynx_main/storage/index';
import StorageManager from '@lynx_main/storage/storageOperations';
import {getExePath, isPortable} from '@lynx_main/utils';
import {app} from 'electron';
import {JSONFileSyncPreset} from 'lowdb/node';
import * as pty from 'node-pty';

import ModuleManager from '../modules';
import {MainExtensionUtils} from './types';

/**
 * Utility class implementation for extensions.
 * Provides access to core managers and node-pty.
 */
export default class ExtensionUtils implements MainExtensionUtils {
  public nodePty = pty;
  private readonly extensionName: string;

  private storageResolver!: (manager: StorageManager) => void;
  private appResolver!: (manager: MainWindowManager) => void;
  private moduleResolver!: (manager: ModuleManager) => void;

  private readonly storagePromise: Promise<StorageManager>;
  private readonly appPromise: Promise<MainWindowManager>;
  private readonly modulePromise: Promise<ModuleManager>;

  constructor(extensionName: string) {
    this.extensionName = extensionName;
    this.storagePromise = new Promise(resolve => {
      this.storageResolver = resolve;
    });
    this.appPromise = new Promise(resolve => {
      this.appResolver = resolve;
    });
    this.modulePromise = new Promise(resolve => {
      this.moduleResolver = resolve;
    });
  }

  public getStorageManager(): Promise<StorageManager> {
    return this.storagePromise;
  }

  public getAppManager(): Promise<MainWindowManager> {
    return this.appPromise;
  }

  public getModuleManager(): Promise<ModuleManager> {
    return this.modulePromise;
  }

  public setStorageManager(manager: StorageManager): void {
    if (this.storageResolver) {
      const extensionName = this.extensionName;
      const extensionStorageFile = isDev() ? `${extensionName}-Dev.config` : `${extensionName}.config`;
      const extensionStoragePath = isPortable()
        ? join(getExePath(), `${APP_NAME}_Data`, extensionStorageFile)
        : join(app.getPath('userData'), extensionStorageFile);

      // Initialize LowSync database for extension
      const extensionDb = JSONFileSyncPreset<Record<string, any>>(extensionStoragePath, {});
      extensionDb.read();

      // Register extension database globally
      BaseStorage.extensionStorages.set(extensionName, extensionDb);

      // Create Proxy wrapper for storage manager
      const extensionStorageManager = new Proxy(manager, {
        get(target, prop, receiver) {
          if (prop === 'getCustomData') {
            return (id: string) => {
              // Register key association
              BaseStorage.keyToExtensionMap.set(id, extensionName);

              // Lazy migration from main storage
              if (extensionDb.data[id] === undefined) {
                const mainStorage = (target as any).storage;
                const mainData = mainStorage && mainStorage.data ? mainStorage.data[id] : undefined;
                if (mainData !== undefined) {
                  console.log(
                    `Migrating extension data for key '${id}' of extension ` +
                      `'${extensionName}' to dedicated config file...`,
                  );
                  extensionDb.data[id] = mainData;
                  extensionDb.write();

                  // Remove from main storage
                  if (mainStorage && mainStorage.data) {
                    delete mainStorage.data[id];
                    target.write();
                  }
                }
              }

              return extensionDb.data[id];
            };
          }
          if (prop === 'setCustomData') {
            return (id: string, data: any) => {
              // Register key association
              BaseStorage.keyToExtensionMap.set(id, extensionName);

              // Lazy migration check on set (to avoid overwriting main storage or left-over data)
              const mainStorage = (target as any).storage;
              if (mainStorage && mainStorage.data && id in mainStorage.data) {
                delete mainStorage.data[id];
                target.write();
              }

              extensionDb.data[id] = data;
              extensionDb.write();
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });

      this.storageResolver(extensionStorageManager as unknown as StorageManager);
    }
  }

  public setAppManager(manager: MainWindowManager): void {
    if (this.appResolver) {
      this.appResolver(manager);
    }
  }

  public setModuleManager(manager: ModuleManager): void {
    if (this.moduleResolver) {
      this.moduleResolver(manager);
    }
  }
}
