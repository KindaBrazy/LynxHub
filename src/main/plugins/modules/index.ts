import path from 'node:path';

import {MainModuleImportType, MainModules, MainModuleUtils} from '@lynx_common/types/plugins/modules';
import {InstalledCard} from '@lynx_common/types/storage';
import {isDev, toMs} from '@lynx_common/utils';
import GitManager from '@lynx_main/git';
import {removeDirRecursive, trashDir} from '@lynx_main/ipc/methods/windowUtils';
import {modulesIpc} from '@lynx_main/ipc/plugins/modules';
import classHolder from '@lynx_main/managers/classHolder';
import {getAppDataPath} from '@lynx_main/managers/dataFolder';
import {getAbsolutePath, getExePath, isPortable} from '@lynx_main/utils';
import {captureException} from '@sentry/electron/main';
import {ipcMain} from 'electron';
import {isEmpty} from 'lodash-es';
import pty from 'node-pty';

/**
 * Manages the lifecycle and communication of modules (cards).
 */
export default class ModuleManager {
  private checkInterval?: NodeJS.Timeout = undefined;
  private availableCardUpdates: string[] = [];
  private mainMethods: MainModules[] = [];

  private readonly maxImportRetries = 15;
  private importRetryCount = 0;

  private maxRetries = 15;
  private currentRetries = 0;

  /**
   * Generates utility functions for modules.
   * @returns The utility object or undefined if webContent is not available
   */
  private getUtils(): MainModuleUtils | undefined {
    const webContent = classHolder.appManager?.getWebContent();
    if (!webContent) return undefined;

    return {
      storage: {
        get: key => classHolder.storageManager.getCustomData(key),
        set: (key, data) => classHolder.storageManager.setCustomData(key, data),
      },
      ipc: {
        on(channel: string, listener: (event: any, ...args: any[]) => void) {
          return ipcMain.on(channel, listener);
        },
        handle(channel: string, listener: (event: any, ...args: any[]) => any) {
          return ipcMain.handle(channel, listener);
        },
        send(channel: string, ...args: any[]) {
          return webContent.send(channel, ...args);
        },
      },
      pty,
      removeDir: removeDirRecursive,
      trashDir,
      isPullAvailable: dir => GitManager.isUpdateAvailable(dir),
      pullDir: (dir, showTaskbarProgress = false) => {
        const gitM = new GitManager(showTaskbarProgress);
        return gitM.pull(dir);
      },
      getConfigDir: () => getAppDataPath(),
      getInstallDir: id => {
        let dir = classHolder.storageManager.getData('cards').installedCards.find(card => card.id === id)?.dir;
        if (isPortable()) {
          dir = getAbsolutePath(getExePath(), dir || '');
        }

        return dir;
      },
      getExtensions_TerminalPreCommands: (id: string) =>
        classHolder.storageManager.getData('cards').cardTerminalPreCommands.find(commands => commands.id === id)
          ?.commands || [],
    };
  }

