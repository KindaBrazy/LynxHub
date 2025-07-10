import {ipcMain} from 'electron';
import electron_log from 'electron-log';
import updater from 'electron-updater';

import {appUpdateChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

const {autoUpdater, CancellationToken} = updater;

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
    console.log('update-available');
    appManager?.getWebContent()?.send(appUpdateChannels.status, 'update-available');
  });

  autoUpdater.on('download-progress', (info: updater.ProgressInfo) => {
    console.log('download-progress', info);
    appManager?.getWebContent()?.send(appUpdateChannels.status, info);
    appManager?.getMainWindow()?.setProgressBar(info.percent / 100);
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('update-downloaded');
    appManager?.getWebContent()?.send(appUpdateChannels.status, 'update-downloaded');
    appManager?.getMainWindow()?.setProgressBar(-1);
  });

  autoUpdater.on('error', (e, message?: string) => {
    console.error('Update Error: ', e);
    appManager?.getWebContent()?.send(appUpdateChannels.status, message);
    appManager?.getMainWindow()?.setProgressBar(-1);
  });
}
