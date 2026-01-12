import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, BrowserWindowConstructorOptions, ipcMain} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {otherChannels} from '../../cross/IpcChannelAndTypes';
import classHolder from '../Managements/ClassHolder';
import {getWindowColor} from '../Utilities/Utils';

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
      otherChannels.disableLoadingAnimations,
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
