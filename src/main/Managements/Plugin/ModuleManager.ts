import path from 'node:path';

import {ipcMain} from 'electron';

import {APP_BUILD_NUMBER} from '../../../cross/CrossConstants';
import {MainModuleImportType, MainModules, ModulesInfo} from '../../../cross/CrossTypes';
import {modulesChannels} from '../../../cross/IpcChannelAndTypes';
import {appManager} from '../../index';
import {getAppDirectory} from '../AppDataManager';
import {BasePluginManager} from './BasePluginManager';

export default class ModuleManager extends BasePluginManager<ModulesInfo, MainModules> {
  public static getModulesPath() {
    return getAppDirectory('Modules');
  }

  constructor() {
    super(
      5102,
      'lynxModule.json',
      'scripts/main.mjs',
      'scripts/renderer.mjs',
      modulesChannels.onReload,
      modulesChannels.onUpdatedModules,
      'Modules',
    );
  }

  protected async importPlugins(moduleFolders: string[]) {
    const importedModules = await Promise.all(
      moduleFolders.map(modulePath => import(`file://${path.join(modulePath, 'scripts', 'main.mjs')}`)),
    );

    importedModules.forEach((importedModule: MainModuleImportType) => {
      importedModule.setCurrentBuild?.(APP_BUILD_NUMBER);
      this.mainMethods = [...this.mainMethods, ...importedModule.default];
    });
  }

  public listenForChannels() {
    const listen = () => {
      const webContent = appManager.getWebContent();
      if (webContent) {
        for (const {methods} of this.mainMethods) {
          methods.mainIpc?.({
            on(channel: string, listener: (event: any, ...args: any[]) => void) {
              return ipcMain.on(channel, listener);
            },
            handle(channel: string, listener: (event: any, ...args: any[]) => any) {
              return ipcMain.handle(channel, listener);
            },
            send(channel: string, listener: (event: any, ...args: any[]) => void) {
              return webContent.send(channel, listener);
            },
          });
        }
      } else {
        setTimeout(() => {
          listen();
        }, 1000);
      }
    };

    listen();
  }
}
