import path from 'node:path';

import {captureException} from '@sentry/electron/main';

import {isDev} from '../../../../cross/CrossUtils';
import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import StorageManager from '../../Storage/StorageManager';
import ModuleManager from '../Modules/ModuleManager';
import ExtensionApi from './ExtensionApi';
import {EMenuItem, ExtensionImport_Main} from './ExtensionTypes_Main';
import ExtensionUtils from './ExtensionUtils';

export default class ExtensionManager {
  private readonly extensionUtils: ExtensionUtils;
  private readonly extensionApi: ExtensionApi;

  constructor() {
    this.extensionUtils = new ExtensionUtils();
    this.extensionApi = new ExtensionApi();
  }

  public async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      const initial: ExtensionImport_Main = await import('../../../../../extension/src/main/lynxExtension');
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
    } else {
      await Promise.all(
        extensionFolders.map(async extensionPath => {
          try {
            const fullExtensionPath = path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs');

            const extensionUrl = `file://${fullExtensionPath}`;

            const initial: ExtensionImport_Main = await import(extensionUrl);

            await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
          } catch (e) {
            // TODO: show ui to user failed to load
            console.error('Failed to load extension main entry: ', extensionPath, 'Error: ', e);
            captureException(e);
            return;
          }
        }),
      );
    }
  }

  public setStorageManager(manager: StorageManager) {
    this.extensionUtils.setStorageManager(manager);
  }

  public setAppManager(manager: ElectronAppManager) {
    this.extensionUtils.setAppManager(manager);
  }

  public setDiscordRpcManager(manager: DiscordRpcManager) {
    this.extensionUtils.setDiscordRpcManager(manager);
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
