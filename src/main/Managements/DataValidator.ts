import path from 'node:path';

import {FSWatcher, watch} from 'chokidar';
import lodash from 'lodash';

import {InstalledCards} from '../../cross/StorageTypes';
import {storageManager} from '../index';

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
   * @param {InstalledCards} cards - The cards whose directories should be watched
   */
  private startWatching(cards: InstalledCards): void {
    this.dirs = new Set(cards.map(card => path.resolve(path.dirname(card.dir))));

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

  /**
   * Validates the given cards by checking if their directories are Git repositories.
   * @param {InstalledCards} cards - The cards to validate
   * @returns {Promise<InstalledCards>} Resolves to an array of valid cards
   */
  private async validateCards(cards: InstalledCards): Promise<InstalledCards> {
    const validCards = cards.map(card => (path.basename(card.dir).startsWith('.') ? null : card));
    return validCards.filter(card => card !== null);
  }

  // -----------------------------------------------> Public Methods

  /**
   * Checks the validity of installed cards and sets up watchers for valid directories.
   * @returns {Promise<void>}
   */
  public async checkAndWatch(): Promise<void> {
    const installedCards: InstalledCards = storageManager.getData('cards').installedCards;

    const validCards = await this.validateCards(installedCards);

    this.startWatching(validCards);

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
