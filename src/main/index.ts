import {platform} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

import {electronApp, optimizer} from '@electron-toolkit/utils';
import {app, Menu, nativeImage, net, protocol} from 'electron';
import log from 'electron-log/main';

import trayIconMenu from '../../resources/16x16.png?asset';
import trayIcon from '../../resources/icon.ico?asset';
import darwinIcon from '../../resources/icon-darwin.png?asset';
import {APP_NAME} from '../cross/CrossConstants';
import {isDev, toMs} from '../cross/CrossUtils';
import {checkAppDirectories, getAppDirectory} from './Managements/AppDataManager';
import {checkForUpdate} from './Managements/AppUpdater';
import ContextMenuManager from './Managements/ContextMenuManager';
import {ValidateCards} from './Managements/DataValidator';
import DialogManager from './Managements/DialogManager';
import ElectronAppManager from './Managements/ElectronAppManager';
import {getImageCacheManager, registerImageCacheScheme} from './Managements/ImageCacheManager';
import {browserIPC, listenToAllChannels} from './Managements/Ipc/IpcHandler';
import {stopAllPty} from './Managements/Ipc/Methods/IpcMethods-Pty';
import LinkPreviewManager from './Managements/LinkPreviewManager';
import ExtensionManager from './Managements/Plugin/Extensions/ExtensionManager';
import ModuleManager from './Managements/Plugin/Modules/ModuleManager';
import {PluginManager} from './Managements/Plugin/PluginManager';
import {PluginMigrate} from './Managements/Plugin/PluginMigrate';
import ShareScreenManager from './Managements/ShareScreenManager';
import StaticsManager from './Managements/StaticsManager';
import StorageManager from './Managements/Storage/StorageManager';
import ShowToastWindow from './Managements/ToastWindowManager';
import TrayManager from './Managements/TrayManager';
import downloadDU from './Utilities/CalculateFolderSize/DownloadDU';
import {getPrivilegeText} from './Utilities/Utils';

if (!isDev()) {
  log.initialize();
  Object.assign(console, log.functions);
}

app.commandLine.appendSwitch('disable-http-cache');

(async () => {
  const {default: fixPath} = await import('fix-path');
  fixPath();
})();

export const storageManager = new StorageManager();

export let appManager: ElectronAppManager | undefined = undefined;
export let trayManager: TrayManager | undefined = undefined;
export let cardsValidator: ValidateCards | undefined = undefined;

export const moduleManager: ModuleManager = new ModuleManager();
export const extensionManager: ExtensionManager = new ExtensionManager();
export const pluginManager = new PluginManager(moduleManager, extensionManager);

export const staticManager: StaticsManager = new StaticsManager();
staticManager.checkRequirements().catch(err => {
  // Silently handle - StaticsManager already logs warnings internally
  console.warn('StaticsManager initialization failed:', err?.message || err);
});
export const contextMenuManager: ContextMenuManager = new ContextMenuManager();
export const linkPreviewManager: LinkPreviewManager = new LinkPreviewManager();

export const appStartTime = Date.now();

// Remove default menu
Menu.setApplicationMenu(null);

checkAppDirectories().catch(() => {
  ShowToastWindow({
    buttons: ['exit'],
    title: 'Permission Error',
    message: `Could not create app data directories. Please run as ${getPrivilegeText()}. Alternatively,
     you can change the data folder in the settings page to another folder that does not require admin rights.`,
    type: 'error',
  });
});

const {hardwareAcceleration} = storageManager.getData('app');
if (!hardwareAcceleration) app.disableHardwareAcceleration();

