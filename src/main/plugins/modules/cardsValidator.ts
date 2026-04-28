import path, {dirname, resolve} from 'node:path';

import {InstalledCard, InstalledCards} from '@lynx_common/types/storage';
import classHolder from '@lynx_main/managers/classHolder';
import {getAbsolutePath, getExePath, isPortable} from '@lynx_main/utils';
import AddBreadcrumb_Main from '@lynx_main/utils/breadcrumbs';
import {ChokidarOptions, FSWatcher, watch} from 'chokidar';
import {promises} from 'graceful-fs';
import {compact, isEqual, uniqBy} from 'lodash-es';

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
   * @param dir - The directory to watch
   * @param usePolling - Whether to use polling (fallback for ENOSPC)
   */
  private startWatcherForDir(dir: string, usePolling: boolean = false): void {
    try {
      const watchOptions: ChokidarOptions = {
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
        if (['EPERM', 'EACCES', 'ENOENT', 'EINVAL'].includes(errCode || '')) {
          AddBreadcrumb_Main(`[DataValidator] Watcher error for ${dir}: ${errCode}`);
        }
      });

      this.watchers.push(watcher);
    } catch (error) {
      const errCode = (error as NodeJS.ErrnoException).code;

      if (errCode === 'ENOSPC') {
        console.warn(`[DataValidator] ENOSPC hit for directory: ${dir}. Falling back to polling.`);
        AddBreadcrumb_Main(`[DataValidator] ENOSPC hit for directory: ${dir}. Falling back to polling.`);

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
   * @param unlinkedPath - The path of the unlinked directory
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

  /**
   * Checks if a directory exists.
   * @param dir - The directory path to check
   * @returns True if directory exists, false otherwise
   */
  private async dirExist(dir: string | undefined): Promise<boolean> {
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
   * Validates a path-based card.
   * @param card - The installed card to validate
   * @returns The path card info if valid, null otherwise
   */
  private async validateCardDir(card: InstalledCard): Promise<InstalledCard | null> {
    if (!card.dir || path.basename(card.dir).startsWith('.')) return null;

    const exist = await this.dirExist(card.dir);
    return exist ? {id: card.id, dir: card.dir} : null;
  }

  /**
   * Sets up watchers for the parent directories of the valid cards.
   * @param dirs - The valid path-based cards
   */
  private setupDirectoryWatchers(dirs: string[]) {
    this.dirs = new Set(dirs.map(dir => resolve(dirname(dir))));
    this.startWatching();
  }

  /**
   * Validates the given cards by checking if their directories are Git repositories.
   * @param installedCards - The cards to validate
   * @returns Resolves to an array of valid cards
   */
  private async validateCards(installedCards: InstalledCards): Promise<InstalledCards> {
    const validCards: InstalledCard[] = [];

    const moduleManager = await classHolder.waitForClass('moduleManager');

    for (const card of installedCards) {
      // Check if module provided installation check
      const cardMethods = moduleManager.getMethodsById(card.id);
      const moduleMethod = cardMethods ? cardMethods().isInstalled : undefined;

      if (moduleMethod) {
        const validCard = await moduleMethod();
        if (validCard) validCards.push(card);
      } else {
        const validCard = await this.validateCardDir(card);
        if (validCard) validCards.push(card);
      }
    }

    this.setupDirectoryWatchers(compact(validCards.map(card => card.dir)));

    return validCards;
  }

  // -----------------------------------------------> Public Methods

  /**
   * Checks the validity of installed cards and sets up watchers for valid directories.
   */
  public async checkAndWatch(): Promise<void> {
    const {storageManager} = classHolder;
    try {
      let installedCards: InstalledCards = storageManager.getData('cards').installedCards;
      if (isPortable()) {
        installedCards = installedCards.map(card => {
          return {id: card.id, dir: card.dir ? getAbsolutePath(getExePath(), card.dir) : undefined};
        });
      }

      const validCards = await this.validateCards(installedCards);

      if (!isEqual(installedCards, validCards)) {
        storageManager.updateData('cards', {installedCards: uniqBy(validCards, 'id')});
      }
    } catch (error) {
      console.error('[DataValidator - checkAndWatch]: Failed to validate cards:', error);
      AddBreadcrumb_Main(`[DataValidator] checkAndWatch error: ${error}`);
    }
  }

  /** Restarts the watching process when cards have changed. */
  public changedCards(): void {
    this.stopWatching();
    this.checkAndWatch();
  }
}
