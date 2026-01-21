import contextMenuChannels from '@lynx_cross/consts/ipc_channels/context_menu';
import {browserDownloadChannels} from '@lynx_cross/consts/ipc_channels/donwload_manager';
import {ContextResizeData} from '@lynx_cross/types';
import {ContextMenuVolumeData, NavHistory} from '@lynx_cross/types/ipc';
import {ContextMenuParams, ipcMain} from 'electron';

import BrowserManager from '../core/browser';
import classHolder from '../core/class_holder';
import {applicationIpc} from './application';
import {browserIpc} from './browser';
import listenDialogsWindow from './dialogs_window';
import lynxIpc from './lynxIpc';
import {downloadImageToClipboard} from './methods';
import {sendToCM, sendToMain} from './sender';

export default function listenContextMenu() {
  const {contextMenuManager} = classHolder;
  if (!contextMenuManager) {
    console.error("contextMenuManager is undefined and can't listen to ipc channels");
    return;
  }

  const getWebContent = (id: number) => contextMenuManager.getContentById(id);

  contextMenuIpc.on.resizeWindow(data => contextMenuManager.resizeContextMenu(data));

  contextMenuIpc.on.copy(id => getWebContent(id)?.copy());
  contextMenuIpc.on.cut(id => getWebContent(id)?.cut());
  contextMenuIpc.on.paste(id => getWebContent(id)?.paste());
  contextMenuIpc.on.selectAll(id => getWebContent(id)?.selectAll());
  contextMenuIpc.on.undo(id => getWebContent(id)?.undo());
  contextMenuIpc.on.redo(id => getWebContent(id)?.redo());
  contextMenuIpc.on.downloadImage((id, url) => getWebContent(id)?.downloadURL(url));
  contextMenuIpc.on.copyImage(url => downloadImageToClipboard(url));

  contextMenuIpc.on.searchWithGoogle(text => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    applicationIpc.send.onNewTab(searchUrl);
  });
  contextMenuIpc.on.inspectElement((id, x, y) => {
    const webContents = getWebContent(id);
    if (webContents) {
      webContents.inspectElement(x, y);
    }
  });

  contextMenuIpc.on.showWindow(() => contextMenuManager.showContextMenu());
  contextMenuIpc.on.hideWindow(() => contextMenuManager.hideContextMenu());
  contextMenuIpc.on.replaceMisspelling((id, text) => getWebContent(id)?.replaceMisspelling(text));
  contextMenuIpc.on.newTab(url => applicationIpc.send.onNewTab(url));
  contextMenuIpc.on.navigate((id, action) => {
    switch (action) {
      case 'back':
        getWebContent(id)?.navigationHistory.goBack();
        break;
      case 'forward':
        getWebContent(id)?.navigationHistory.goForward();
        break;
      case 'refresh':
        getWebContent(id)?.reload();
        break;
    }
  });

  contextMenuIpc.on.relaunchAI(id => contextMenuIpc.send.onRelaunchAI(id));
  contextMenuIpc.on.stopAI(id => contextMenuIpc.send.onStopAI(id));
  contextMenuIpc.on.removeTab(tabID => contextMenuIpc.send.onRemoveTab(tabID));
}

export function listenForBrowserChannels(browserManager: BrowserManager) {
  const {contextMenuManager} = classHolder;
  if (!contextMenuManager) {
    console.error("contextMenuManager is undefined and can't listen to forBrowserChannels");
    return;
  }

  const setPosition = (customPosition?: {x: number; y: number}) =>
    contextMenuManager.setCustomContextPosition(customPosition);

  browserIpc.on.openFindInPage((id, customPosition) => {
    setPosition(customPosition);
    contextMenuIpc.send.onFind(id);
  });

  browserIpc.on.openZoom((id, customPosition) => {
    setPosition(customPosition);
    contextMenuIpc.send.onZoom(id, browserManager.getCurrentZoom(id));
  });

  browserIpc.on.openVolume((data, customPosition) => {
    setPosition(customPosition);
    contextMenuIpc.send.onVolume(data);
  });

  contextMenuIpc.on.openTerminateAI(id => {
    setPosition(undefined);
    contextMenuIpc.send.onTerminateAI(id);
  });

  contextMenuIpc.on.openTerminateTab((id, customPosition) => {
    setPosition(customPosition);
    contextMenuIpc.send.onTerminateTab(id);
  });

  contextMenuIpc.on.openCloseApp(() => {
    setPosition(undefined);
    contextMenuIpc.send.onCloseApp();
  });

  // TODO
  ipcMain.on(browserDownloadChannels.openDownloadsMenu, () => {
    setPosition(undefined);
    contextMenuIpc.send.onDownloads();
  });

  listenDialogsWindow();
}

