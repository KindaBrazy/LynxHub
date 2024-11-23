import path from 'node:path';

import {ExtensionsInfo} from '../../../../cross/CrossTypes';
import {isDev} from '../../../../cross/CrossUtils';
import {extensionsChannels} from '../../../../cross/IpcChannelAndTypes';
import DiscordRpcManager from '../../DiscordRpcManager';
import ElectronAppManager from '../../ElectronAppManager';
import StorageManager from '../../Storage/StorageManager';
import {BasePluginManager} from '../BasePluginManager';
import ModuleManager from '../ModuleManager';
import ExtensionApi from './ExtensionApi';
import {EMenuItem, ExtensionImport_Main, MainExtensions} from './ExtensionTypes';
import ExtensionUtils from './ExtensionUtils';

export default class ExtensionManager extends BasePluginManager<ExtensionsInfo> {
  private readonly installedExtensions: MainExtensions[];
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

    this.installedExtensions = [];
    this.extensionUtils = new ExtensionUtils();
    this.extensionApi = new ExtensionApi();
  }

  protected async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      const json = await import('../../../extension/lynxExtension.json');
      const id = json.id;
      const initial: ExtensionImport_Main = await import('../../../extension/lynxExtension');
      await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
      this.installedExtensions.push({id});
    } else {
      await Promise.all(
        extensionFolders.map(async extensionPath => {
          const id = this.installedPluginInfo.find(plugin => plugin.dir === extensionPath)?.info.id;
          if (!id) return;
          this.installedExtensions.push({id});
          const initial: ExtensionImport_Main = await import(
            `file://${path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs')}`
          );
          await initial.initialExtension(this.extensionApi.getApi(), this.extensionUtils);
        }),
      );
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
