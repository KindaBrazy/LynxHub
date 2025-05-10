import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions, shell, WebContents} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {tabsChannels, winChannels} from '../../cross/IpcChannelAndTypes';
import {storageManager, trayManager} from '../index';
import {getUserAgent, positionContextMenuAtCursor, RelaunchApp} from '../Utilities/Utils';
import RegisterHotkeys from './HotkeysManager';

/**
 * Manages the main application window and loading window for an Electron app.
 */
export default class ElectronAppManager {
  public onCreateWindow?: () => void;
  public onReadyToShow?: () => void;

  private mainWindow?: BrowserWindow;
  private contextMenuWindow?: BrowserWindow;
  private loadingWindow?: BrowserWindow;
  private isLoading?: boolean;

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

  private static readonly CONTEXT_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 180,
    height: 290,
    minWidth: 0,
    minHeight: 0,
    resizable: false,
    maximizable: false,
    skipTaskbar: true,
    useContentSize: true,
    icon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/context_menu.cjs'),
      sandbox: false,
    },
  };

  private static readonly LOADING_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 307,
    height: 350,
    resizable: false,
    maximizable: false,
    icon,
    webPreferences: {
      sandbox: false,
    },
  };

  public getMainWindow(): BrowserWindow | undefined {
    if (!this.mainWindow) return undefined;

    if (this.mainWindow.isDestroyed()) {
      this.mainWindow = undefined;
      return undefined;
    }

    return this.mainWindow;
  }

  public getWebContent(): WebContents | undefined {
    return this.getMainWindow()?.webContents;
  }

  public getContextMenuWindow(): BrowserWindow | undefined {
    return this.contextMenuWindow;
  }

  /** Creates and configures the loading window. */
  private createLoadingWindow(): void {
    this.loadingWindow = new BrowserWindow(ElectronAppManager.LOADING_WINDOW_CONFIG);
    this.setupLoadingWindowEventListeners();
    this.loadAppropriateURL(this.loadingWindow, 'loading.html');
  }

  /** Sets up event listeners for the loading window. */
  private setupLoadingWindowEventListeners(): void {
    this.loadingWindow?.on('close', () => {
      this.loadingWindow = undefined;
    });

    this.loadingWindow?.on('ready-to-show', () => {
      this.loadingWindow?.show();
      this.isLoading = true;
    });
  }

  private createContextWindow() {
    this.contextMenuWindow = new BrowserWindow({...ElectronAppManager.CONTEXT_WINDOW_CONFIG, parent: this.mainWindow});

    this.loadAppropriateURL(this.contextMenuWindow, 'context_menu.html');

    this.contextMenuWindow.on('resize', () => {
      const window = this.contextMenuWindow;
      if (!window) return;

      const [width, height] = window.getContentSize();
      positionContextMenuAtCursor(window, width, height);
    });

    this.contextMenuWindow.on('show', () => {
      const window = this.contextMenuWindow;
      if (!window) return;

      const [width, height] = window.getContentSize();
      positionContextMenuAtCursor(window, width, height);
    });

    this.contextMenuWindow.on('blur', () => this.contextMenuWindow?.hide());
  }

  /** Creates and configures the main application window. */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow(ElectronAppManager.MAIN_WINDOW_CONFIG);

    RegisterHotkeys(this.mainWindow.webContents);

    this.setupMainWindowEventListeners();
    this.loadAppropriateURL(this.mainWindow, 'index.html');
    this.onCreateWindow?.();
    this.createContextWindow();
  }

  /** Sets up event listeners for the main window. */
  private setupMainWindowEventListeners(): void {
    this.getMainWindow()?.on('ready-to-show', (): void => {
      this.getWebContent()?.setUserAgent(getUserAgent());
      setTimeout(() => {
        this.loadingWindow?.close();
        this.onReadyToShow?.();
      }, 1500);
    });

    this.getWebContent()?.setWindowOpenHandler(({url}) => {
      const openExternal = storageManager.getData('app').openLinkExternal;
      if (openExternal) {
        shell.openExternal(url);
      } else {
        this.getWebContent()?.send(tabsChannels.onNewTab, url);
      }
      return {action: 'deny'};
    });

    this.getMainWindow()?.on('minimize', this.handleMinimize);
    this.getMainWindow()?.on('focus', this.handleFocus);

    const webContent = this.getWebContent();
    if (!webContent) return;

    this.getMainWindow()?.on('focus', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'focus',
        value: true,
      }),
    );
    this.getMainWindow()?.on('blur', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'focus',
        value: false,
      }),
    );

    this.getMainWindow()?.on('maximize', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'maximize',
        value: true,
      }),
    );
    this.getMainWindow()?.on('unmaximize', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'maximize',
        value: false,
      }),
    );

    this.getMainWindow()?.on('enter-full-screen', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'full-screen',
        value: true,
      }),
    );
    this.getMainWindow()?.on('leave-full-screen', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'full-screen',
        value: false,
      }),
    );
  }

  /** Handles the minimized event for the main window. */
  private handleMinimize = (): void => {
    if (storageManager.getData('app').taskbarStatus === 'tray-minimized') {
      trayManager.createTrayIcon();
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
    if (storageManager.getData('app').taskbarStatus === 'tray-minimized') {
      trayManager.destroyTrayIcon();
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

  /** Sets up global application event listeners. */
  private setupAppEventListeners(): void {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  /** Restarts the application. */
  public restart(): void {
    RelaunchApp();
  }

  /** Creates and initializes the application windows. */
  public startLoading(): void {
    this.createLoadingWindow();
    this.setupAppEventListeners();
  }

  public startApp(): void {
    if (this.isLoading) {
      this.createMainWindow();
    } else {
      setTimeout(() => {
        this.startApp();
      }, 300);
    }
  }
}
