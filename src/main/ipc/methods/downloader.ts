
// Downloader IPC methods - Handles file downloads with progress tracking
import path from 'node:path';

import {utilsIpc} from '@lynx_main/ipc/utils';
import classHolder from '@lynx_main/managers/classHolder';
import {app, DownloadItem} from 'electron';
import {download} from 'electron-dl';

// Tracks the currently active download item.
// Note: This implementation currently supports tracking only one download at a time via IPC cancellation.
let currentDownloadItem: DownloadItem | undefined;

/**
 * Initiates a file download from a URL.
 * @param url - The URL of the file to download.
 */
export function downloadFile(url: string): void {
  const {appManager} = classHolder;
  const window = appManager?.getMainWindow();

  if (!window) {
    console.error('Failed to download file: window object is undefined!');
    utilsIpc.send.onDownloadFile({
      stage: 'failed',
    });
    return;
  }

  download(window, url, {
    showBadge: false,
    directory: path.join(app.getPath('downloads'), 'LynxHub'),
    onStarted: item => {
      currentDownloadItem = item;
    },
    onProgress: progress => {
      utilsIpc.send.onDownloadFile({
        stage: 'progress',
        percentage: progress.percent,
        downloaded: progress.transferredBytes,
        total: progress.totalBytes,
        fileName: currentDownloadItem?.getFilename() || '',
      });
    },
  })
    .then(item => {
      utilsIpc.send.onDownloadFile({
        stage: 'done',
        finalPath: item.savePath,
      });
      // Clear the current item reference on success
      if (currentDownloadItem === item) {
        currentDownloadItem = undefined;
      }
    })
    .catch(e => {
      utilsIpc.send.onDownloadFile({
        stage: 'failed',
      });
      console.error('Failed to download file: ', e);
      // Clear the current item reference on failure
      currentDownloadItem = undefined;
    });
}

/**
 * Cancels the currently active download.
 */
export function cancelDownload(): void {
  if (currentDownloadItem) {
    currentDownloadItem.cancel();
    currentDownloadItem = undefined;
  }
}
