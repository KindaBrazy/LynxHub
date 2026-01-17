import path from 'node:path';

import {FSWatcher, watch} from 'chokidar';
import {promises} from 'graceful-fs';
import lodash from 'lodash';

import {InstalledCard, InstalledCards} from '../../../cross/StorageTypes';
import classHolder from '../../core/class_holder';
import {getAbsolutePath, getExePath, isPortable} from '../../utils';
import AddBreadcrumb_Main from '../../utils/breadcrumbs';

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
      this.startWatcherForDir(dir);
    });
  }

  /**
   * Starts a watcher for a single directory with error handling.
   */
  private startWatcherForDir(dir: string, usePolling: boolean = false): void {
    try {
      const watchOptions = {
        depth: 0,
        persistent: true,
        usePolling,
        interval: usePolling ? 5000 : undefined,
        awaitWriteFinish: usePolling ? true : undefined,
        ignored: (watchPath: string) => {
          const isPageFile = watchPath.includes('pagefile.sys');
          const isSystemDir = watchPath.includes('System Volume Information') || watchPath.includes('Recovery');
          return isPageFile || isSystemDir;
        },
      };

      const watcher = watch(dir, watchOptions);

      watcher.on('unlinkDir', this.handleUnlinkedDir);
      watcher.on('error', error => {
        const errCode = (error as NodeJS.ErrnoException).code;
        console.warn(`[DataValidator] Watcher error for ${dir}:`, errCode || error);

        // Handle permission/access errors gracefully - don't crash, just log and skip
        // EINVAL can occur when trying to lstat system files like pagefile.sys
        if (errCode === 'EPERM' || errCode === 'EACCES' || errCode === 'ENOENT' || errCode === 'EINVAL') {
          AddBreadcrumb_Main(`[DataValidator] Watcher error for ${dir}: ${errCode}`);
        }
      });

      this.watchers.push(watcher);
    } catch (error) {
      const errCode = (error as NodeJS.ErrnoException).code;

      if (errCode === 'ENOSPC') {
        console.warn(`[DataValidator] ENOSPC hit for directory: ${dir}. Falling back to polling.`);
        AddBreadcrumb_Main('[DataValidator] ENOSPC hit for directory: ' + dir + '. Falling back to polling.');

        if (!usePolling) {
          this.startWatcherForDir(dir, true);
        }
      } else if (errCode === 'EPERM' || errCode === 'EACCES') {
        // Permission denied - skip this directory silently
        console.warn(`[DataValidator] Permission denied for ${dir}, skipping watcher.`);
        AddBreadcrumb_Main(`[DataValidator] Permission denied for ${dir}, skipping watcher.`);
      } else {
        console.error(`[DataValidator] Failed to start watcher for ${dir}:`, error);
      }
    }
  }

  /**
   * Handles the event when a watched directory is unlinked (removed).
   * @param {string} unlinkedPath - The path of the unlinked directory
   */
  private handleUnlinkedDir = (unlinkedPath: string): void => {
    const {storageManager} = classHolder;
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

    const {moduleManager} = classHolder;

    for (const card of cards) {
      const isInstalledMethod = moduleManager?.getMethodsById(card.id)?.().isInstalled;
      if (isInstalledMethod) {
        const installed = await isInstalledMethod(() => onInstalledDirExist(card));
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
    const {storageManager} = classHolder;
    try {
      let installedCards: InstalledCards = storageManager.getData('cards').installedCards;
      if (isPortable()) {
        installedCards = installedCards.map(card => {
          return {id: card.id, dir: getAbsolutePath(getExePath(), card.dir || '')};
        });
      }

      const validCards = await this.validateCards(installedCards);

      if (!lodash.isEqual(installedCards, validCards)) {
        storageManager.updateData('cards', {installedCards: validCards});
      }
    } catch (error) {
      console.error('[DataValidator - checkAndWatch]: Failed to validate cards:', error);
      AddBreadcrumb_Main(`[DataValidator] checkAndWatch error: ${error}`);
    }
  }

  /** Restarts the watching process when cards have changed. */
  public changedCards(): void {
    this.stopWatching();
    this.checkAndWatch().catch(error => {
      console.error('[DataValidator - changedCards]: Failed to restart watching:', error);
    });
  }
}
