import {browserDownloadChannels} from '@lynx_common/consts/ipcChannels/downloadManager';
import {DownloadDoneInfo, DownloadManagerProgress, DownloadStartInfo} from '@lynx_common/types/downloadManager';
import {MainHT} from '@lynx_common/types/ipc';
import classHolder from '@lynx_main/managers/classHolder';

import lynxIpc from './ipcWrapper';
import {sendToContextMenu, sendToMain} from './sender';

export default async function listenDownloadManager() {
  const browserDownloadManager = await classHolder.waitForClass('browserDownloadManager');

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
    } catch (error) {
      return {success: false, error: error.message};
    }
  });

  // Download location and behavior IPC handlers
  downloadManagerIpc.handle.setDownloadLocation(targetPath => {
    try {
      return browserDownloadManager.setDownloadLocation(targetPath);
    } catch (error: any) {
      const fsError = browserDownloadManager.handleFileSystemError(error);
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
      const fsError = browserDownloadManager.handleFileSystemError(error);
      return {success: false, error: fsError.userMessage};
    }
  });

  downloadManagerIpc.handle.getDownloadBehavior(() => {
    try {
      return {success: true, behavior: browserDownloadManager.getDownloadBehavior()};
    } catch (error) {
      return {success: false, error: error.message};
    }
  });

  downloadManagerIpc.handle.setDownloadBehavior(behavior => {
    try {
      browserDownloadManager.setDownloadBehavior(behavior);
      return {success: true};
    } catch (error) {
      return {success: false, error: error.message};
    }
  });
}

export const downloadManagerIpc = {
  send: {
    onDlStart: (info: DownloadStartInfo) => sendToContextMenu(browserDownloadChannels.onDlStart, info),
    onProgress: (info: DownloadManagerProgress) => sendToContextMenu(browserDownloadChannels.onProgress, info),
    onDone: (info: DownloadDoneInfo) => sendToContextMenu(browserDownloadChannels.onDone, info),
    dlCount: (count: number) => sendToMain(browserDownloadChannels.mainDownloadCount, count),
  },
  on: {
    cancel: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.cancel, callback),
    pause: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.pause, callback),
    resume: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.resume, callback),
    clear: (callback: (name: string) => void) => lynxIpc.on(browserDownloadChannels.clear, callback),
    clearAll: (callback: () => void) => lynxIpc.on(browserDownloadChannels.clearAll, callback),
    openItem: (callback: (name: string, action: 'open' | 'openFolder') => void) =>
      lynxIpc.on(browserDownloadChannels.openItem, callback),
    openDownloadsMenu: (callback: () => void) => lynxIpc.on(browserDownloadChannels.openDownloadsMenu, callback),
  },
  handle: {
    getDownloadLocation: (callback: () => MainHT<{success: boolean; path?: string; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.getDownloadLocation, callback),
    setDownloadLocation: (callback: (targetPath: string) => MainHT<{success: boolean; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.setDownloadLocation, callback),
    openLocationDialog: (callback: () => MainHT<{success: boolean; path?: string; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.openLocationDialog, callback),
    getDownloadBehavior: (callback: () => MainHT<{success: boolean; behavior?: 'ask' | 'default'; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.getDownloadBehavior, callback),
    setDownloadBehavior: (callback: (behavior: 'ask' | 'default') => MainHT<{success: boolean; error?: string}>) =>
      lynxIpc.handle(browserDownloadChannels.setDownloadBehavior, callback),
  },
};
