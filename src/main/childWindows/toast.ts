import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {toastWindowChannels} from '@lynx_common/consts/ipcChannels/toastWindow';
import {ToastWindowMessageType} from '@lynx_common/types';
import {isWin} from '@lynx_common/utils';
import lynxIpc from '@lynx_main/ipc/ipcWrapper';
import classHolder from '@lynx_main/managers/classHolder';
import {RelaunchApp} from '@lynx_main/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions} from 'electron';

import icon from '../../../resources/icon.png?asset';

const WINDOW_CONFIG: BrowserWindowConstructorOptions = {
  frame: false,
  show: false,
  height: 250,
  width: 600,
  resizable: isWin,
  minWidth: isWin ? 600 : undefined,
  maxWidth: isWin ? 600 : undefined,
  minHeight: isWin ? 250 : undefined,
  maxHeight: isWin ? 250 : undefined,
  maximizable: false,
  icon,
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.cjs'),
    sandbox: false,
  },
};

/**
 * Creates and shows a toast window with the specified message and actions.
 * @param message - The message content and configuration
 * @param onBtnPress - Optional callback for custom button presses
 */
export default function ShowToastWindow(
  message: ToastWindowMessageType,
  onBtnPress?: (id: string, window?: BrowserWindow) => void,
) {
  const createWindow = () => {
    // Create new window using spread to avoid modifying shared config
    const window = new BrowserWindow({...WINDOW_CONFIG});
    classHolder.toastWindow = window;

    loadWindowContent(window);
    setupWindowListeners(window, message, onBtnPress);
  };

  if (app.isReady()) {
    createWindow();
  } else {
    app.whenReady().then(createWindow);
  }
}

function loadWindowContent(window: BrowserWindow) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/toast.html`);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/toast.html`));
  }
}

function setupWindowListeners(
  window: BrowserWindow,
  message: ToastWindowMessageType,
  onBtnPress?: (id: string, window?: BrowserWindow) => void,
) {
  // Show window and send message when content is ready
  window.once('ready-to-show', () => {
    window.show();
    window.webContents.send(toastWindowChannels.onShowMessage, message);
  });

  const cleanupIpc = registerIpcHandlers(window, onBtnPress);

  window.on('closed', () => {
    cleanupIpc();
    classHolder.toastWindow = undefined;
    // Window is already destroyed when 'closed' fires, so no need to call destroy()
  });
}

function registerIpcHandlers(window: BrowserWindow, onBtnPress?: (id: string, window?: BrowserWindow) => void) {
  const offCloseToast = lynxIpc.on(toastWindowChannels.closeToast, () => {
    if (!window.isDestroyed()) window.close();
  });

  const offExitApp = lynxIpc.on(toastWindowChannels.exitApp, () => app.exit());

  const offRestartApp = lynxIpc.on(toastWindowChannels.restartApp, () => RelaunchApp(false));

  const offCustomBtnPressed = lynxIpc.on(toastWindowChannels.customBtnPressed, (_: any, id: string) => {
    if (onBtnPress) onBtnPress(id, window);
  });

  // Return a cleanup function
  return () => {
    offCloseToast();
    offExitApp();
    offRestartApp();
    offCustomBtnPressed();
  };
}
