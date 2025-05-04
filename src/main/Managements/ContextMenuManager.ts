import {ipcMain, screen, WebContents} from 'electron';

import {contextMenuChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

export default function contextMenuManager(contents: WebContents) {
  contents.on('context-menu', (_e, params) => {
    const window = appManager.getContextMenuWindow();
    if (!window) return;

    window.webContents?.send(contextMenuChannels.onInitView, params);

    const {x, y} = screen.getCursorScreenPoint();
    window.setPosition(x, y, false);
  });
}

export function listenForContextChannels() {
  ipcMain.on(contextMenuChannels.resizeWindow, (_e, dimensions: {width: number; height: number}) => {
    const window = appManager.getContextMenuWindow();
    if (!window) return;

    const {width, height} = dimensions;
    if (width && height) {
      window.setSize(width, height, false);
      window.setContentSize(width, height);
    }
  });

  ipcMain.on(contextMenuChannels.showWindow, () => {
    const window = appManager.getContextMenuWindow();
    if (!window) return;

    window.show();
  });

  ipcMain.on(contextMenuChannels.hideWindow, () => {
    const window = appManager.getContextMenuWindow();
    if (!window) return;

    window.hide();
  });
}
