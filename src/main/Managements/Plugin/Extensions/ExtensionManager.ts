import path from 'node:path';

import {ExtensionsInfo} from '../../../../cross/CrossTypes';
import {isDev} from '../../../../cross/CrossUtils';
import {extensionsChannels} from '../../../../cross/IpcChannelAndTypes';
import {storageManager} from '../../../index';
import {BasePluginManager} from '../BasePluginManager';
import {EMenuItem, ExtensionData_Main, ExtensionImport_Main, ExtensionMainApi} from './ExtensionTypes';

export default class ExtensionManager extends BasePluginManager<ExtensionsInfo> {
  private readonly extensionsData: ExtensionData_Main;
  private readonly extensionMainApi: ExtensionMainApi;
  private readonly installedExtensions: {id: string}[];

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

    this.extensionsData = {
      listenForChannels: [],
      onAppReady: [],
      trayMenu_AddItem: [],
    };

    this.extensionMainApi = {
      listenForChannels: fc => this.extensionsData.listenForChannels.push(fc),
      onAppReady: fc => this.extensionsData.onAppReady.push(fc),
      trayMenu_AddItem: fc => this.extensionsData.trayMenu_AddItem.push(fc),
    };
  }

  protected async importPlugins(extensionFolders: string[]) {
    if (isDev()) {
      const json = await import('../../../extension/lynxExtension.json');
      const id = json.id;
      const initial: ExtensionImport_Main = await import('../../../extension/lynxExtension');
      await initial.initialExtension(this.extensionMainApi, {storageManager});
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
          await initial.initialExtension(this.extensionMainApi, {storageManager});
        }),
      );
    }
  }

  public listenForChannels() {
    for (const listenForChannels of this.extensionsData.listenForChannels) {
      listenForChannels();
    }
  }

  public async onAppReady() {
    for (const onAppReady of this.extensionsData.onAppReady) {
      await onAppReady();
    }
  }

  public getTrayItems(staticItems: EMenuItem[]) {
    for (const addTrayItem of this.extensionsData.trayMenu_AddItem) {
      const item = addTrayItem();
      staticItems.splice(item.index, 0, item.item);
    }
    return staticItems;
  }
}
