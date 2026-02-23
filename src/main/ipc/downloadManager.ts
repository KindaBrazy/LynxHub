import {browserDownloadChannels} from '@lynx_common/consts/ipcChannels/downloadManager';
import {DownloadDoneInfo, DownloadManagerProgress, DownloadStartInfo} from '@lynx_common/types/downloadManager';
import {MainHT} from '@lynx_common/types/ipc';
import classHolder from '@lynx_main/managers/classHolder';
import {handleFileSystemError} from '@lynx_main/utils/fileSystem';

import lynxIpc from './ipcWrapper';
import {sendToContextMenu, sendToMain} from './sender';

/**
 * Initializes listeners for download manager events.
 */
export default async function listenDownloadManager() {
  const browserDownloadManager = await classHolder.waitForClass('browserDownloadManager');

  // Control operations
  downloadManagerIpc.on.cancel(name => browserDownloadManager.cancelItem(name));
  downloadManagerIpc.on.pause(name => browserDownloadManager.pauseItem(name));
  downloadManagerIpc.on.resume(name => browserDownloadManager.resumeItem(name));
  downloadManagerIpc.on.clear(name => browserDownloadManager.clearItem(name));
  downloadManagerIpc.on.clearAll(() => browserDownloadManager.clearAllItems());
  downloadManagerIpc.on.openItem((name, action) => browserDownloadManager.openItem(name, action));

  // Download location and behavior IPC handlers
  downloadManagerIpc.handle.getDownloadLocation(() => {
    try {
      return {success: true, path: browserDownloadManager.getDownloadLocation()};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  });

  downloadManagerIpc.handle.setDownloadLocation(targetPath => {
    try {
      return browserDownloadManager.setDownloadLocation(targetPath);
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      return {success: false, error: fsError.userMessage};
    }
  });

  downloadManagerIpc.handle.openLocationDialog(async () => {
    try {
      const path = await browserDownloadManager.openLocationDialog();
      if (!path) {
        return {success: false, error: 'Cancelled'};
      }

      const result = browserDownloadManager.setDownloadLocation(path);
      if (result.success) {
        return {success: true, path};
      }
      return {success: false, error: result.error};
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      return {success: false, error: fsError.userMessage};
    }
  });

  downloadManagerIpc.handle.getDownloadBehavior(() => {
    try {
      return {success: true, behavior: browserDownloadManager.getDownloadBehavior()};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  });

  downloadManagerIpc.handle.setDownloadBehavior(behavior => {
    try {
      browserDownloadManager.setDownloadBehavior(behavior);
      return {success: true};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  });
}

/**
 * IPC interface for download manager events.
 */
export const downloadManagerIpc = {
  send: {
    /** Sends download start event */
    onDlStart: (info: DownloadStartInfo) => sendToContextMenu(browserDownloadChannels.onDlStart, info),
    /** Sends download progress event */
    onProgress: (info: DownloadManagerProgress) => sendToContextMenu(browserDownloadChannels.onProgress, info),
    /** Sends download completion event */
    onDone: (info: DownloadDoneInfo) => sendToContextMenu(browserDownloadChannels.onDone, info),
    /** Sends active download count */
    dlCount: (count: number) => sendToMain(browserDownloadChannels.mainDownloadCount, count),
  },
  on: {
    /** Listens for cancel request */
    cancel: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.cancel, callback),
    /** Listens for pause request */
    pause: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.pause, callback),
    /** Listens for resume request */
    resume: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.resume, callback),
    /** Listens for clear request */
    clear: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.clear, callback),
    /** Listens for clear all request */
    clearAll: (callback: () => void) => lynxIpc.on(browserDownloadChannels.clearAll, callback),
    /** Listens for open item request */
    openItem: (callback: (name: string, action: 'open' | 'openFolder') => void) =>
      lynxIpc.on(browserDownloadChannels.openItem, callback),
    /** Listens for open downloads menu request */
    openDownloadsMenu: (callback: () => void) => lynxIpc.on(browserDownloadChannels.openDownloadsMenu, callback),
  },
  handle: {
    /** Handles get download location request */
    getDownloadLocation: (callback: () => MainHT<{success: boolean; path?: string; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.getDownloadLocation, callback),
    /** Handles set download location request */
    setDownloadLocation: (callback: (targetPath: string) => MainHT<{success: boolean; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.setDownloadLocation, callback),
    /** Handles open location dialog request */
    openLocationDialog: (callback: () => MainHT<{success: boolean; path?: string; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.openLocationDialog, callback),
    /** Handles get download behavior request */
    getDownloadBehavior: (callback: () => MainHT<{success: boolean; behavior?: 'ask' | 'default'; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.getDownloadBehavior, callback),
    /** Handles set download behavior request */
    setDownloadBehavior: (callback: (behavior: 'ask' | 'default') => MainHT<{success: boolean; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.setDownloadBehavior, callback),
  },
};
