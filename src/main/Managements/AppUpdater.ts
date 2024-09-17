import {ipcMain} from 'electron';
import updater from 'electron-updater';

import {appUpdateChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

const {autoUpdater, CancellationToken} = updater;

export function checkForUpdate() {
  autoUpdater.autoDownload = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.disableWebInstaller = true;

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
    appManager.getMainWindow()?.setProgressBar(-1);
    cancelToken.cancel();
    cancelToken = new CancellationToken();
  });

  autoUpdater.on('update-available', () => {
    appManager.getWebContent()?.send(appUpdateChannels.status, 'update-available');
  });

  autoUpdater.on('download-progress', (info: updater.ProgressInfo) => {
    appManager.getWebContent()?.send(appUpdateChannels.status, info);
    appManager.getMainWindow()?.setProgressBar(info.percent / 100);
  });

  autoUpdater.on('update-downloaded', () => {
    appManager.getWebContent()?.send(appUpdateChannels.status, 'update-downloaded');
    appManager.getMainWindow()?.setProgressBar(-1);
  });

  autoUpdater.on('error', (e, message?: string) => {
    console.error('Update Error: ', e);
    appManager.getWebContent()?.send(appUpdateChannels.status, message);
    appManager.getMainWindow()?.setProgressBar(-1);
  });
}
