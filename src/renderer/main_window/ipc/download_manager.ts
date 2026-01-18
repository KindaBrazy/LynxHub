import {browserDownloadChannels} from '@lynx_cross/consts/donwload_manager';
import type {DownloadDoneInfo, DownloadManagerProgress, DownloadStartInfo} from '@lynx_cross/types/download_manager';

import lynxIpc from './lynxIpc';

const downloadManagerIpc = {
  send: {
    // Opens downloads menu window
    openMenu: () => lynxIpc.send(browserDownloadChannels.openDownloadsMenu),

    // Opens downloaded item or its folder
    openItem: (name: string, action: 'open' | 'openFolder') =>
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
    getDownloadLocation: () =>
      lynxIpc.invoke<{success: boolean; path?: string; error?: string}>(browserDownloadChannels.getDownloadLocation),

    // Sets download location
    setDownloadLocation: (path: string) =>
      lynxIpc.invoke<{success: boolean; error?: string}>(browserDownloadChannels.setDownloadLocation, path),

    // Opens location selection dialog
    openLocationDialog: () =>
      lynxIpc.invoke<{success: boolean; path?: string; error?: string}>(browserDownloadChannels.openLocationDialog),

    // Gets download behavior setting
    getDownloadBehavior: () =>
      lynxIpc.invoke<{success: boolean; behavior?: 'ask' | 'default'; error?: string}>(
        browserDownloadChannels.getDownloadBehavior,
      ),

    // Sets download behavior
    setDownloadBehavior: (behavior: 'ask' | 'default') =>
      lynxIpc.invoke<{success: boolean; error?: string}>(browserDownloadChannels.setDownloadBehavior, behavior),
  },

  on: {
    // Listens for download count changes
    downloadCount: (callback: (count: number) => void) =>
      lynxIpc.on(browserDownloadChannels.mainDownloadCount, callback),

    // Listens for download start events
    dlStart: (callback: (info: DownloadStartInfo) => void) => lynxIpc.on(browserDownloadChannels.onDlStart, callback),

    // Listens for download progress events
    progress: (callback: (info: DownloadManagerProgress) => void) =>
      lynxIpc.on(browserDownloadChannels.onProgress, callback),

    // Listens for download completion events
    done: (callback: (info: DownloadDoneInfo) => void) => lynxIpc.on(browserDownloadChannels.onDone, callback),
  },
};

export default downloadManagerIpc;
