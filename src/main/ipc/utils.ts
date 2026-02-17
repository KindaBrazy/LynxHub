import utilsChannels from '@lynx_common/consts/ipcChannels/utils';
import {
  DownloadProgress,
  ExtensionsData,
  ExtensionsUpdateStatus,
  MainHT,
  OnUpdatingExtensions,
} from '@lynx_common/types/ipc';
import {formatBytes} from '@lynx_common/utils';
import {getImageCacheManager} from '@lynx_main/managers/imageCache';

import lynxIpc from './ipcWrapper';
import {
  disableExtension,
  disableExtensionsLoading,
  getExtensionsDetails,
  getExtensionsUpdate,
  updateAllExtensions,
} from './methods/cardExtensions';
import {cancelDownload, downloadFile} from './methods/downloader';
import {decompressFile, getImageAsDataURL, isResponseValid} from './methods/windowUtils';
import {sendToMain} from './sender';

export default function listenUtils() {
  const cacheManager = getImageCacheManager();

  // Gets detailed information about extensions in directory
  utilsIpc.handle.extensionsDetails(dir => getExtensionsDetails(dir));

  // Gets update status for all extensions in directory
  utilsIpc.handle.updateStatus(dir => getExtensionsUpdate(dir));

  // Updates all extensions in directory sequentially
  utilsIpc.on.updateAllExtensions(data => updateAllExtensions(data));

  // Enables or disables extension by renaming folder (add/remove . prefix)
  utilsIpc.handle.disableExtension((disable, dir) => disableExtension(disable, dir));

  // Cancels loading extension data operation
  utilsIpc.on.cancelExtensionsData(() => disableExtensionsLoading());

  // Downloads file from URL with progress tracking
  utilsIpc.on.downloadFile(url => downloadFile(url));

  // Cancels ongoing file download
  utilsIpc.on.cancelDownload(() => cancelDownload());

  // Decompresses archive file (zip, tar, etc.)
  utilsIpc.handle.decompressFile(filePath => decompressFile(filePath));

  // Validates if URL returns valid HTTP response
  utilsIpc.handle.isResponseValid(url => isResponseValid(url));

  // Fetches image from URL and converts to data URL (base64)
  utilsIpc.handle.getImageAsDataURL(url => getImageAsDataURL(url));

  // Gets cache statistics (entry count, total size, last cleanup)
  utilsIpc.handle.getImageCacheStats(() => {
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
  utilsIpc.handle.clearImageCache(async () => {
    const clearedCount = await cacheManager.clearCache();
    return {success: true, clearedEntries: clearedCount};
  });

  // Triggers manual cache cleanup (removes expired entries)
  utilsIpc.handle.triggerImageCacheCleanup(async () => {
    await cacheManager.triggerCleanup();
    return {success: true};
  });
}

export const utilsIpc = {
  send: {
    onUpdateAllExtensions: (updateInfo: OnUpdatingExtensions) =>
      sendToMain(utilsChannels.onUpdateAllExtensions, updateInfo),
    onDownloadFile: (progress: Partial<DownloadProgress>) => sendToMain(utilsChannels.onDownloadFile, progress),
  },
  on: {
    updateAllExtensions: (callback: (data: {id: string; dir: string}) => void) =>
      lynxIpc.on(utilsChannels.updateAllExtensions, callback),
    cancelExtensionsData: (callback: () => void) => lynxIpc.on(utilsChannels.cancelExtensionsData, callback),
    downloadFile: (callback: (url: string) => void) => lynxIpc.on(utilsChannels.downloadFile, callback),
    cancelDownload: (callback: () => void) => lynxIpc.on(utilsChannels.cancelDownload, callback),
  },
  handle: {
    extensionsDetails: (callback: (dir: string) => MainHT<ExtensionsData>) =>
      lynxIpc.handle(utilsChannels.extensionsDetails, callback),
    updateStatus: (callback: (dir: string) => MainHT<ExtensionsUpdateStatus>) =>
      lynxIpc.handle(utilsChannels.updateStatus, callback),
    disableExtension: (callback: (disable: boolean, dir: string) => MainHT<string>) =>
      lynxIpc.handle(utilsChannels.disableExtension, callback),
    decompressFile: (callback: (filePath: string) => MainHT<string>) =>
      lynxIpc.handle(utilsChannels.decompressFile, callback),
    isResponseValid: (callback: (url: string) => MainHT<boolean>) =>
      lynxIpc.handle(utilsChannels.isResponseValid, callback),
    getImageAsDataURL: (callback: (url: string) => MainHT<string | null>) =>
      lynxIpc.handle(utilsChannels.getImageAsDataURL, callback),
    getImageCacheStats: (
      callback: () => MainHT<{
        entryCount: number;
        totalSize: number;
        totalSizeFormatted: string;
        lastCleanup: number;
        lastCleanupFormatted: string;
      }>,
    ) => lynxIpc.handle(utilsChannels.getImageCacheStats, callback),
    clearImageCache: (callback: () => MainHT<{success: boolean; clearedEntries: number}>) =>
      lynxIpc.handle(utilsChannels.clearImageCache, callback),
    triggerImageCacheCleanup: (callback: () => MainHT<{success: boolean}>) =>
      lynxIpc.handle(utilsChannels.triggerImageCacheCleanup, callback),
  },
};
