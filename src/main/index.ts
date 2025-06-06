import {platform} from 'node:os';

import {electronApp, optimizer} from '@electron-toolkit/utils';
import {app, BrowserWindow, Menu, nativeImage} from 'electron';
import log from 'electron-log/main';

import trayIconMenu from '../../resources/16x16.png?asset';
import trayIcon from '../../resources/icon.ico?asset';
import darwinIcon from '../../resources/icon-darwin.png?asset';
import {APP_NAME} from '../cross/CrossConstants';
import {isDev} from '../cross/CrossUtils';
import {checkAppDirectories} from './Managements/AppDataManager';
import AppInitializer from './Managements/AppInitializer';
import {checkForUpdate} from './Managements/AppUpdater';
import BrowserManager from './Managements/BrowserManager';
import {ValidateCards} from './Managements/DataValidator';
import DialogManager from './Managements/DialogManager';
import DiscordRpcManager from './Managements/DiscordRpcManager';
import ElectronAppManager from './Managements/ElectronAppManager';
import {listenToAllChannels} from './Managements/Ipc/IpcHandler';
import {stopAllPty} from './Managements/Ipc/Methods/IpcMethods-Pty';
import ExtensionManager from './Managements/Plugin/Extensions/ExtensionManager';
import ModuleManager from './Managements/Plugin/ModuleManager';
import StorageManager from './Managements/Storage/StorageManager';
import TrayManager from './Managements/TrayManager';
import downloadDU from './Utilities/CalculateFolderSize/DownloadDU';

if (!isDev()) {
  log.initialize();
  Object.assign(console, log.functions);
}

app.commandLine.appendSwitch('disable-http-cache');

export const storageManager = new StorageManager();

export let appManager: ElectronAppManager;
export let trayManager: TrayManager;
export let discordRpcManager: DiscordRpcManager;
export let cardsValidator: ValidateCards;
export let moduleManager: ModuleManager;
export let browserManager: BrowserManager;

export const extensionManager: ExtensionManager = new ExtensionManager();

// Remove default menu
Menu.setApplicationMenu(null);

checkAppDirectories();

if (!storageManager.getData('app').hardwareAcceleration) {
  app.disableHardwareAcceleration();
}

async function setupApp() {
  await extensionManager.createServer();
  extensionManager.setStorageManager(storageManager);

  appManager = new ElectronAppManager();
  extensionManager.setAppManager(appManager);

  await downloadDU();

  app.whenReady().then(onAppReady);

  let isQuitting = false;

  app.on('before-quit', e => {
    if (!isQuitting) {
      e.preventDefault();
      stopAllPty().then(() => {
        isQuitting = true;
        app.quit();
      });
    }
  });

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
  await extensionManager.onAppReady();

  electronApp.setAppUserModelId(APP_NAME);

  if (platform() === 'darwin') app.dock?.setIcon(nativeImage.createFromPath(darwinIcon));

  appManager.startLoading();

  trayManager = new TrayManager(trayIcon, trayIconMenu);
  discordRpcManager = new DiscordRpcManager();
  cardsValidator = new ValidateCards();
  moduleManager = new ModuleManager();

  extensionManager.setDiscordRpcManager(discordRpcManager);

  await moduleManager.createServer();
  extensionManager.setModuleManager(moduleManager);

  listenToAllChannels();

  DialogManager();

  checkForUpdate();

  appManager.startApp();

  appManager.onReadyToShow = handleAppReadyToShow;
  appManager.onCreateWindow = () => {
    const mainWindow = appManager.getMainWindow();
    if (mainWindow) browserManager = new BrowserManager(mainWindow);
  };
}

function handleAppReadyToShow() {
  extensionManager.onReadyToShow();
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
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
      break;
    case 'taskbar':
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
      break;
    case 'tray':
      trayManager.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(true);
      } else if (platform() === 'darwin' && app.dock?.isVisible()) {
        app.dock?.hide();
      }
      break;
    case 'tray-minimized':
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
      break;
  }
}

function handleStartupBehavior() {
  const {startMinimized, lastSize, openLastSize} = storageManager.getData('app');
  const mainWindow = appManager.getMainWindow();

  if (startMinimized) {
    mainWindow?.minimize();
  } else {
    if (openLastSize) {
      if (lastSize?.bounds) mainWindow?.setBounds(lastSize.bounds, false);
      if (lastSize?.maximized) mainWindow?.maximize();
    }
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
