import {platform} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

import {app, net, protocol} from 'electron';

import {APP_BUILD_NUMBER, APP_VERSION} from '../cross/CrossConstants';
import {getAppDirectory} from './Managements/AppDataManager';
import getClassHolder from './Managements/ClassHolder';
import {getImageCacheManager, registerImageCacheScheme} from './Managements/ImageCacheManager';
import ShareScreenManager from './Managements/ShareScreenManager';
import {initSentry} from './Secure/SentryInit';

export async function beforeAppReady() {
  const {storageManager, appStartTime} = getClassHolder();

  const {hardwareAcceleration, collectErrors} = storageManager.getData('app');
  const performanceSettings = storageManager.getData('performance');

  if (!hardwareAcceleration) app.disableHardwareAcceleration();
  if (collectErrors)
    initSentry(appStartTime, `Version:${APP_VERSION}, Build:${APP_BUILD_NUMBER}`, getAppDirectory('Plugins'));

  // Apply performance settings as command-line switches
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

  // Register plugin protocol scheme
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

  // Register image cache protocol scheme
  registerImageCacheScheme();
}

export async function handleProtocols() {
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
}

export function handleAppReadyToShow() {
  const {extensionManager, cardsValidator} = getClassHolder();
  extensionManager?.onReadyToShow();
  handleTaskbarStatus();
  handleStartupBehavior();
  if (platform() === 'win32') setLoginItemSettings();
  cardsValidator?.checkAndWatch();

  new ShareScreenManager().start();
}

function handleTaskbarStatus() {
  const {storageManager, appManager, trayManager} = getClassHolder();

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
  const {storageManager, appManager} = getClassHolder();

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
  const {storageManager} = getClassHolder();

  const {systemStartup} = storageManager.getData('app');
  app.setLoginItemSettings({openAtLogin: systemStartup});
}
