import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions, screen, shell, WebContents} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {appWindowChannels, ShowToastTypes, tabsChannels, winChannels} from '../../cross/IpcChannelAndTypes';
import {storageManager, trayManager} from '../index';
import {getUserAgent, RelaunchApp} from '../Utilities/Utils';
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
  private customContextPosition: {x: number; y: number} | undefined;

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
      preload: path.join(__dirname, '../preload/index.cjs'),
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
      preload: path.join(__dirname, '../preload/index.cjs'),
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

  public showToast(message: string, type: ShowToastTypes) {
    this.getWebContent()?.send(appWindowChannels.showToast, message, type);
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

  public setCustomContextPosition(customPosition?: {x: number; y: number}): void {
    this.customContextPosition = customPosition;
  }

  private positionContextMenuAtCursor() {
    const window = this.getContextMenuWindow();
    if (!window) return;
    const [menuWidth, menuHeight] = window.getContentSize();

    const {x: cursorX, y: cursorY} = screen.getCursorScreenPoint();
    const defaultDisplay = screen.getDisplayNearestPoint({x: cursorX, y: cursorY});
    const defaultWorkArea = defaultDisplay.workArea;
    let newX = cursorX;
    let newY = cursorY;

    if (newX + menuWidth > defaultWorkArea.x + defaultWorkArea.width) {
      newX = defaultWorkArea.x + defaultWorkArea.width - menuWidth;
    }
    if (newY + menuHeight > defaultWorkArea.y + defaultWorkArea.height) {
      newY = defaultWorkArea.y + defaultWorkArea.height - menuHeight;
    }
    if (newX < defaultWorkArea.x) {
      newX = defaultWorkArea.x;
    }
    if (newY < defaultWorkArea.y) {
      newY = defaultWorkArea.y;
    }

    try {
      if (this.customContextPosition) {
        const parentBounds = this.mainWindow!.getBounds();
        let absX = Math.floor(this.customContextPosition.x) + parentBounds.x + 10;
        let absY = Math.floor(this.customContextPosition.y) + parentBounds.y + 10;

        const disp = screen.getDisplayNearestPoint({x: absX, y: absY});
        const workArea = disp.workArea;

        if (absX + menuWidth > workArea.x + workArea.width) {
          absX = workArea.x + workArea.width - menuWidth;
        }
        if (absY + menuHeight > workArea.y + workArea.height) {
          absY = workArea.y + workArea.height - menuHeight;
        }
        if (absX < workArea.x) {
          absX = workArea.x;
        }
        if (absY < workArea.y) {
          absY = workArea.y;
        }

        window.setPosition(absX, absY, true);
      } else {
        window.setPosition(Math.floor(newX), Math.floor(newY), true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private createContextWindow() {
    this.contextMenuWindow = new BrowserWindow({...ElectronAppManager.CONTEXT_WINDOW_CONFIG, parent: this.mainWindow});

    this.contextMenuWindow.webContents.on('before-input-event', (_, input) => {
      if (input.key.toLowerCase() === 'escape') {
        this.contextMenuWindow?.hide();
        this.mainWindow?.focus();
      }
    });

    this.loadAppropriateURL(this.contextMenuWindow, 'context_menu.html');

    this.contextMenuWindow.on('resize', () => this.positionContextMenuAtCursor());
    this.contextMenuWindow.on('show', () => this.positionContextMenuAtCursor());

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
