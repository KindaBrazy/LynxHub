import {platform} from 'node:os';

import {electronApp, optimizer} from '@electron-toolkit/utils';
import {app, Menu, nativeImage} from 'electron';
import log from 'electron-log/main';

import darwinIcon from '../../resources/icon-darwin.png?asset';
import {APP_NAME} from '../cross/consts';
import {isDev} from '../cross/utils';
import LoadingWindow from './child_windows/loading';
import ShowToastWindow from './child_windows/toast';
import classHolder from './core/class_holder';
import {checkAppDirectories} from './core/data_folder';
import {getImageCacheManager} from './core/image_cache';
import {checkForUpdate} from './core/updater';
import {beforeAppReady, handleAppReadyToShow, handleProtocols} from './index_methods';
import {browserIPC, listenToIpcChannels, resetBrowserIPC} from './ipc';
import {stopAllPty} from './ipc/methods/pty';
import PatreonAuth from './secure/patreon_auth';
import {getPrivilegeText} from './utils';
import downloadDU from './utils/calc_folder_size/download_du';

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

  const appManager = classHolder.appManager!;
  appManager.onCreateWindow(() => browserIPC());
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
