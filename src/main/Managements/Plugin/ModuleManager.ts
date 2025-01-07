import path from 'node:path';

import {ipcMain} from 'electron';
import {isEmpty} from 'lodash';

import {APP_BUILD_NUMBER} from '../../../cross/CrossConstants';
import {MainModuleImportType, ModulesInfo} from '../../../cross/CrossTypes';
import {toMs} from '../../../cross/CrossUtils';
import {modulesChannels} from '../../../cross/IpcChannelAndTypes';
import {LynxApiUpdate} from '../../../renderer/src/App/Modules/types';
import {appManager, storageManager} from '../../index';
import {getAppDirectory} from '../AppDataManager';
import GitManager from '../GitManager';
import {BasePluginManager} from './BasePluginManager';

export default class ModuleManager extends BasePluginManager<ModulesInfo> {
  private checkInterval?: NodeJS.Timeout = undefined;
  private availableUpdates: string[] = [];

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

  public async checkForCardsUpdate(updateTypes: {id: string; type: 'git' | 'stepper'}[]) {
    const installedCards = storageManager.getData('cards').installedCards;
    this.availableUpdates = [];

    for (const card of installedCards) {
      try {
        const {id, dir} = card;
        const method = this.getMethodsById(id)?.updateAvailable;
        const updateType = updateTypes.find(update => update.id === id)?.type;
        if (!updateType || updateType === 'git') {
          const isAvailable = await GitManager.isUpdateAvailable(dir!);
          if (isAvailable) {
            this.availableUpdates.push(id);
          }
        } else if (method) {
          const lynxApi: LynxApiUpdate = {
            isPullAvailable: GitManager.isUpdateAvailable(dir),
            storage: {
              get: (key: string) => storageManager.getCustomData(key),
              set: (key: string, data: any) => storageManager.setCustomData(key, data),
            },
          };
          const isAvailable = await method(lynxApi);
          if (isAvailable) {
            this.availableUpdates.push(id);
          }
        }
      } catch (e) {
        console.error(e);
      }
      appManager.getWebContent()?.send(modulesChannels.onCardsUpdateAvailable, this.availableUpdates);
    }
  }

  public async cardsUpdateInterval(updateType: {id: string; type: 'git' | 'stepper'}[]) {
    if (!this.checkInterval && !isEmpty(updateType)) {
      await this.checkForCardsUpdate(updateType);
      this.checkInterval = setInterval(() => this.checkForCardsUpdate(updateType), toMs(30, 'minutes'));
    }
  }
}
