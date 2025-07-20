import {ipcMain} from 'electron';
import electron_log from 'electron-log';
import updater from 'electron-updater';

import {appUpdateChannels, AppUpdateEventTypes, AppUpdateStatus} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

const {autoUpdater, CancellationToken} = updater;

function sendToRenderer(type: AppUpdateEventTypes, status?: AppUpdateStatus) {
  appManager?.getWebContent()?.send(appUpdateChannels.status, type, status);
}

export function checkForUpdate() {
  autoUpdater.autoDownload = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.disableWebInstaller = true;

  autoUpdater.logger = electron_log;
  // @ts-ignore
  autoUpdater.logger.transports.file.level = 'debug';

  let cancelToken = new CancellationToken();

  ipcMain.on(appUpdateChannels.download, () => {
    autoUpdater.downloadUpdate(cancelToken).catch(e => {
      console.error('autoUpdater.downloadUpdate: ', e);
    });
  });

  ipcMain.on(appUpdateChannels.install, () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on(appUpdateChannels.cancel, () => {
    appManager?.getMainWindow()?.setProgressBar(-1);
    cancelToken.cancel();
    cancelToken = new CancellationToken();
  });

  autoUpdater.on('update-available', () => {
    sendToRenderer('update-available');
  });

  autoUpdater.on('download-progress', (info: updater.ProgressInfo) => {
    sendToRenderer('download-progress', info);
    appManager?.getMainWindow()?.setProgressBar(info.percent / 100);
  });

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update-downloaded');
    appManager?.getMainWindow()?.setProgressBar(-1);
  });

  autoUpdater.on('error', (e: Error | any, message?: string) => {
    if (e.statusCode === 403) {
      appManager?.getWebContent()?.send(appUpdateChannels.statusError);
    } else {
      sendToRenderer('error', message);
      appManager?.getMainWindow()?.setProgressBar(-1);
    }
  });
}
