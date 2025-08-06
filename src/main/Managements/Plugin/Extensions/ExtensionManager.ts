import path from 'node:path';

import {includes, isString} from 'lodash';

import {ExtensionsInfo} from '../../../../cross/CrossTypes';
import {isDev} from '../../../../cross/CrossUtils';
import {extensionsChannels} from '../../../../cross/IpcChannelAndTypes';
import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import GitManager from '../../GitManager';
import StorageManager from '../../Storage/StorageManager';
import {BasePluginManager} from '../BasePluginManager';
import ModuleManager from '../Modules/ModuleManager';
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

  public async updateAvailableList(): Promise<string[]> {
    try {
      const updateChecks = this.installedPluginInfo.map(async plugin => {
        const hasUpdate = await GitManager.isUpdateAvailable(path.join(this.pluginPath, plugin.dir));
        return {id: plugin.info.id, hasUpdate};
      });

      const results = await Promise.all(updateChecks);
      return results.filter(result => result.hasUpdate).map(result => result.id);
    } catch (error) {
      console.error('Error checking for updates:', error);

      const errorMessage = isString(error) ? error : error.message;
      if (includes(errorMessage, 'detected dubious ownership')) this.showGitOwnershipToast();

      return [];
    }
  }

  // TODO: add try catch and show ui error message
  protected async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      const initial: ExtensionImport_Main = await import('../../../../../extension/src/main/lynxExtension');
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
    } else {
      await Promise.all(
        extensionFolders.map(async extensionPath => {
          const fullExtensionPath = path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs');

          const extensionUrl = `file://${fullExtensionPath}`;

          const initial: ExtensionImport_Main = await import(extensionUrl);

          await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
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
