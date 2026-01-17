import {appUpdateChannels} from '@lynx_cross/consts/ipc';
import {AppUpdateEventTypes, AppUpdateStatus} from '@lynx_cross/types/ipc';
import {ipcMain} from 'electron';
import electron_log from 'electron-log';
import updater from 'electron-updater';

import classHolder from './class_holder';

const {autoUpdater, CancellationToken} = updater;

function sendToRenderer(type: AppUpdateEventTypes, status?: AppUpdateStatus) {
  const {appManager} = classHolder;
  appManager?.getWebContent()?.send(appUpdateChannels.status, type, status);
}

/**
 * Checks if an error is a network-related error that should be silently ignored.
 */
function isNetworkError(error: Error | any): boolean {
  const message = error?.message || error?.toString() || '';
  const statusCode = error?.statusCode;

  // HTTP 5xx errors (server-side issues) should be silently ignored
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return true;
  }

  const networkErrorPatterns = [
    /ERR_NETWORK_CHANGED/i,
    /ERR_INTERNET_DISCONNECTED/i,
    /ERR_CONNECTION_RESET/i,
    /ERR_CONNECTION_REFUSED/i,
    /ERR_NAME_NOT_RESOLVED/i,
    /ERR_TIMED_OUT/i,
    /ENOTFOUND/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENETUNREACH/i,
    /net::ERR_/i,
    /504 Gateway/i,
    /502 Bad Gateway/i,
    /503 Service/i,
    /HttpError: 5\d\d/i,
    /Cannot parse releases feed/i,
    /Unable to find latest version/i,
  ];
  return networkErrorPatterns.some(pattern => pattern.test(message));
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
    const {appManager} = classHolder;
    appManager?.getMainWindow()?.setProgressBar(-1);
    cancelToken.cancel();
    cancelToken = new CancellationToken();
  });

  autoUpdater.on('update-available', () => {
    sendToRenderer('update-available');
  });

  autoUpdater.on('download-progress', (info: updater.ProgressInfo) => {
    const {appManager} = classHolder;
    sendToRenderer('download-progress', info);
    appManager?.getMainWindow()?.setProgressBar(info.percent / 100);
  });

  autoUpdater.on('update-downloaded', () => {
    const {appManager} = classHolder;
    sendToRenderer('update-downloaded');
    appManager?.getMainWindow()?.setProgressBar(-1);
  });

  autoUpdater.on('error', (e: Error | any, message?: string) => {
    const {appManager} = classHolder;
    // Silently ignore network errors - user may be offline or have unstable connection
    if (isNetworkError(e)) {
      console.warn('Update check failed due to network error:', e.message || e);
      return;
    }

    if (e.statusCode === 403) {
      appManager?.getWebContent()?.send(appUpdateChannels.statusError);
    } else {
      sendToRenderer('error', message);
      appManager?.getMainWindow()?.setProgressBar(-1);
    }
  });
}