export const contextMenuIpc = {
  send: {
    onRelaunchAI: (id: string) => sendToMain(contextMenuChannels.onRelaunchAI, id),
    onStopAI: (id: string) => sendToMain(contextMenuChannels.onStopAI, id),
    onRemoveTab: (tabID: string) => sendToMain(contextMenuChannels.onRemoveTab, tabID),

    rightClick: (params: ContextMenuParams, navHistory: NavHistory, id: number) =>
      sendToCM(contextMenuChannels.rightClick, params, navHistory, id),
    onFind: (id: string) => sendToCM(contextMenuChannels.onFind, id),
    onZoom: (id: string, factor: number | undefined) => sendToCM(contextMenuChannels.onZoom, id, factor),
    onVolume: (data: ContextMenuVolumeData) => sendToCM(contextMenuChannels.onVolume, data),
    onTerminateAI: (id: string) => sendToCM(contextMenuChannels.onTerminateAI, id),
    onTerminateTab: (id: string) => sendToCM(contextMenuChannels.onTerminateTab, id),
    onCloseApp: () => sendToCM(contextMenuChannels.onCloseApp),
    onDownloads: () => sendToCM(contextMenuChannels.onDownloads),
  },
  on: {
    resizeWindow: (callback: (data: ContextResizeData) => void) =>
      lynxIpc.on(contextMenuChannels.resizeWindow, callback),
    copy: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.copy, callback),
    cut: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.cut, callback),
    paste: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.paste, callback),
    selectAll: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.selectAll, callback),
    undo: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.undo, callback),
    redo: (callback: (id: number) => void) => lynxIpc.on(contextMenuChannels.redo, callback),
    downloadImage: (callback: (id: number, url: string) => void) =>
      lynxIpc.on(contextMenuChannels.downloadImage, callback),
    copyImage: (callback: (url: string) => void) => lynxIpc.on(contextMenuChannels.copyImage, callback),
    searchWithGoogle: (callback: (text: string) => void) => lynxIpc.on(contextMenuChannels.searchWithGoogle, callback),
    inspectElement: (callback: (id: number, x: number, y: number) => void) =>
      lynxIpc.on(contextMenuChannels.inspectElement, callback),
    showWindow: (callback: () => void) => lynxIpc.on(contextMenuChannels.showWindow, callback),
    hideWindow: (callback: () => void) => lynxIpc.on(contextMenuChannels.hideWindow, callback),
    replaceMisspelling: (callback: (id: number, text: string) => void) =>
      lynxIpc.on(contextMenuChannels.replaceMisspelling, callback),
    newTab: (callback: (url: string) => void) => lynxIpc.on(contextMenuChannels.newTab, callback),
    navigate: (callback: (id: number, action: 'back' | 'forward' | 'refresh') => void) =>
      lynxIpc.on(contextMenuChannels.navigate, callback),

    relaunchAI: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.relaunchAI, callback),
    stopAI: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.stopAI, callback),
    removeTab: (callback: (tabID: string) => void) => lynxIpc.on(contextMenuChannels.removeTab, callback),

    openTerminateAI: (callback: (id: string) => void) => lynxIpc.on(contextMenuChannels.openTerminateAI, callback),
    openTerminateTab: (callback: (id: string, customPosition?: {x: number; y: number}) => void) =>
      lynxIpc.on(contextMenuChannels.openTerminateTab, callback),
    openCloseApp: (callback: () => void) => lynxIpc.on(contextMenuChannels.openCloseApp, callback),
  },
  handle: {},
};
