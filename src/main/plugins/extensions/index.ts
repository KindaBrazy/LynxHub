import path from 'node:path';

import {isDev} from '@lynx_common/utils';
import ElectronAppManager from '@lynx_main/mainWindow';
import StorageManager from '@lynx_main/storage/storageOperations';
import {captureException} from '@sentry/electron/main';

import ModuleManager from '../modules';
import ExtensionApi from './api';
import {mainIpcApi} from './ipcApi';
import {ElectronMenuItem, ExtensionImport_Main} from './types';
import ExtensionUtils from './utils';

/**
 * Manages the lifecycle and loading of extensions (plugins).
 * Handles importing, initialization, and communication with extensions.
 */
export default class ExtensionManager {
  private readonly extensionUtils: ExtensionUtils;
  private readonly extensionApi: ExtensionApi;

  constructor() {
    this.extensionUtils = new ExtensionUtils();
    this.extensionApi = new ExtensionApi();
  }

  /**
   * Imports the development extension if in dev mode.
   * Scans the specific local path for the extension entry point.
   */
  private async importDevExtension(): Promise<void> {
    try {
      const devPath = '../../../../extension/src/main/lynxExtension';
      const initial: ExtensionImport_Main = await import(
        /* @vite-ignore */ devPath
      );
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils, mainIpcApi);
    } catch (e) {
      console.log('No dev extension found or failed to load, skipping...', e);
    }
  }

  /**
   * Imports a production extension from the given path.
   * @param extensionPath - The root path of the extension.
   */
  private async importProductionExtension(extensionPath: string): Promise<void> {
    try {
      const fullExtensionPath = path.join(extensionPath, 'scripts', 'main', 'mainEntry.cjs');
      const extensionUrl = `file://${fullExtensionPath}`;
      const initial: ExtensionImport_Main = await import(extensionUrl);
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils, mainIpcApi);
    } catch (e) {
      console.error(`Failed to load extension from ${extensionPath}:`, e);
      captureException(e);
    }
  }

  /**
   * Imports and initializes all plugins/extensions.
   * @param extensionFolders - List of folder paths to load extensions from.
   */
  public async importPlugins(extensionFolders: string[]): Promise<void> {
    if (isDev()) {
      await this.importDevExtension();
    } else {
      await Promise.all(extensionFolders.map(folder => this.importProductionExtension(folder)));
    }
  }

  /**
   * Sets the StorageManager instance for extensions to use.
   * @param manager - The StorageManager instance.
   */
  public setStorageManager(manager: StorageManager): void {
    this.extensionUtils.setStorageManager(manager);
  }

  /**
   * Sets the ElectronAppManager instance for extensions to use.
   * @param manager - The ElectronAppManager instance.
   */
  public setAppManager(manager: ElectronAppManager): void {
    this.extensionUtils.setAppManager(manager);
  }

  /**
   * Sets the ModuleManager instance for extensions to use.
   * @param manager - The ModuleManager instance.
   */
  public setModuleManager(manager: ModuleManager): void {
    this.extensionUtils.setModuleManager(manager);
  }

  /**
   * Triggers the `listenForChannels` lifecycle event for all extensions.
   */
  public listenForChannels(): void {
    this.extensionApi.listenForChannels();
  }

  /**
   * Triggers the `onAppReady` lifecycle event for all extensions.
   */
  public async onAppReady(): Promise<void> {
    await this.extensionApi.onAppReady();
  }

  /**
   * Triggers the `onReadyToShow` lifecycle event for all extensions.
   */
  public onReadyToShow(): void {
    this.extensionApi.onReadyToShow();
  }

  /**
   * Retrieves and merges tray items from all extensions.
   * @param staticItems - The initial list of tray items.
   * @returns The combined list of tray items.
   */
  public getTrayItems(staticItems: ElectronMenuItem[]): ElectronMenuItem[] {
    return this.extensionApi.getTrayItems(staticItems);
  }
}
