// Downloader IPC methods - Handles file downloads with progress tracking
import path from 'node:path';

import {app, DownloadItem} from 'electron';
import {download} from 'electron-dl';

import classHolder from '../../core/class_holder';
import {utilsIpc} from '../utils';

let downloadingItem: DownloadItem | undefined;

export function downloadFile(url: string) {
  const {appManager} = classHolder;
  const window = appManager?.getMainWindow();

  if (!window) {
    console.error('Failed to download file: ', 'window object is undefined!');
    return;
  }

  download(window, url, {
    showBadge: false,
    directory: path.join(app.getPath('downloads'), 'LynxHub'),
    onStarted: item => {
      downloadingItem = item;
    },
    onProgress: progress => {
      utilsIpc.send.onDownloadFile({
        stage: 'progress',
        percentage: progress.percent,
        downloaded: progress.transferredBytes,
        total: progress.totalBytes,
        fileName: downloadingItem?.getFilename(),
      });
    },
  })
    .then(item => {
      utilsIpc.send.onDownloadFile({
        stage: 'done',
        finalPath: item.savePath,
      });
    })
    .catch(e => {
      utilsIpc.send.onDownloadFile({
        stage: 'failed',
      });
      console.error('Failed to download file: ', e);
    });
}

export function cancelDownload() {
  downloadingItem?.cancel();
}
