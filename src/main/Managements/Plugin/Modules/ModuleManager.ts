import path from 'node:path';

import {ipcMain} from 'electron';
import {compact, isEmpty} from 'lodash';
import pty from 'node-pty';

import {isDev, toMs} from '../../../../cross/CrossUtils';
import {modulesChannels} from '../../../../cross/IpcChannelAndTypes';
import {MainModuleImportType, MainModules, MainModuleUtils} from '../../../../cross/plugin/ModuleTypes';
import {InstalledCard} from '../../../../cross/StorageTypes';
import {appManager, storageManager} from '../../../index';
import {getAbsolutePath, getExePath, isPortable} from '../../../Utilities/Utils';
import {getAppDataPath} from '../../AppDataManager';
import GitManager from '../../Git/GitManager';
import {removeDir, trashDir} from '../../Ipc/Methods/IpcMethods';

export default class ModuleManager {
  private checkInterval?: NodeJS.Timeout = undefined;
  private availableCardUpdates: string[] = [];
  private mainMethods: MainModules[] = [];

  private getUtils() {
    const webContent = appManager?.getWebContent();

    if (!webContent) return undefined;

    const utils: MainModuleUtils = {
      storage: {
        get: key => storageManager.getCustomData(key),
        set: (key, data) => storageManager.setCustomData(key, data),
      },
      ipc: {
        on(channel: string, listener: (event: any, ...args: any[]) => void) {
          return ipcMain.on(channel, listener);
        },
        handle(channel: string, listener: (event: any, ...args: any[]) => any) {
          return ipcMain.handle(channel, listener);
        },
        send(channel: string, listener: (event: any, ...args: any[]) => void) {
          return webContent.send(channel, listener);
        },
      },
      pty,
      removeDir,
      trashDir,
      isPullAvailable: dir => GitManager.isUpdateAvailable(dir),
      pullDir: (dir, showTaskbarProgress = false) => {
        const gitM = new GitManager(showTaskbarProgress);
        return gitM.pull(dir);
      },
      getConfigDir: () => getAppDataPath(),
      getInstallDir: id => {
        let dir = storageManager.getData('cards').installedCards.find(card => card.id === id)?.dir;
        if (isPortable()) {
          dir = getAbsolutePath(getExePath(), dir || '');
        }

        return dir;
      },
      getExtensions_TerminalPreCommands: (id: string) =>
        storageManager.getData('cards').cardTerminalPreCommands.find(commands => commands.id === id)?.commands || [],
    };

    return utils;
  }

  public async importPlugins(moduleFolders: string[]) {
    try {
      const utils = this.getUtils();

      if (!utils) {
        setTimeout(
          () => {
            this.importPlugins(moduleFolders);
          },
          toMs(1, 'seconds'),
        );
        return;
      }

      if (isDev()) {
        const initialModule: MainModuleImportType = await import('../../../../../module/src/main');
        const method = await initialModule.default(utils);
        this.mainMethods.push(...method);
      } else {
        const importedModules: (MainModuleImportType | null)[] = await Promise.all(
          moduleFolders.map(async modulePath => {
            try {
              const fullModulePath = path.join(modulePath, 'scripts', 'main.mjs');
              const moduleUrl = `file://${fullModulePath}`;
              return (await import(moduleUrl)) as MainModuleImportType;
            } catch (e) {
              console.error('Failed to load module main entry: ', modulePath, 'Error: ', e);
              return null;
            }
          }),
        );

        const loadedModules = compact(importedModules);

        for (const importedModule of loadedModules) {
          const method = await importedModule.default(utils);
          this.mainMethods.push(...method);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private maxRetries = 15;
  private currentRetries = 0;

  public listenForChannels() {
    const webContent = appManager?.getWebContent();

    if (!webContent || isEmpty(this.mainMethods)) {
      if (this.currentRetries < this.maxRetries) {
        this.currentRetries++;
        setTimeout(() => {
          this.listenForChannels();
        }, 1000);
      } else {
        console.error('Max retries reached for modules listenForChannels');
        this.currentRetries = 0;
      }
      return;
    }

    this.currentRetries = 0;

    this.mainMethods.forEach(({methods}) => methods().mainIpc?.());
  }

  public getMethodsById(id: string): MainModules['methods'] | undefined {
    return this.mainMethods.find(plugin => plugin.id === id)?.methods;
  }

  public async checkCardUpdate(card: InstalledCard, updateType: 'git' | 'stepper' | undefined) {
    try {
      const {id, dir} = card;
      const method = this.getMethodsById(id)?.().updateAvailable;
      if (!updateType || updateType === 'git') {
        return await GitManager.isUpdateAvailable(dir!);
      } else if (method) {
        return await method();
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async checkAllCardsUpdate(updateTypes: {id: string; type: 'git' | 'stepper'}[]) {
    let installedCards = storageManager.getData('cards').installedCards;
    if (isPortable()) {
      installedCards = installedCards.map(card => {
        return {id: card.id, dir: getAbsolutePath(getExePath(), card.dir || '')};
      });
    }
    this.availableCardUpdates = [];

    for (const card of installedCards) {
      const updateType = updateTypes.find(update => update.id === card.id)?.type;
      const isAvailable = await this.checkCardUpdate(card, updateType);
      if (isAvailable) this.availableCardUpdates.push(card.id);
      appManager?.getWebContent()?.send(modulesChannels.onCardsUpdateAvailable, this.availableCardUpdates);
    }
  }

  public async cardsUpdateInterval(updateType: {id: string; type: 'git' | 'stepper'}[]) {
    if (!this.checkInterval && !isEmpty(updateType)) {
      await this.checkAllCardsUpdate(updateType);

      const interval = storageManager.getData('cards').checkUpdateInterval || 30;
      this.checkInterval = setInterval(() => this.checkAllCardsUpdate(updateType), toMs(interval, 'minutes'));
    }
  }

  public async uninstallCardByID(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const uninstall = this.getMethodsById(id)?.().uninstall;
      if (uninstall) {
        uninstall().then(resolve).catch(reject);
      } else {
        reject(new Error(`Card with ID "${id}" does not have an uninstall method.`));
      }
    });
  }
}
