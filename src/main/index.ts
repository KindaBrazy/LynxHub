import {platform} from 'node:os';

import {electronApp, optimizer} from '@electron-toolkit/utils';
import {APP_NAME} from '@lynx_common/consts';
import {isDev} from '@lynx_common/utils';
import {app, Menu, nativeImage} from 'electron';
import log from 'electron-log/main';

import darwinIcon from '../../resources/icon-darwin.png?asset';
import {beforeAppReady, handleAppReadyToShow, handleProtocols} from './indexMethods';
import {listenToIpcChannels} from './ipc';
import {listenBrowser, resetBrowserIPC} from './ipc/browser';
import listenDialogsWindow from './ipc/dialogsWindow';
import {stopAllPty} from './ipc/methods/pty';
import classHolder from './managers/classHolder';
import {checkAppDirectories} from './managers/dataFolder';
import {getImageCacheManager} from './managers/imageCache';
import {checkForUpdate} from './managers/updater';
import PatreonAuth from './monitoring/patreonAuth';
import {getPrivilegeText} from './utils';
import downloadDU from './utils/calcFolderSize/downloadDu';
import LoadingWindow from './windows/loading';
import ShowToastWindow from './windows/toast';

// In production save logs to file for reporting
if (!isDev()) {
  log.initialize();
  Object.assign(console, log.functions);
}

// Suppress menu as we use in app menu's
Menu.setApplicationMenu(null);

// Initialize command-line switches and protocol scheme before app getting ready
beforeAppReady();

// First start loading window when app was ready
const loadingWindow = new LoadingWindow();

app.whenReady().then(async () => {
  await loadingWindow.startLoading();

  await startLynxHub();
});

// Second start lynxhub window after loading
async function startLynxHub() {
  // Fix the macOS environment paths
  const {default: fixPath} = await import('fix-path');
  fixPath();

  // Create required folders for app
  try {
    await checkAppDirectories();
  } catch (_) {
    ShowToastWindow({
      buttons: ['exit'],
      title: 'Permission Error',
      message: `Could not create app data directories. Please run as ${getPrivilegeText()}. Alternatively,
     you can change the data folder in the settings page to another folder that does not require admin rights.`,
      type: 'error',
    });
  }

  // Initialize and hold classes
  const {storageManager} = classHolder;

  storageManager.onAppReady();
  storageManager.decryptBrowserData();

  await classHolder.initializeManagers();
  await classHolder.checkStaticsRequirements();

  await downloadDU();

  await handleProtocols();

  await classHolder.pluginManager!.initPlugins();
  await classHolder.extensionManager!.onAppReady();

  electronApp.setAppUserModelId(APP_NAME);

  if (platform() === 'darwin') app.dock?.setIcon(nativeImage.createFromPath(darwinIcon));

  listenToIpcChannels();

  PatreonAuth();

  const appManager = await classHolder.waitForClass('appManager');

  appManager.onCreateWindow(() => {
    listenBrowser();
    listenDialogsWindow();
  });
  appManager.onReadyToShow(() => {
    loadingWindow.closeWindow();
    handleAppReadyToShow();
  });

  appManager.startApp();

  checkForUpdate();
}

// ====================================== App Events ======================================

let isQuitting = false;

app.on('before-quit', e => {
  if (!isQuitting) {
    e.preventDefault();
    // Stop image cache manager
    getImageCacheManager().stop();
    stopAllPty().then(() => {
      isQuitting = true;
      app.quit();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window);
});

// Handle child process crashes (GPU, utility processes, etc.)
// These are Chromium internal issues, not app bugs - log and ignore
app.on('child-process-gone', (_event, details) => {
  const {type, reason, exitCode} = details;
  // Only log non-normal exits for debugging, don't report to Sentry
  if (reason !== 'clean-exit' && reason !== 'killed') {
    console.warn(`Child process (${type}) exited: reason=${reason}, exitCode=${exitCode}`);
  }
});

app.on('activate', async () => {
  // Ensure app is ready before creating windows
  if (!app.isReady()) {
    await app.whenReady();
  }

  const appManager = classHolder.appManager;
  const mainWindow = appManager?.getMainWindow();
  if (!mainWindow || mainWindow.isDestroyed()) {
    // Reset browserIPC state so it reinitializes with the new window
    resetBrowserIPC();
    appManager?.startApp();
  } else {
    mainWindow.show();
  }
});
