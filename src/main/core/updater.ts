import {applicationIpc} from '@lynx_main/ipc/application';
import electron_log from 'electron-log';
import updater from 'electron-updater';

import classHolder from './class_holder';

const {autoUpdater, CancellationToken} = updater;

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

  applicationIpc.on.updateDownload(() => {
    autoUpdater.downloadUpdate(cancelToken).catch(e => {
      console.error('autoUpdater.downloadUpdate: ', e);
    });
  });

  applicationIpc.on.updateInstall(() => {
    autoUpdater.quitAndInstall();
  });

  applicationIpc.on.updateCancel(() => {
    const {appManager} = classHolder;
    appManager?.getMainWindow()?.setProgressBar(-1);
    cancelToken.cancel();
    cancelToken = new CancellationToken();
  });

  autoUpdater.on('update-available', () => {
    applicationIpc.send.updateStatus('update-available');
  });

  autoUpdater.on('download-progress', (info: updater.ProgressInfo) => {
    const {appManager} = classHolder;
    applicationIpc.send.updateStatus('download-progress', info);
    appManager?.getMainWindow()?.setProgressBar(info.percent / 100);
  });

  autoUpdater.on('update-downloaded', () => {
    const {appManager} = classHolder;
    applicationIpc.send.updateStatus('update-downloaded');
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
      applicationIpc.send.updateError();
    } else {
      applicationIpc.send.updateStatus('error', message);
      appManager?.getMainWindow()?.setProgressBar(-1);
    }
  });
}
