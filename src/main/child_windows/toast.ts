import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import toastWindowChannels from '@lynx_common/consts/ipc_channels/toast_window';
import {ToastWindow_MessageType} from '@lynx_common/types';
import classHolder from '@lynx_main/core/class_holder';
import lynxIpc from '@lynx_main/ipc/lynxIpc';
import {RelaunchApp} from '@lynx_main/utils';
import {app, BrowserWindow} from 'electron';

import icon from '../../../resources/icon.png?asset';

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
        preload: path.join(__dirname, '../preload/index.cjs'),
        sandbox: false,
      },
    });

    classHolder.toastWindow = window;

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/toast.html`);
    } else {
      window.loadFile(path.join(__dirname, `../renderer/toast.html`));
    }

    window.on('ready-to-show', () => {
      window.show();
      window.webContents.send(toastWindowChannels.onShowMessage, message);
    });

    const offCloseToast = lynxIpc.on(toastWindowChannels.closeToast, () => window.close());
    const offExitApp = lynxIpc.on(toastWindowChannels.exitApp, () => app.exit());
    const offRestartApp = lynxIpc.on(toastWindowChannels.restartApp, () => RelaunchApp(false));
    const offCustomBtnPressed = lynxIpc.on(toastWindowChannels.customBtnPressed, (_: any, id: string) => {
      if (onBtnPress) onBtnPress(id, window);
    });

    window.on('closed', () => {
      // Clean up listeners when toast window is closed
      offCloseToast();
      offExitApp();
      offRestartApp();
      offCustomBtnPressed();

      window.destroy();
      classHolder.toastWindow = undefined;
    });
  };

  if (app.isReady()) {
    show();
  } else {
    app.whenReady().then(() => show());
  }
}
