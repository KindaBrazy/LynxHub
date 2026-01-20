import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import appChannels from '@lynx_cross/consts/ipc_channels/application';
import {BrowserWindow, BrowserWindowConstructorOptions, ipcMain} from 'electron';

import icon from '../../../resources/icon.png?asset';
import classHolder from '../core/class_holder';
import {getWindowColor} from '../utils';

export default class LoadingWindow {
  private window?: BrowserWindow;

  private static readonly LOADING_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 307,
    height: 350,
    resizable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: process.platform === 'darwin' ? 'customButtonsOnHover' : 'default',
    icon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  public async startLoading() {
    ipcMain.handle(
      appChannels.disableLoadingAnimations,
      () => classHolder.storageManager.getData('app').disableLoadingAnimations,
    );

    return new Promise<void>(resolve => {
      this.window = new BrowserWindow(LoadingWindow.LOADING_WINDOW_CONFIG);

      this.window.setBackgroundColor(getWindowColor('dark'));

      this.window.on('close', () => {
        this.window = undefined;
      });

      this.window.on('ready-to-show', () => {
        this.window!.show();
        resolve();
      });

      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/loading.html`);
      } else {
        this.window.loadFile(path.join(__dirname, `../renderer/loading.html`));
      }
    });
  }

  public closeWindow() {
    this.window?.close();
  }
}
