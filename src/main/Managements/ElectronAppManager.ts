import {platform} from 'node:os';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions, shell, WebContents} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {winChannels} from '../../cross/IpcChannelAndTypes';
import {storageManager, trayManager} from '../index';
import {RelaunchApp} from '../Utilities/Utils';

/**
 * Manages the main application window and loading window for an Electron app.
 */
export default class ElectronAppManager {
  //#region Callbacks

  public onCreateWindow?: () => void;
  public onReadyToShow?: () => void;
  //#endregion

  //#region Private Properties

  private mainWindow?: BrowserWindow;
  private loadingWindow?: BrowserWindow;
  private isLoading?: boolean;
  //#endregion

  //#region Static Properties

  private static readonly MAIN_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 1068,
    height: 768,
    minWidth: 800,
    minHeight: 560,
    icon,
    webPreferences: {
      webviewTag: true,
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
      sandbox: false,
    },
  };
  //#endregion

  //#region Getters

  public getMainWindow(): BrowserWindow | undefined {
    return this.mainWindow;
  }

  public getWebContent(): WebContents | undefined {
    return this.mainWindow?.webContents;
  }

  //#endregion

  //#region Private Methods

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

  /** Creates and configures the main application window. */
  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow(ElectronAppManager.MAIN_WINDOW_CONFIG);
    this.setupMainWindowEventListeners();
    this.loadAppropriateURL(this.mainWindow, 'index.html');
    this.onCreateWindow?.();
  }

  /** Sets up event listeners for the main window. */
  private setupMainWindowEventListeners(): void {
    this.mainWindow?.on('ready-to-show', (): void => {
      setTimeout(() => {
        this.loadingWindow?.close();
        this.onReadyToShow?.();
      }, 1000);
    });

    this.mainWindow?.webContents.setWindowOpenHandler(({url}) => {
      shell.openExternal(url).catch(e => {
        console.error('Error on openExternal: ', e);
      });
      return {action: 'deny'};
    });

    this.mainWindow?.on('minimize', this.handleMinimize);
    this.mainWindow?.on('focus', this.handleFocus);

    const webContent = this.mainWindow?.webContents;
    if (!webContent) return;

    this.mainWindow?.on('focus', (): void => webContent.send(winChannels.onChangeState, {name: 'focus', value: true}));
    this.mainWindow?.on('blur', (): void => webContent.send(winChannels.onChangeState, {name: 'focus', value: false}));

    this.mainWindow?.on('maximize', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'maximize',
        value: true,
      }),
    );
    this.mainWindow?.on('unmaximize', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'maximize',
        value: false,
      }),
    );

    this.mainWindow?.on('enter-full-screen', (): void =>
      webContent.send(winChannels.onChangeState, {
        name: 'full-screen',
        value: true,
      }),
    );
    this.mainWindow?.on('leave-full-screen', (): void =>
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
        this.mainWindow?.hide();
      } else if (platform() === 'darwin' && app.dock.isVisible()) {
        app.dock.hide();
      } else {
        this.mainWindow?.setSkipTaskbar(true);
      }
    }
  };

  /** Handles the focus event for the main window. */
  private handleFocus = (): void => {
    if (storageManager.getData('app').taskbarStatus === 'tray-minimized') {
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        this.mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
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

  //#endregion

  //#region Public Methods

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

  //#endregion
}
