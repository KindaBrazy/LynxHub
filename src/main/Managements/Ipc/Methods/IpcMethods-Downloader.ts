import path from 'node:path';

import {app, DownloadItem} from 'electron';
import {download} from 'electron-dl';

import {utilsChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager} from '../../../index';

let downloadingItem: DownloadItem | undefined;

export function downloadFile(url: string) {
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
      window.webContents.send(utilsChannels.onDownloadFile, {
        stage: 'progress',
        percentage: progress.percent,
        downloaded: progress.transferredBytes,
        total: progress.totalBytes,
        fileName: downloadingItem?.getFilename(),
      });
    },
  })
    .then(item => {
      window.webContents.send(utilsChannels.onDownloadFile, {
        stage: 'done',
        finalPath: item.savePath,
      });
    })
    .catch(e => {
      window.webContents.send(utilsChannels.onDownloadFile, {
        stage: 'failed',
      });
      console.error('Failed to download file: ', e);
    });
}

export function cancelDownload() {
  downloadingItem?.cancel();
}