// Apply performance settings as command-line switches
const performanceSettings = storageManager.getData('performance');
if (performanceSettings.forceColorProfile !== 'default') {
  app.commandLine.appendSwitch('force-color-profile', performanceSettings.forceColorProfile);
}
if (performanceSettings.highDpiSupport) {
  app.commandLine.appendSwitch('high-dpi-support', '1');
}
if (performanceSettings.autoplayPolicy !== 'default') {
  app.commandLine.appendSwitch('autoplay-policy', performanceSettings.autoplayPolicy);
}
if (performanceSettings.enableAcceleratedVideoDecode) {
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
}
app.commandLine.appendSwitch('js-flags', `--max-old-space-size=${performanceSettings.jsMaxOldSpaceSize}`);
if (performanceSettings.ignoreGpuBlacklist) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
}
if (performanceSettings.diskCacheSize > 0) {
  app.commandLine.appendSwitch('disk-cache-size', String(performanceSettings.diskCacheSize));
}
if (performanceSettings.enableWebAssemblySimd) {
  app.commandLine.appendSwitch('enable-features', 'WebAssemblySimd');
}
if (performanceSettings.forceHighPerformanceGpu) {
  app.commandLine.appendSwitch('force_high_performance_gpu');
}
if (performanceSettings.disableGpuVsync) {
  app.commandLine.appendSwitch('disable-gpu-vsync');
}
if (performanceSettings.disableFrameRateLimit) {
  app.commandLine.appendSwitch('disable-frame-rate-limit');
}
if (performanceSettings.enableGpuRasterization) {
  app.commandLine.appendSwitch('enable-gpu-rasterization');
}
if (performanceSettings.enableZeroCopy) {
  app.commandLine.appendSwitch('enable-zero-copy');
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'lynxplugin',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

// Register image cache protocol scheme (must be before app.ready)
registerImageCacheScheme();

async function setupApp() {
  extensionManager.setStorageManager(storageManager);

  appManager = new ElectronAppManager();
  extensionManager.setAppManager(appManager);

  await downloadDU();

  app.whenReady().then(async () => {
    // Initialize image cache manager
    await getImageCacheManager().initialize();

    protocol.handle('lynxplugin', request => {
      try {
        const url = new URL(request.url);
        const pluginId = url.hostname;
        const pluginPath = getAppDirectory('Plugins');
        const relativePath = url.pathname || '/';

        const filePath = join(pluginPath, pluginId, relativePath);
        const fileUrl = pathToFileURL(filePath).toString();

        return net.fetch(fileUrl);
      } catch (error) {
        console.error('Failed to resolve lynxplugin protocol URL:', error);
        return new Response('Not Found', {status: 404});
      }
    });

    await pluginManager.initPlugins();
    onAppReady();
  });

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

    const mainWindow = appManager?.getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) {
      appManager?.startLoading();
      appManager?.startApp();
    } else {
      mainWindow.show();
    }
  });
}

async function onAppReady() {
  storageManager.onAppReady();
  storageManager.decryptBrowserData();

  if (!appManager) {
    setTimeout(onAppReady, toMs(1, 'seconds'));
    return;
  }

  await extensionManager.onAppReady();

  electronApp.setAppUserModelId(APP_NAME);

  if (platform() === 'darwin') app.dock?.setIcon(nativeImage.createFromPath(darwinIcon));

  appManager.startLoading();

  trayManager = new TrayManager(trayIcon, trayIconMenu);
  cardsValidator = new ValidateCards();

  extensionManager.setModuleManager(moduleManager);

  listenToAllChannels();

  DialogManager();

  checkForUpdate();

  appManager.startApp();

  appManager.onReadyToShow = handleAppReadyToShow;
  appManager.onCreateWindow = () => browserIPC();
}

function handleAppReadyToShow() {
  extensionManager.onReadyToShow();
  handleTaskbarStatus();
  handleStartupBehavior();
  if (platform() === 'win32') setLoginItemSettings();
  cardsValidator?.checkAndWatch();

  new ShareScreenManager().start();
}

function handleTaskbarStatus() {
  const {taskbarStatus} = storageManager.getData('app');
  const mainWindow = appManager?.getMainWindow();

  switch (taskbarStatus) {
    case 'taskbar-tray':
      trayManager?.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
      break;
    case 'tray-minimized':
    case 'taskbar':
      trayManager?.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
      break;
    case 'tray':
      trayManager?.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(true);
      } else if (platform() === 'darwin' && app.dock?.isVisible()) {
        app.dock?.hide();
      }
      break;
  }
}

function handleStartupBehavior() {
  const {startMinimized, startMaximized, lastSize, openLastSize} = storageManager.getData('app');
  const mainWindow = appManager?.getMainWindow();

  if (!mainWindow) return;

  if (openLastSize && lastSize) {
    const {bounds, maximized} = lastSize;

    if (bounds) mainWindow.setBounds(bounds, false);
    if (maximized) mainWindow.maximize();
  }

  if (startMaximized) {
    mainWindow.maximize();
  }

  if (startMinimized) {
    mainWindow.minimize();
  } else {
    mainWindow.show();
  }
}

function setLoginItemSettings() {
  const {systemStartup} = storageManager.getData('app');
  app.setLoginItemSettings({openAtLogin: systemStartup});
}

if (storageManager.getData('plugin').migrated) {
  setupApp();
} else {
  PluginMigrate(storageManager, pluginManager);
}