  /**
   * Imports plugins from the specified folders.
   * @param moduleFolders - Array of folders containing modules
   */
  public async importPlugins(moduleFolders: string[]): Promise<void> {
    try {
      const utils = this.getUtils();

      if (!utils) {
        if (this.importRetryCount < this.maxImportRetries) {
          this.importRetryCount++;
          setTimeout(
            () => {
              this.importPlugins(moduleFolders);
            },
            toMs(1, 'seconds'),
          );
        } else {
          console.error('Max retries reached for importPlugins - utils unavailable');
          this.importRetryCount = 0;
        }
        return;
      }

      this.importRetryCount = 0;

      // Get disabled cards from storage
      const disabledCards = new Set(classHolder.storageManager.getData('plugin').disabledCards || []);

      if (isDev()) {
        await this.loadDevModule(utils, disabledCards);
      } else {
        await this.loadProductionModules(moduleFolders, utils, disabledCards);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Loads the development module.
   * @param utils - The module utilities
   * @param disabledCards - Set of disabled card IDs
   */
  private async loadDevModule(utils: MainModuleUtils, disabledCards: Set<string>) {
    try {
      const initialModule: MainModuleImportType = await import(/* @vite-ignore */ '../../../../module/src/main');
      const allMethods = await initialModule.default(utils);
      // Filter out disabled cards
      const enabledMethods = allMethods.filter(m => !disabledCards.has(m.id));
      this.mainMethods.push(...enabledMethods);
    } catch (e) {
      console.log('No dev module found, skipping...');
    }
  }

  /**
   * Loads production modules from folders.
   * @param moduleFolders - Array of folders containing modules
   * @param utils - The module utilities
   * @param disabledCards - Set of disabled card IDs
   */
  private async loadProductionModules(moduleFolders: string[], utils: MainModuleUtils, disabledCards: Set<string>) {
    await Promise.all(
      moduleFolders.map(async modulePath => {
        try {
          const fullModulePath = path.join(modulePath, 'scripts', 'main.mjs');
          const moduleUrl = `file://${fullModulePath}`;

          const importedModule = (await import(moduleUrl)) as MainModuleImportType;
          const allMethods = await importedModule.default(utils);

          // Filter out disabled cards
          const enabledMethods = allMethods.filter(m => !disabledCards.has(m.id));

          this.mainMethods.push(...enabledMethods);
        } catch (e) {
          console.error('Failed to load module main entry: ', modulePath, 'Error: ', e);
          captureException(e);
        }
      }),
    );
  }

  /**
   * Listens for IPC channels from the renderer.
   * Retries if webContent is not available yet.
   */
  public listenForChannels() {
    const {appManager} = classHolder;
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

  /**
   * Retrieves methods for a specific module by ID.
   * @param id - The module ID
   * @returns The module methods or undefined if not found
   */
  public getMethodsById(id: string): MainModules['methods'] | undefined {
    return this.mainMethods.find(plugin => plugin.id === id)?.methods;
  }

  /**
   * Checks if an update is available for a card.
   * @param card - The installed card
   * @param updateType - The update type (git or stepper)
   * @returns True if update is available, false otherwise
   */
  public async checkCardUpdate(card: InstalledCard, updateType: 'git' | 'stepper' | undefined): Promise<boolean> {
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

  /**
   * Checks for updates for all installed cards.
   * @param updateTypes - Array of update types for each card
   */
  private async checkAllCardsUpdate(updateTypes: {id: string; type: 'git' | 'stepper'}[]) {
    const {storageManager} = classHolder;
    let installedCards = storageManager.getData('cards').installedCards;
    if (isPortable()) {
      installedCards = installedCards.map(card => {
        return {id: card.id, dir: getAbsolutePath(getExePath(), card.dir || '')};
      });
    }
    this.availableCardUpdates = [];

    for (const card of installedCards) {
      modulesIpc.send.onCardUpdateChecking(card.id);
      const updateType = updateTypes.find(update => update.id === card.id)?.type;
      const isAvailable = await this.checkCardUpdate(card, updateType);
      if (isAvailable) this.availableCardUpdates.push(card.id);
      modulesIpc.send.onCardsUpdateAvailable(this.availableCardUpdates);
    }

    modulesIpc.send.onCardUpdateChecking('');
  }

  /**
   * Sets up an interval to check for card updates.
   * @param updateType - Array of update types for each card
   */
  public async cardsUpdateInterval(updateType: {id: string; type: 'git' | 'stepper'}[]) {
    const {storageManager} = classHolder;
    if (!this.checkInterval && !isEmpty(updateType)) {
      await this.checkAllCardsUpdate(updateType);

      const interval = storageManager.getData('cards').checkUpdateInterval || 30;
      this.checkInterval = setInterval(() => this.checkAllCardsUpdate(updateType), toMs(interval, 'minutes'));
    }
  }

  /**
   * Uninstalls a card by its ID.
   * @param id - The card ID
   */
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
