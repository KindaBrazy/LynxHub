import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, ipcMain} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {ToastWindow_MessageType} from '../../cross/CrossTypes';
import {appWindowChannels} from '../../cross/IpcChannelAndTypes';
import {RelaunchApp} from '../Utilities/Utils';

export default function ShowToastWindow(
  message: ToastWindow_MessageType,
  onBtnPress?: (id: string, window?: BrowserWindow) => void,
) {
  const show = () => {
    const window = new BrowserWindow({
      frame: false,
      show: false,
      height: 250,
      width: 600,
      resizable: false,
      maximizable: false,
      icon,
      webPreferences: {
        preload: path.join(__dirname, '../preload/only_ipc.cjs'),
        sandbox: false,
      },
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/toast_window.html`);
    } else {
      window.loadFile(path.join(__dirname, `../renderer/toast_window.html`));
    }

    window.on('ready-to-show', () => {
      window.show();
      window.webContents.send('show_message', message);
    });

    const handleCloseToast = () => {
      window.close();
    };

    const handleExitApp = () => {
      app.exit();
    };

    const handleRestartApp = () => RelaunchApp(false);

    const handleToastBtnPress = (_: any, id: string) => {
      if (onBtnPress) onBtnPress(id, window);
    };

    ipcMain.on('close_toast', handleCloseToast);
    ipcMain.on('exit_app', handleExitApp);
    ipcMain.on('restart_app', handleRestartApp);
    ipcMain.on(appWindowChannels.toastBtnPress, handleToastBtnPress);

    window.on('closed', () => {
      // Clean up listeners when toast window is closed
      ipcMain.removeListener('close_toast', handleCloseToast);
      ipcMain.removeListener('exit_app', handleExitApp);
      ipcMain.removeListener('restart_app', handleRestartApp);
      ipcMain.removeListener(appWindowChannels.toastBtnPress, handleToastBtnPress);
      window.destroy();
    });
  };

  if (app.isReady()) {
    show();
  } else {
    app.whenReady().then(() => show());
  }
}
