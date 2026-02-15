import utilsChannels from '@lynx_common/consts/ipcChannels/utils';
import {DownloadProgress, ExtensionsData, ExtensionsUpdateStatus, OnUpdatingExtensions} from '@lynx_common/types/ipc';

import lynxIpc from './lynxIpc';

const utilsIpc = {
  // Updates all extensions in directory sequentially
  updateAllExtensions: (data: {id: string; dir: string}) => lynxIpc.send(utilsChannels.updateAllExtensions, data),

  // Listens for extension update progress
  onUpdateAllExtensions: (result: (updateInfo: OnUpdatingExtensions) => void) =>
    lynxIpc.on(utilsChannels.onUpdateAllExtensions, result),

  // Gets detailed information about extensions in directory
  getExtensionsDetails: (dir: string) => lynxIpc.invoke<ExtensionsData>(utilsChannels.extensionsDetails, dir),

  // Gets update status for all extensions in directory
  getExtensionsUpdateStatus: (dir: string) => lynxIpc.invoke<ExtensionsUpdateStatus>(utilsChannels.updateStatus, dir),

  // Enables or disables extension by renaming folder (add/remove . prefix)
  disableExtension: (disable: boolean, dir: string) =>
    lynxIpc.invoke<string>(utilsChannels.disableExtension, disable, dir),

  // Cancels loading extension data operation
  cancelExtensionsData: () => lynxIpc.send(utilsChannels.cancelExtensionsData),

  // Downloads file from URL with progress tracking
  downloadFile: (url: string) => lynxIpc.send(utilsChannels.downloadFile, url),

  // Cancels ongoing file download
  cancelDownload: () => lynxIpc.send(utilsChannels.cancelDownload),

  // Listens for file download progress updates
  onDownloadFile: (result: (progress: DownloadProgress) => void) => lynxIpc.on(utilsChannels.onDownloadFile, result),

  // Decompresses archive file (zip, tar, etc.)
  decompressFile: (filePath: string) => lynxIpc.invoke<string>(utilsChannels.decompressFile, filePath),

  // Validates if URL returns valid HTTP response
  isResponseValid: (url: string) => lynxIpc.invoke<boolean>(utilsChannels.isResponseValid, url),

  // Fetches image from URL and converts to data URL (base64)
  getImageAsDataURL: (url: string) => lynxIpc.invoke<string | null>(utilsChannels.getImageAsDataURL, url),

  // Gets cache statistics (entry count, total size, last cleanup)
  getImageCacheStats: () =>
    lynxIpc.invoke<{
      entryCount: number;
      totalSize: number;
      totalSizeFormatted: string;
      lastCleanup: number;
      lastCleanupFormatted: string;
    }>(utilsChannels.getImageCacheStats),

  // Clears all cached images
  clearImageCache: () => lynxIpc.invoke<{success: boolean; clearedEntries: number}>(utilsChannels.clearImageCache),

  // Triggers manual cache cleanup (removes expired entries)
  triggerImageCacheCleanup: () => lynxIpc.invoke<{success: boolean}>(utilsChannels.triggerImageCacheCleanup),
};

export default utilsIpc;
