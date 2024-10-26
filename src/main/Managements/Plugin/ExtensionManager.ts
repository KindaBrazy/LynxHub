import path from 'node:path';

import compact from 'lodash/compact';

import {ExtensionsInfo, MainExtensions} from '../../../cross/CrossTypes';
import {extensionsChannels} from '../../../cross/IpcChannelAndTypes';
import {getAppDirectory} from '../AppDataManager';
import {BasePluginManager} from './BasePluginManager';

export default class ExtensionManager extends BasePluginManager<ExtensionsInfo, MainExtensions> {
  public static getExtensionsPath() {
    return getAppDirectory('Extensions');
  }

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
  }

  protected async importPlugins(extensionFolders: string[]) {
    const importedExtensions = await Promise.all(
      extensionFolders.map(async extensionPath => {
        const id = this.installedPluginInfo.find(plugin => plugin.dir === extensionPath)?.info.id;
        if (!id) return;
        return {
          id,
          methods: await import(`file://${path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs')}`),
        };
      }),
    );

    compact(importedExtensions).forEach((importedExtension: MainExtensions) => {
      this.mainMethods.push({id: importedExtension.id, methods: importedExtension.methods});
    });
  }

  public listenForChannels() {
    this.mainMethods.forEach(methods => methods.methods.listenForChannels());
  }
}
