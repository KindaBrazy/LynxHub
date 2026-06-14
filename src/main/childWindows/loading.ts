import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {isMac, isWin} from '@lynx_common/utils';
import {applicationIpc} from '@lynx_main/ipc/application';
import classHolder from '@lynx_main/managers/classHolder';
import {getWindowColor} from '@lynx_main/utils';
import {BrowserWindow, BrowserWindowConstructorOptions} from 'electron';

import icon from '../../../resources/icon.png?asset';

export default class LoadingWindow {
  private window?: BrowserWindow;

  private static readonly LOADING_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 307,
    height: 350,
    resizable: isWin,
    minWidth: isWin ? 307 : undefined,
    maxWidth: isWin ? 307 : undefined,
    minHeight: isWin ? 350 : undefined,
    maxHeight: isWin ? 350 : undefined,
    maximizable: false,
    minimizable: false,
    titleBarStyle: isMac ? 'customButtonsOnHover' : 'default',
    icon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  /**
   * Initializes and shows the loading window.
   * Resolves when the window is ready to show.
   */
  public async startLoading(): Promise<void> {
    this.registerIpcHandlers();

    return new Promise<void>(resolve => {
      this.window = new BrowserWindow(LoadingWindow.LOADING_WINDOW_CONFIG);
      this.window.setBackgroundColor(getWindowColor('dark'));

      this.setupWindowListeners(resolve);
      this.loadWindowContent();
    });
  }

  private registerIpcHandlers() {
    applicationIpc.handle.disableLoadingAnimations(
      () => classHolder.storageManager.getData('app').disableLoadingAnimations,
    );
  }

  private setupWindowListeners(resolve: () => void) {
    if (!this.window) return;

    this.window.on('close', () => {
      this.window = undefined;
    });

    this.window.on('ready-to-show', () => {
      this.window?.show();
      resolve();
    });
  }

  private loadWindowContent() {
    if (!this.window) return;

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/loading.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/loading.html'));
    }
  }

  public closeWindow() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }
}
