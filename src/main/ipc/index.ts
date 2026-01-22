import modulesChannels, {moduleApiChannels} from '@lynx_cross/consts/ipc_channels/module';
import pluginChannels from '@lynx_cross/consts/ipc_channels/plugins';
import staticsChannels from '@lynx_cross/consts/ipc_channels/statics';
import storageChannels, {storageUtilsChannels} from '@lynx_cross/consts/ipc_channels/storage';
import utilsChannels from '@lynx_cross/consts/ipc_channels/utils';
import {CustomRunBehaviorData, PreCommands, PreOpen, RecentlyOperation, StorageOperation} from '@lynx_cross/types/ipc';
import {app, ipcMain} from 'electron';

import {ChosenArgumentsData, ConfirmMenuTypes, SubscribeStages} from '../../cross/types';
import StorageTypes, {InstalledCard} from '../../cross/types/storage';
import classHolder from '../core/class_holder';
import {getImageCacheManager} from '../core/image_cache';
import GitManager from '../git';
import {getList} from '../plugins/utils';
import {getDirCreationDate} from '../utils';
import listenApplication from './application';
import listenContextMenu from './context_menu';
import listenFiles from './files';
import listenGit from './git';
import {decompressFile, getImageAsDataURL, isResponseValid} from './methods';
import {
  disableExtension,
  disableLoadingExtensions,
  getExtensionsDetails,
  getExtensionsUpdate,
  updateAllExtensions,
} from './methods/card_extensions';
import {cancelDownload, downloadFile} from './methods/downloader';
import listenPty from './pty';

function utils() {
  // Gets detailed information about extensions in directory
  ipcMain.handle(utilsChannels.extensionsDetails, (_, dir: string) => getExtensionsDetails(dir));
  // Gets update status for all extensions in directory
  ipcMain.handle(utilsChannels.updateStatus, (_, dir: string) => getExtensionsUpdate(dir));

  // Updates all extensions in directory sequentially
  ipcMain.on(utilsChannels.updateAllExtensions, (_, data: {id: string; dir: string}) => updateAllExtensions(data));
  // Enables or disables extension by renaming folder (add/remove . prefix)
  ipcMain.handle(utilsChannels.disableExtension, (_, disable: boolean, dir: string) => disableExtension(disable, dir));

  // Cancels loading extension data operation
  ipcMain.on(utilsChannels.cancelExtensionsData, () => disableLoadingExtensions());

  // Downloads file from URL with progress tracking
  ipcMain.on(utilsChannels.downloadFile, (_, url: string) => downloadFile(url));
  // Cancels ongoing file download
  ipcMain.on(utilsChannels.cancelDownload, () => cancelDownload());

  // Decompresses archive file (zip, tar, etc.)
  ipcMain.handle(utilsChannels.decompressFile, (_, filePath: string) => decompressFile(filePath));

  // Validates if URL returns valid HTTP response
  ipcMain.handle(utilsChannels.isResponseValid, (_, url: string) => isResponseValid(url));
  // Fetches image from URL and converts to data URL (base64)
  ipcMain.handle(utilsChannels.getImageAsDataURL, (_, url: string) => getImageAsDataURL(url));
}

function modules() {
  const {moduleManager} = classHolder;
  // Checks if card has available updates
  ipcMain.handle(
    modulesChannels.cardUpdateAvailable,
    (_, card: InstalledCard, updateType: 'git' | 'stepper' | undefined) =>
      moduleManager?.checkCardUpdate(card, updateType),
  );
  // Uninstalls card by ID
  ipcMain.handle(modulesChannels.uninstallCardByID, (_, id: string) => moduleManager?.uninstallCardByID(id));

  // Checks for updates on multiple cards at intervals
  ipcMain.on(
    modulesChannels.checkCardsUpdateInterval,
    (
      _,
      updateType: {
        id: string;
        type: 'git' | 'stepper';
      }[],
    ) => moduleManager?.cardsUpdateInterval(updateType),
  );
}

