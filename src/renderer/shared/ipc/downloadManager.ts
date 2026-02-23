import {browserDownloadChannels} from '@lynx_common/consts/ipcChannels/downloadManager';
import type {DownloadDoneInfo, DownloadManagerProgress, DownloadStartInfo} from '@lynx_common/types/downloadManager';

import lynxIpc from './lynxIpc';

type DownloadItemAction = 'open' | 'openFolder';
type DownloadLocationResult = {success: boolean; path?: string; error?: string};
type DownloadBehaviorResult = {success: boolean; behavior?: 'ask' | 'default'; error?: string};
type DownloadUpdateResult = {success: boolean; error?: string};

const downloadManagerIpc = {
  send: {
    // Opens downloads menu window
    openMenu: () => lynxIpc.send(browserDownloadChannels.openDownloadsMenu),

    // Opens downloaded item or its folder
    openItem: (name: string, action: DownloadItemAction) =>
      lynxIpc.send(browserDownloadChannels.openItem, name, action),

    // Cancels download
    cancel: (name: string) => lynxIpc.send(browserDownloadChannels.cancel, name),

    // Pauses download
    pause: (name: string) => lynxIpc.send(browserDownloadChannels.pause, name),

    // Resumes paused download
    resume: (name: string) => lynxIpc.send(browserDownloadChannels.resume, name),

    // Clears completed download from list
    clear: (name: string) => lynxIpc.send(browserDownloadChannels.clear, name),

    // Clears all downloads from list
    clearAll: () => lynxIpc.send(browserDownloadChannels.clearAll),
  },

  invoke: {
    // Gets current download location
    getDownloadLocation: () => lynxIpc.invoke<DownloadLocationResult>(browserDownloadChannels.getDownloadLocation),

    // Sets download location
    setDownloadLocation: (path: string) => lynxIpc.invoke<DownloadUpdateResult>(browserDownloadChannels.setDownloadLocation, path),

    // Opens location selection dialog
    openLocationDialog: () => lynxIpc.invoke<DownloadLocationResult>(browserDownloadChannels.openLocationDialog),

    // Gets download behavior setting
    getDownloadBehavior: () => lynxIpc.invoke<DownloadBehaviorResult>(browserDownloadChannels.getDownloadBehavior),

    // Sets download behavior
    setDownloadBehavior: (behavior: 'ask' | 'default') =>
      lynxIpc.invoke<DownloadUpdateResult>(browserDownloadChannels.setDownloadBehavior, behavior),
  },

  on: {
    // Listens for download count changes
    downloadCount: (callback: (count: number) => void): (() => void) =>
      lynxIpc.on(browserDownloadChannels.mainDownloadCount, callback),

    // Listens for download start events
    dlStart: (callback: (info: DownloadStartInfo) => void): (() => void) =>
      lynxIpc.on(browserDownloadChannels.onDlStart, callback),

    // Listens for download progress events
    progress: (callback: (info: DownloadManagerProgress) => void): (() => void) =>
      lynxIpc.on(browserDownloadChannels.onProgress, callback),

    // Listens for download completion events
    done: (callback: (info: DownloadDoneInfo) => void): (() => void) =>
      lynxIpc.on(browserDownloadChannels.onDone, callback),
  },
};

export default downloadManagerIpc;
