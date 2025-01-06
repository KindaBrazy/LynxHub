import path from 'node:path';

import {FSWatcher, watch} from 'chokidar';
import {promises} from 'graceful-fs';
import lodash from 'lodash';

import {InstalledCard, InstalledCards} from '../../cross/StorageTypes';
import {LynxApiInstalled} from '../../renderer/src/App/Modules/types';
import {moduleManager, storageManager} from '../index';

type PathCards = {
  id: string;
  dir: string;
};

/**
 * Handle the validation and watching of installed cards.
 * Ensure that only valid card directories are tracked and update storage accordingly.
 */
export class ValidateCards {
  // -----------------------------------------------> Private Properties
  private watchers: FSWatcher[] = [];
  private dirs: Set<string> = new Set();

  // -----------------------------------------------> Private Methods

  /**
   * Starts watching the directories of the given cards for changes.
   */
  private startWatching(): void {
    this.dirs.forEach(dir => {
      const watcher = watch(dir, {depth: 0, persistent: true});
      watcher.on('unlinkDir', this.handleUnlinkedDir);
      this.watchers.push(watcher);
    });
  }

  /**
   * Handles the event when a watched directory is unlinked (removed).
   * @param {string} unlinkedPath - The path of the unlinked directory
   */
  private handleUnlinkedDir = (unlinkedPath: string): void => {
    storageManager.removeInstalledCardByPath(unlinkedPath);
  };

  /** Stops all active directory watchers. */
  private stopWatching(): void {
    this.watchers.forEach(watcher => watcher.close());
    this.watchers = [];
  }

  private async dirExist(dir: string | undefined) {
    if (!dir) return false;
    try {
      await promises.access(dir);
      return true;
    } catch (err) {
      console.error('[DataValidator - dirExist]: ', err);
      return false;
    }
  }

  /**
   * Validates the given cards by checking if their directories are Git repositories.
   * @param {InstalledCards} cards - The cards to validate
   * @returns {Promise<InstalledCards>} Resolves to an array of valid cards
   */
  private async validateCards(cards: InstalledCards): Promise<InstalledCards> {
    const pathCards: PathCards[] = [];

    const moduleCards: InstalledCards = [];

    const onInstalledDirExist = async (card: InstalledCard) => {
      if (card.dir) {
        pathCards.push({id: card.id, dir: card.dir});
        return await this.dirExist(card.dir);
      }

      return false;
    };

    for (const card of cards) {
      const isInstalledMethod = moduleManager.getMethodsById(card.id)?.isInstalled;
      if (isInstalledMethod) {
        const lynxApi: LynxApiInstalled = {
          installedDirExistAndWatch: onInstalledDirExist(card),
          storage: {get: storageManager.getCustomData, set: storageManager.setCustomRun},
        };
        const installed = await isInstalledMethod(lynxApi);
        if (installed) moduleCards.push(card);
      } else if (card.dir && !path.basename(card.dir).startsWith('.')) {
        const exist = await this.dirExist(card.dir);
        if (exist) {
          pathCards.push({id: card.id, dir: card.dir!});
        }
      }
    }

    this.dirs = new Set(pathCards.map(card => path.resolve(path.dirname(card.dir!))));

    this.startWatching();

    return [...pathCards, ...moduleCards];
  }

  // -----------------------------------------------> Public Methods

  /**
   * Checks the validity of installed cards and sets up watchers for valid directories.
   * @returns {Promise<void>}
   */
  public async checkAndWatch(): Promise<void> {
    const installedCards: InstalledCards = storageManager.getData('cards').installedCards;

    const validCards = await this.validateCards(installedCards);

    if (!lodash.isEqual(installedCards, validCards)) {
      storageManager.updateData('cards', {installedCards: validCards});
    }
  }

  /** Restarts the watching process when cards have changed. */
  public changedCards(): void {
    this.stopWatching();
    this.checkAndWatch();
  }
}