function plugins() {
  const {pluginManager} = classHolder;
  // Gets plugin server addresses
  ipcMain.handle(pluginChannels.getAddresses, () => pluginManager?.getAddresses());
  // Gets list of installed plugins
  ipcMain.handle(pluginChannels.getInstalledList, () => pluginManager?.getInstalledList());
  // Gets list of unloaded plugins
  ipcMain.handle(pluginChannels.getUnloadedList, () => pluginManager?.getUnloadedList());
  // Installs plugin from URL
  ipcMain.handle(pluginChannels.install, (_, url: string, commitHash?: string) =>
    pluginManager?.install(url, commitHash),
  );
  // Uninstalls plugin by ID
  ipcMain.handle(pluginChannels.uninstall, (_, id: string) => pluginManager?.uninstall(id));
  // Syncs plugin to specific commit
  ipcMain.handle(pluginChannels.sync, (_, id: string, commit: string) => pluginManager?.syncItem(id, commit));
  // Syncs multiple plugins to their commits
  ipcMain.handle(pluginChannels.syncAll, (_, items: {id: string; commit: string}[]) => pluginManager?.syncAll(items));
  // Checks for available sync updates based on subscription stage
  ipcMain.handle(pluginChannels.checkForSync, (_, stage: SubscribeStages) => pluginManager?.checkForSync(stage));
  // Gets list of available plugins for subscription stage
  ipcMain.handle(pluginChannels.getList, (_, stage: SubscribeStages) => getList(stage));
  // Updates sync list entry for plugin
  ipcMain.handle(pluginChannels.updateSyncList, (_, id: string, commit: string) =>
    pluginManager?.updateSyncItem(id, commit),
  );
}

function storage() {
  const {storageManager} = classHolder;
  // Gets custom storage data by key
  ipcMain.handle(storageChannels.getCustom, (_, key: string) => storageManager.getCustomData(key));
  // Sets custom storage data by key
  ipcMain.on(storageChannels.setCustom, (_, key: string, data: any) => storageManager.setCustomData(key, data));

  // Gets typed storage data by key
  ipcMain.handle(storageChannels.get, (_, key: keyof StorageTypes) => storageManager.getData(key));
  // Gets all storage data
  ipcMain.handle(storageChannels.getAll, () => storageManager.getAll());

  // Updates storage data partially
  ipcMain.handle(
    storageChannels.update,
    async (_, key: keyof StorageTypes, updateData: Partial<StorageTypes[keyof StorageTypes]>) => {
      return storageManager.updateData(key, updateData);
    },
  );

  // Clears all storage data
  ipcMain.handle(storageChannels.clear, () => storageManager.clearStorage());
}

