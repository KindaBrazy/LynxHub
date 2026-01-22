import modulesChannels, {moduleApiChannels} from '@lynx_cross/consts/ipc_channels/module';
import pluginChannels from '@lynx_cross/consts/ipc_channels/plugins';
import utilsChannels from '@lynx_cross/consts/ipc_channels/utils';
import {ipcMain} from 'electron';

import {SubscribeStages} from '../../cross/types';
import {InstalledCard} from '../../cross/types/storage';
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
import listenStatics from './statics';
import listenStorage, {listenStorageUtils} from './storage';

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
  listenStorage();
  listenStorageUtils();

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

  listenStatics();
  imageCache();
}
