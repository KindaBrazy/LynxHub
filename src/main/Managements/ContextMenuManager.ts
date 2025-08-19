import {ipcMain, shell, WebContents} from 'electron';

import {contextMenuChannels, tabsChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

const webContents: WebContents[] = [];

export default function contextMenuManager(contents: WebContents) {
  webContents.push(contents);
  contents.on('context-menu', (_e, params) => {
    const window = appManager?.getContextMenuWindow();
    if (!window) return;

    appManager?.setCustomContextPosition(undefined);
    window.webContents?.send(
      contextMenuChannels.onInitView,
      params,
      {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
      contents.id,
    );
  });
}

function contentByID(id: number) {
  return webContents.find(content => content.id === id);
}

export function listenForContextChannels() {
  ipcMain.on(contextMenuChannels.resizeWindow, (_e, dimensions: {width: number | any; height: number | any}) => {
    const window = appManager?.getContextMenuWindow();
    if (!window) return;

    const {width, height} = dimensions;

    if (typeof width === 'number' && typeof height === 'number' && Number.isFinite(width) && Number.isFinite(height)) {
      window.setSize(width, height, false);
      window.setContentSize(width, height);
    } else {
      console.error('Invalid dimensions received:', dimensions);
    }
  });

  ipcMain.on(contextMenuChannels.copy, (_, id: number) => contentByID(id)?.copy());
  ipcMain.on(contextMenuChannels.paste, (_, id: number) => contentByID(id)?.paste());
  ipcMain.on(contextMenuChannels.selectAll, (_, id: number) => contentByID(id)?.selectAll());
  ipcMain.on(contextMenuChannels.undo, (_, id: number) => contentByID(id)?.undo());
  ipcMain.on(contextMenuChannels.redo, (_, id: number) => contentByID(id)?.redo());
  ipcMain.on(contextMenuChannels.openExternal, (_, url: string) => shell.openExternal(url));
  ipcMain.on(contextMenuChannels.downloadImage, (_, id: number, url: string) => contentByID(id)?.downloadURL(url));

  ipcMain.on(contextMenuChannels.showWindow, () => appManager?.getContextMenuWindow()?.show());
  ipcMain.on(contextMenuChannels.hideWindow, () => {
    appManager?.getContextMenuWindow()?.hide();
    appManager?.getMainWindow()?.focus();
  });

  ipcMain.on(contextMenuChannels.replaceMisspelling, (_, id: number, text: string) =>
    contentByID(id)?.replaceMisspelling(text),
  );
  ipcMain.on(contextMenuChannels.newTab, (_, url: string) =>
    appManager?.getWebContent()?.send(tabsChannels.onNewTab, url),
  );
  ipcMain.on(contextMenuChannels.navigate, (_, id: number, action: 'back' | 'forward' | 'refresh') => {
    switch (action) {
      case 'back':
        contentByID(id)?.navigationHistory.goBack();
        break;
      case 'forward':
        contentByID(id)?.navigationHistory.goForward();
        break;
      case 'refresh':
        contentByID(id)?.reload();
        break;
    }
  });

  ipcMain.on(contextMenuChannels.relaunchAI, (_, id: string) => {
    appManager?.getWebContent()?.send(contextMenuChannels.onRelaunchAI, id);
  });
  ipcMain.on(contextMenuChannels.stopAI, (_, id: string) => {
    appManager?.getWebContent()?.send(contextMenuChannels.onStopAI, id);
  });
  ipcMain.on(contextMenuChannels.removeTab, (_, tabID: string) => {
    appManager?.getWebContent()?.send(contextMenuChannels.onRemoveTab, tabID);
  });
}