function storageUtilsIpc() {
  const {storageManager} = classHolder;
  // Sets app to start with system startup
  ipcMain.on(storageUtilsChannels.setSystemStartup, (_, startup: boolean) => {
    app.setLoginItemSettings({openAtLogin: startup});
    storageManager.updateData('app', {systemStartup: startup});
  });

  // Adds installed card to storage
  ipcMain.on(storageUtilsChannels.addInstalledCard, (_, cardData: InstalledCard) =>
    storageManager.addInstalledCard(cardData),
  );
  // Removes installed card from storage
  ipcMain.on(storageUtilsChannels.removeInstalledCard, (_, cardId: string) =>
    storageManager.removeInstalledCard(cardId),
  );

  // Adds card to auto-update list
  ipcMain.on(storageUtilsChannels.addAutoUpdateCard, (_, cardId: string) => storageManager.addAutoUpdateCard(cardId));
  // Removes card from auto-update list
  ipcMain.on(storageUtilsChannels.removeAutoUpdateCard, (_, cardId: string) =>
    storageManager.removeAutoUpdateCard(cardId),
  );

  // Adds card extensions to auto-update list
  ipcMain.on(storageUtilsChannels.addAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.addAutoUpdateExtensions(cardId),
  );
  // Removes card extensions from auto-update list
  ipcMain.on(storageUtilsChannels.removeAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.removeAutoUpdateExtensions(cardId),
  );

  // Manages pinned cards (add, remove, get)
  ipcMain.handle(storageUtilsChannels.pinnedCards, (_, opt: StorageOperation, id: string, pinnedCards?: string[]) =>
    storageManager.pinnedCardsOpt(opt, id, pinnedCards),
  );

  // Manages recently used cards (add, remove, get)
  ipcMain.handle(storageUtilsChannels.recentlyUsedCards, (_, opt: RecentlyOperation, id: string) =>
    storageManager.recentlyUsedCardsOpt(opt, id),
  );

  // Manages home category organization
  ipcMain.handle(storageUtilsChannels.homeCategory, (_, opt: StorageOperation, data: string[]) =>
    storageManager.homeCategoryOpt(opt, data),
  );

  // Manages pre-commands for cards (commands run before card starts)
  ipcMain.handle(storageUtilsChannels.preCommands, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.preCommandOpt(opt, data),
  );

  // Manages custom run commands for cards
  ipcMain.handle(storageUtilsChannels.customRun, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.customRunOpt(opt, data),
  );

  // Manages pre-open items (files/folders opened before card starts)
  ipcMain.handle(storageUtilsChannels.preOpen, (_, opt: StorageOperation, data: PreOpen) =>
    storageManager.preOpenOpt(opt, data),
  );

  // Updates custom run behavior settings
  ipcMain.on(storageUtilsChannels.customRunBehavior, (_, data: Partial<CustomRunBehaviorData>) =>
    storageManager.updateCustomRunBehavior(data),
  );

  // Gets card arguments by card ID
  ipcMain.handle(storageUtilsChannels.getCardArguments, (_, cardId: string) =>
    storageManager.getCardArgumentsById(cardId),
  );
  // Sets card arguments by card ID
  ipcMain.handle(storageUtilsChannels.setCardArguments, (_, cardId: string, args: ChosenArgumentsData) =>
    storageManager.setCardArguments(cardId, args),
  );

  // Updates zoom factor for cards
  ipcMain.on(storageUtilsChannels.updateZoomFactor, (_, zoomFactor: number) =>
    storageManager.updateData('cards', {zoomFactor}),
  );

  // Adds URL to browser recent list
  ipcMain.on(storageUtilsChannels.addBrowserRecent, (_, recentEntry: string) =>
    storageManager.addBrowserRecent(recentEntry),
  );
  // Adds URL to browser favorites
  ipcMain.on(storageUtilsChannels.addBrowserFavorite, (_, favoriteEntry: string) =>
    storageManager.addBrowserFavorite(favoriteEntry),
  );
  // Adds URL to browser history
  ipcMain.on(storageUtilsChannels.addBrowserHistory, (_, historyEntry: string) =>
    storageManager.addBrowserHistory(historyEntry),
  );

  // Adds favicon for browser recent URL
  ipcMain.on(storageUtilsChannels.addBrowserRecentFavIcon, (_, url: string, favIcon: string, title?: string) =>
    storageManager.addBrowserFavIcon(url, favIcon, title),
  );
  // Removes URL from browser recent list
  ipcMain.on(storageUtilsChannels.removeBrowserRecent, (_, url: string) => storageManager.removeBrowserRecent(url));
  // Removes URL from browser favorites
  ipcMain.on(storageUtilsChannels.removeBrowserFavorite, (_, url: string) => storageManager.removeBrowserFavorite(url));
  // Removes URL from browser history
  ipcMain.on(storageUtilsChannels.removeBrowserHistory, (_, url: string) => storageManager.removeBrowserHistory(url));

  // Sets confirmation dialog visibility (close, terminate AI, close tab)
  ipcMain.on(storageUtilsChannels.setShowConfirm, (_, type: ConfirmMenuTypes, enable: boolean) =>
    storageManager.setShowConfirm(type, enable),
  );

  // Marks notification as read
  ipcMain.on(storageUtilsChannels.addReadNotif, (_, id: string) => storageManager.addReadNotif(id));

  // Sets terminal pre-commands for card
  ipcMain.on(storageUtilsChannels.setCardTerminalPreCommands, (_, id: string, commands: string[]) =>
    storageManager.setCardTerminalPreCommands(id, commands),
  );
  // Unassigns card and optionally clears its configurations
  ipcMain.handle(storageUtilsChannels.unassignCard, (_, id: string, clearConfigs: boolean) =>
    storageManager.unassignCard(id, clearConfigs),
  );
  // Gets browser history data securely
  ipcMain.handle(storageUtilsChannels.getBrowserHistoryData, () => storageManager.getBrowserDataSecurely());
}

