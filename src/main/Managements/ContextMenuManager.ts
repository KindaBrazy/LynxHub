import {ipcMain, screen, shell, WebContents} from 'electron';

import {contextMenuChannels, tabsChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';

let hideMenu = false;
let listenForBlur = false;

const webContents: WebContents[] = [];

export default function contextMenuManager(contents: WebContents) {
  webContents.push(contents);
  contents.on('context-menu', (_e, params) => {
    const window = appManager.getContextMenuWindow();
    if (!window) return;

    hideMenu = false;
    window.webContents?.send(
      contextMenuChannels.onInitView,
      params,
      {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
      contents.id,
    );

    const {x, y} = screen.getCursorScreenPoint();
    window.setPosition(x, y, true);
  });

  if (!listenForBlur) {
    appManager.getContextMenuWindow()?.on('blur', () => {
      listenForBlur = true;
      hideMenu = true;
      setTimeout(() => {
        if (hideMenu) appManager.getContextMenuWindow()?.hide();
      }, 100);
    });
  }
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

  ipcMain.on(contextMenuChannels.copy, (_, id: number) => {
    webContents.find(content => content.id === id)?.copy();
  });
  ipcMain.on(contextMenuChannels.paste, (_, id: number) => {
    webContents.find(content => content.id === id)?.paste();
  });
  ipcMain.on(contextMenuChannels.selectAll, (_, id: number) => {
    webContents.find(content => content.id === id)?.selectAll();
  });
  ipcMain.on(contextMenuChannels.replaceMisspelling, (_, id: number, text: string) => {
    webContents.find(content => content.id === id)?.replaceMisspelling(text);
  });
  ipcMain.on(contextMenuChannels.undo, (_, id: number) => {
    webContents.find(content => content.id === id)?.undo();
  });
  ipcMain.on(contextMenuChannels.redo, (_, id: number) => {
    webContents.find(content => content.id === id)?.redo();
  });
  ipcMain.on(contextMenuChannels.openExternal, (_, url: string) => {
    shell.openExternal(url);
  });
  ipcMain.on(contextMenuChannels.newTab, (_, url: string) => {
    appManager.getWebContent()?.send(tabsChannels.onNewTab, url);
  });
  ipcMain.on(contextMenuChannels.downloadImage, (_, id: number, url: string) => {
    webContents.find(content => content.id === id)?.downloadURL(url);
  });
  ipcMain.on(contextMenuChannels.navigate, (_, id: number, action: 'back' | 'forward' | 'refresh') => {
    switch (action) {
      case 'back':
        webContents.find(content => content.id === id)?.navigationHistory.goBack();
        break;
      case 'forward':
        webContents.find(content => content.id === id)?.navigationHistory.goForward();
        break;
      case 'refresh':
        webContents.find(content => content.id === id)?.reload();
        break;
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
