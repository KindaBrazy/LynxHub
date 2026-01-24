import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import classHolder from '@lynx_main/core/class_holder';
import RegisterHotkeys from '@lynx_main/core/hotkeys';
import {applicationIpc} from '@lynx_main/ipc/application';
import lynxIpc from '@lynx_main/ipc/lynxIpc';
import {getUserAgent, getWindowColor, RelaunchApp} from '@lynx_main/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions, shell, WebContents} from 'electron';

import icon from '../../../resources/icon.png?asset';

type Listener = () => void;

/**
 * Manages the main application window and loading window for an Electron app.
 */
export default class ElectronAppManager {
  private createWindowListeners: Listener[] = [];
  private readyToShowListeners: Listener[] = [];

  private mainWindow?: BrowserWindow;

  private static readonly MAIN_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 1068,
    height: 768,
    minWidth: 800,
    minHeight: 560,
    icon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  public onCreateWindow(callback: Listener) {
    this.createWindowListeners.push(callback);
  }
  public onReadyToShow(callback: Listener) {
    this.readyToShowListeners.push(callback);
  }

  public getMainWindow(): BrowserWindow | undefined {
    if (!this.mainWindow) return undefined;

    if (this.mainWindow.isDestroyed()) {
      this.mainWindow = undefined;
      return undefined;
    }

    return this.mainWindow;
  }

  public getWebContent(): WebContents | undefined {
    const webContent = this.getMainWindow()?.webContents;

    if (!webContent || webContent.isDestroyed()) return undefined;

    return webContent;
  }

  public sendMessage(channel: string, ...args: any[]): void {
    const webContents = this.getWebContent();
    if (!webContents) {
      console.error('Failed to send message: appManager or webContents is not available.');
      return;
    }

    lynxIpc.send(webContents, channel, ...args);
  }

  /** Creates and configures the main application window. */
  private createMainWindow(): void {
    const {contextMenuManager, linkPreviewManager} = classHolder;
    this.mainWindow = new BrowserWindow(ElectronAppManager.MAIN_WINDOW_CONFIG);
    this.mainWindow.setBackgroundColor(getWindowColor());

    RegisterHotkeys(this.mainWindow.webContents);

    this.setupMainWindowEventListeners();
    this.loadAppropriateURL(this.mainWindow, 'index.html');
    this.createWindowListeners.forEach(listener => listener());
    contextMenuManager?.createWindow(this.mainWindow);
    linkPreviewManager?.createWindow(this.mainWindow);
  }

  /** Sets up event listeners for the main window. */
  private setupMainWindowEventListeners(): void {
    this.getMainWindow()?.once('ready-to-show', () => {
      this.getWebContent()?.setUserAgent(getUserAgent());
      setTimeout(() => {
        this.readyToShowListeners.forEach(listener => listener());
      }, 2000);
    });

    this.getWebContent()?.setWindowOpenHandler(({url, disposition}) => {
      const {storageManager} = classHolder;
      const openExternal = storageManager.getData('app').openLinkExternal;
      if (openExternal) {
        shell.openExternal(url);
      } else {
        // background-tab = middle-click = open in background (don't switch)
        const openInBackground = disposition === 'background-tab';
        applicationIpc.send.onNewTab(url, openInBackground);
      }
      return {action: 'deny'};
    });

    this.getMainWindow()?.on('close', () => {
      this.mainWindow = undefined;
    });

    this.getMainWindow()?.on('minimize', this.handleMinimize);
    this.getMainWindow()?.on('focus', this.handleFocus);

    const webContent = this.getWebContent();
    if (!webContent) return;

    this.getMainWindow()?.on('focus', (): void => applicationIpc.send.changeWinState({name: 'focus', value: true}));
    this.getMainWindow()?.on('blur', (): void => applicationIpc.send.changeWinState({name: 'focus', value: false}));

    this.getMainWindow()?.on('maximize', (): void =>
      applicationIpc.send.changeWinState({name: 'maximize', value: true}),
    );
    this.getMainWindow()?.on('unmaximize', (): void =>
      applicationIpc.send.changeWinState({name: 'maximize', value: false}),
    );

    this.getMainWindow()?.on('enter-full-screen', (): void =>
      applicationIpc.send.changeWinState({name: 'full-screen', value: true}),
    );
    this.getMainWindow()?.on('leave-full-screen', (): void =>
      applicationIpc.send.changeWinState({name: 'full-screen', value: false}),
    );
  }

  /** Handles the minimized event for the main window. */
  private handleMinimize = (): void => {
    const {storageManager, trayManager} = classHolder;
    if (storageManager.getData('app').taskbarStatus === 'tray-minimized') {
      trayManager?.createTrayIcon();
      if (platform() === 'linux') {
        this.getMainWindow()?.hide();
      } else if (platform() === 'darwin' && app.dock?.isVisible()) {
        app.dock?.hide();
      } else {
        this.getMainWindow()?.setSkipTaskbar(true);
      }
    }
  };

  /** Handles the focus event for the main window. */
  private handleFocus = (): void => {
    const {storageManager, trayManager} = classHolder;
    if (storageManager.getData('app').taskbarStatus === 'tray-minimized') {
      trayManager?.destroyTrayIcon();
      if (platform() === 'win32') {
        this.getMainWindow()?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
    }
  };

  /**
   * Loads the appropriate URL based on the environment.
   * @param window - The BrowserWindow to load the URL into.
   * @param htmlFile - The HTML file to load in production mode.
   */
  private loadAppropriateURL(window: BrowserWindow, htmlFile: string): void {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${htmlFile}`);
    } else {
      window.loadFile(path.join(__dirname, `../renderer/${htmlFile}`));
    }
  }

  /** Restarts the application. */
  public restart(): void {
    RelaunchApp();
  }

  public startApp(): void {
    this.createMainWindow();
  }
}
