import path from 'node:path';

import {isDev} from '@lynx_common/utils';
import ElectronAppManager from '@lynx_main/mainWindow';
import StorageManager from '@lynx_main/storage/storageOperations';
import {captureException} from '@sentry/electron/main';

import ModuleManager from '../modules';
import ExtensionApi from './api';
import {EMenuItem, ExtensionImport_Main} from './types';
import ExtensionUtils from './utils';

export default class ExtensionManager {
  private readonly extensionUtils: ExtensionUtils;
  private readonly extensionApi: ExtensionApi;

  constructor() {
    this.extensionUtils = new ExtensionUtils();
    this.extensionApi = new ExtensionApi();
  }

  private async importDevExtension() {
    try {
      const initial: ExtensionImport_Main = await import(
        /* @vite-ignore */ '../../../../extension/src/main/lynxExtension'
      );
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
    } catch (e) {
      console.log('No dev extension found, skipping...');
    }
  }

  private async importProductionExtension(extensionPath: string) {
    try {
      const fullExtensionPath = path.join(extensionPath, 'scripts', 'main', 'mainEntry.cjs');
      const extensionUrl = `file://${fullExtensionPath}`;
      const initial: ExtensionImport_Main = await import(extensionUrl);
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
    } catch (e) {
      // TODO: show ui to user failed to load
      console.error('Failed to load extension main entry: ', extensionPath, 'Error: ', e);
      captureException(e);
    }
  }

  public async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      await this.importDevExtension();
    } else {
      await Promise.all(extensionFolders.map(folder => this.importProductionExtension(folder)));
    }
  }

  public setStorageManager(manager: StorageManager) {
    this.extensionUtils.setStorageManager(manager);
  }

  public setAppManager(manager: ElectronAppManager) {
    this.extensionUtils.setAppManager(manager);
  }

  public setModuleManager(manager: ModuleManager) {
    this.extensionUtils.setModuleManager(manager);
  }

  public listenForChannels() {
    this.extensionApi.listenForChannels();
  }

  public async onAppReady() {
    await this.extensionApi.onAppReady();
  }

  public onReadyToShow() {
    this.extensionApi.onReadyToShow();
  }

  public getTrayItems(staticItems: EMenuItem[]) {
    return this.extensionApi.getTrayItems(staticItems);
  }
}