function modulesIpc() {
  const {moduleManager} = classHolder;
  moduleManager?.listenForChannels();
}

function extensionsIpc() {
  classHolder.extensionManager?.listenForChannels();
}

function modulesApi() {
  // Gets folder creation date
  ipcMain.handle(moduleApiChannels.getFolderCreationTime, (_, dir: string) => getDirCreationDate(dir));
  // Gets last Git pull date for repository
  ipcMain.handle(moduleApiChannels.getLastPulledDate, (_, dir: string) => GitManager.getLastPulledDate(dir));
  // Gets current Git release tag
  ipcMain.handle(moduleApiChannels.getCurrentReleaseTag, (_, dir: string) => GitManager.getCurrentReleaseTag(dir));
}

function statics() {
  const {staticManager} = classHolder;

  // Pulls latest static data from server
  ipcMain.handle(staticsChannels.pull, () => staticManager?.pull());
  // Gets app release information
  ipcMain.handle(staticsChannels.getReleases, () => staticManager?.getReleases());
  // Gets insider build information
  ipcMain.handle(staticsChannels.getInsider, () => staticManager?.getInsider());
  // Gets notification data
  ipcMain.handle(staticsChannels.getNotification, () => staticManager?.getNotification());
  // Gets available modules list
  ipcMain.handle(staticsChannels.getModules, () => staticManager?.getModules());
  // Gets available extensions list
  ipcMain.handle(staticsChannels.getExtensions, () => staticManager?.getExtensions());
  // Gets early access extensions list
  ipcMain.handle(staticsChannels.getExtensionsEA, () => staticManager?.getExtensionsEA());
  // Gets Patreon supporters list
  ipcMain.handle(staticsChannels.getPatrons, () => staticManager?.getPatrons());
}

function imageCache() {
  const cacheManager = getImageCacheManager();

  // Gets cache statistics (entry count, total size, last cleanup)
  ipcMain.handle(utilsChannels.getImageCacheStats, () => {
    const stats = cacheManager.getStats();
    return {
      entryCount: stats.entryCount,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatBytes(stats.totalSize),
      lastCleanup: stats.lastCleanup,
      lastCleanupFormatted: new Date(stats.lastCleanup).toISOString(),
    };
  });

  // Clears all cached images
  ipcMain.handle(utilsChannels.clearImageCache, async () => {
    const clearedCount = await cacheManager.clearCache();
    return {success: true, clearedEntries: clearedCount};
  });

  // Triggers manual cache cleanup (removes expired entries)
  ipcMain.handle(utilsChannels.triggerImageCacheCleanup, async () => {
    await cacheManager.triggerCleanup();
    return {success: true};
  });
}

/** Formats bytes to human readable string */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function listenToIpcChannels() {
  storage();
  storageUtilsIpc();

  listenApplication();
  listenFiles();

  listenGit();
  utils();
  listenPty();

  modules();
  modulesApi();
  modulesIpc();

  extensionsIpc();

  plugins();

  const {linkPreviewManager} = classHolder;
  listenContextMenu();
  if (linkPreviewManager) linkPreviewManager.listenForChannels();

  statics();
  imageCache();
}
