import path from 'node:path';

import {ipcMain} from 'electron';
import {isEmpty} from 'lodash';
import pty from 'node-pty';

import {APP_BUILD_NUMBER} from '../../../cross/CrossConstants';
import {MainModuleImportType, ModulesInfo} from '../../../cross/CrossTypes';
import {toMs} from '../../../cross/CrossUtils';
import {modulesChannels} from '../../../cross/IpcChannelAndTypes';
import {InstalledCard} from '../../../cross/StorageTypes';
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
            pty,
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

  public async checkCardUpdate(card: InstalledCard, updateType: 'git' | 'stepper' | undefined) {
    try {
      const {id, dir} = card;
      const method = this.getMethodsById(id)?.updateAvailable;
      if (!updateType || updateType === 'git') {
        return await GitManager.isUpdateAvailable(dir!);
      } else if (method) {
        const lynxApi: LynxApiUpdate = {
          isPullAvailable: GitManager.isUpdateAvailable(dir),
          storage: {
            get: (key: string) => storageManager.getCustomData(key),
            set: (key: string, data: any) => storageManager.setCustomData(key, data),
          },
          pty,
        };
        return await method(lynxApi);
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async checkAllCardsUpdate(updateTypes: {id: string; type: 'git' | 'stepper'}[]) {
    const installedCards = storageManager.getData('cards').installedCards;
    this.availableUpdates = [];

    for (const card of installedCards) {
      const updateType = updateTypes.find(update => update.id === card.id)?.type;
      const isAvailable = await this.checkCardUpdate(card, updateType);
      if (isAvailable) this.availableUpdates.push(card.id);
      appManager.getWebContent()?.send(modulesChannels.onCardsUpdateAvailable, this.availableUpdates);
    }
  }

  public async cardsUpdateInterval(updateType: {id: string; type: 'git' | 'stepper'}[]) {
    if (!this.checkInterval && !isEmpty(updateType)) {
      await this.checkAllCardsUpdate(updateType);

      const interval = storageManager.getData('cards').checkUpdateInterval || 30;
      this.checkInterval = setInterval(() => this.checkAllCardsUpdate(updateType), toMs(interval, 'minutes'));
    }
  }
}
