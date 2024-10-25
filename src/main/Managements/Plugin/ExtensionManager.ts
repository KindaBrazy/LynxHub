import path from 'node:path';

import {ExtensionsInfo, MainExtensionImportType, MainExtensions} from '../../../cross/CrossTypes';
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
      extensionFolders.map(
        extensionPath => import(`file://${path.join(extensionPath, 'scripts', 'main', 'mainEntry.mjs')}`),
      ),
    );

    importedExtensions.forEach((importedExtension: MainExtensionImportType) => {
      this.mainMethods.push(importedExtension.default);
    });
  }
}
