import {platform} from 'node:os';

import {electronApp, is, optimizer} from '@electron-toolkit/utils';
import {app, BrowserWindow, Menu, nativeImage} from 'electron';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} from 'electron-devtools-installer';
import log from 'electron-log/main';

import trayIconMenu from '../../resources/16x16.png?asset';
import trayIcon from '../../resources/icon.ico?asset';
import darwinIcon from '../../resources/icon-darwin.png?asset';
import {APP_NAME} from '../cross/CrossConstants';
import AppInitializer from './Managements/AppInitializer';
import {checkForUpdate} from './Managements/AppUpdater';
import {ValidateCards} from './Managements/DataValidator';
import DialogManager from './Managements/DialogManager';
import DiscordRpcManager from './Managements/DiscordRpcManager';
import ElectronAppManager from './Managements/ElectronAppManager';
import serveExtensions from './Managements/ExtensionManager';
import {listenToAllChannels} from './Managements/Ipc/IpcHandler';
import ModuleManager from './Managements/ModuleManager';
import StorageManager from './Managements/Storage/StorageManager';
import TrayManager from './Managements/TrayManager';
import downloadDU from './Utilities/CalculateFolderSize/DownloadDU';

log.initialize();
Object.assign(console, log.functions);

app.commandLine.appendSwitch('disable-http-cache');

export const storageManager = new StorageManager();
export let appManager: ElectronAppManager;
export let trayManager: TrayManager;
export let discordRpcManager: DiscordRpcManager;
export let cardsValidator: ValidateCards;
export let moduleManager: ModuleManager;

// Remove default menu
Menu.setApplicationMenu(null);

function setupApp() {
  appManager = new ElectronAppManager();

  downloadDU();

  app.whenReady().then(onAppReady);

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      appManager.startLoading();
      appManager.startApp();
    }
  });
}

async function onAppReady() {
  electronApp.setAppUserModelId(APP_NAME);

  if (platform() === 'darwin') app.dock.setIcon(nativeImage.createFromPath(darwinIcon));

  appManager.startLoading();

  trayManager = new TrayManager(trayIcon, trayIconMenu);
  discordRpcManager = new DiscordRpcManager();
  cardsValidator = new ValidateCards();
  moduleManager = new ModuleManager();

  await moduleManager.createServer();

  await serveExtensions();

  // Install browser developer extensions
  if (is.dev) {
    try {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]);
    } catch (e) {
      console.error(e);
    }
  }

  listenToAllChannels();

  DialogManager();

  checkForUpdate();

  appManager.startApp();

  appManager.onReadyToShow = handleAppReadyToShow;
}

function handleAppReadyToShow() {
  handleTaskbarStatus();
  handleStartupBehavior();
  discordRpcManager.start();
  if (platform() === 'win32') setLoginItemSettings();
  cardsValidator.checkAndWatch();
}

function handleTaskbarStatus() {
  const {taskbarStatus} = storageManager.getData('app');
  const mainWindow = appManager.getMainWindow();

  switch (taskbarStatus) {
    case 'taskbar-tray':
      trayManager.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
      break;
    case 'taskbar':
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
      break;
    case 'tray':
      trayManager.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(true);
      } else if (platform() === 'darwin' && app.dock.isVisible()) {
        app.dock.hide();
      }
      break;
    case 'tray-minimized':
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
      break;
  }
}

function handleStartupBehavior() {
  const {startMinimized} = storageManager.getData('app');
  const mainWindow = appManager.getMainWindow();

  if (startMinimized) {
    mainWindow?.minimize();
  } else {
    mainWindow?.show();
  }
}

function setLoginItemSettings() {
  const {systemStartup} = storageManager.getData('app');
  app.setLoginItemSettings({openAtLogin: systemStartup});
}

function initApp() {
  if (!storageManager.getData('app').initialized) {
    new AppInitializer().createInitializer();
  } else {
    setupApp();
  }
}

initApp();
