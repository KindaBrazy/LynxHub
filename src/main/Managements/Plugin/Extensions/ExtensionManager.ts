import path from 'node:path';

import {ExtensionsInfo} from '../../../../cross/CrossTypes';
import {isDev} from '../../../../cross/CrossUtils';
import {extensionsChannels} from '../../../../cross/IpcChannelAndTypes';
import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import GitManager from '../../GitManager';
import StorageManager from '../../Storage/StorageManager';
import {BasePluginManager} from '../BasePluginManager';
import ModuleManager from '../ModuleManager';
import ExtensionApi from './ExtensionApi';
import {EMenuItem, ExtensionImport_Main} from './ExtensionTypes_Main';
import ExtensionUtils from './ExtensionUtils';

export default class ExtensionManager extends BasePluginManager<ExtensionsInfo> {
  private readonly extensionUtils: ExtensionUtils;
  private readonly extensionApi: ExtensionApi;

  constructor() {
    super(
      5103,
      'lynxExtension.json',
      'scripts/main/mainEntry.mjs',
      'scripts/renderer/rendererEntry.mjs',
      extensionsChannels.onReload,
      extensionsChannels.onUpdatedExtensions,
      'Extensions',
    );

    this.extensionUtils = new ExtensionUtils();
    this.extensionApi = new ExtensionApi();
  }

  protected async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      const initial: ExtensionImport_Main = await import('../../../extension/lynxExtension');
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
    } else {
      await Promise.all(
        extensionFolders.map(async extensionPath => {
          const initial: ExtensionImport_Main = await import(
            `file://${path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs')}`
          );
          await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
        }),
      );
    }
  }

  public async updateAvailableList(): Promise<string[]> {
    try {
      const updateChecks = this.installedPluginInfo.map(async plugin => {
        const hasUpdate = await GitManager.isUpdateAvailable(plugin.dir);
        return {id: plugin.info.id, hasUpdate};
      });

      const results = await Promise.all(updateChecks);
      return results.filter(result => result.hasUpdate).map(result => result.id);
    } catch (error) {
      console.error('Error checking for updates:', error);
      return [];
    }
  }

  //#region Utils
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

  //#endregion

  //#region Api
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

  //#endregion
}
