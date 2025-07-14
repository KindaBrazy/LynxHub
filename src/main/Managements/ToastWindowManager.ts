import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {app, BrowserWindow, ipcMain} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {ToastWindow_MessageType} from '../../cross/CrossTypes';
import {RelaunchApp} from '../Utilities/Utils';

export default function ShowToastWindow(message: ToastWindow_MessageType) {
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

  window.on('closed', () => {
    window.destroy();
  });

  ipcMain.on('close_toast', () => {
    window.close();
  });
  ipcMain.on('exit_app', () => {
    app.exit();
  });
  ipcMain.on('restart_app', () => RelaunchApp(false));
}
