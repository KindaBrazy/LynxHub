import contextMenuChannels from '@lynx_common/consts/ipcChannels/contextMenu';
import {ContextResizeData} from '@lynx_common/types';
import {ContextMenuVolumeData, NavHistory} from '@lynx_common/types/ipc';
import BrowserManager from '@lynx_main/managers/browser';
import classHolder from '@lynx_main/managers/classHolder';
import {ContextMenuParams} from 'electron';

import {applicationIpc} from './application';
import {browserIpc} from './browser';
import {downloadManagerIpc} from './downloadManager';
import lynxIpc from './ipcWrapper';
import {downloadImageToClipboard} from './methods/windowUtils';
import {sendToContextMenu, sendToMain} from './sender';

export default async function listenContextMenu() {
  const contextMenuManager = await classHolder.waitForClass('contextMenuManager');

  const getWebContents = (id: number) => contextMenuManager.getContentById(id);

  contextMenuIpc.on.resizeWindow(data => contextMenuManager.resizeContextMenu(data));

  contextMenuIpc.on.copy(id => getWebContents(id)?.copy());
  contextMenuIpc.on.cut(id => getWebContents(id)?.cut());
  contextMenuIpc.on.paste(id => getWebContents(id)?.paste());
  contextMenuIpc.on.selectAll(id => getWebContents(id)?.selectAll());
  contextMenuIpc.on.undo(id => getWebContents(id)?.undo());
  contextMenuIpc.on.redo(id => getWebContents(id)?.redo());
  contextMenuIpc.on.downloadImage((id, url) => getWebContents(id)?.downloadURL(url));
  contextMenuIpc.on.copyImage(url => downloadImageToClipboard(url));

  contextMenuIpc.on.searchWithGoogle(text => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    applicationIpc.send.onNewTab(searchUrl);
  });
  contextMenuIpc.on.inspectElement((id, x, y) => {
    const webContents = getWebContents(id);
    if (webContents) {
      webContents.inspectElement(x, y);
    }
  });

  contextMenuIpc.on.showWindow(() => contextMenuManager.showContextMenu());
  contextMenuIpc.on.hideWindow(() => contextMenuManager.hideContextMenu());
  contextMenuIpc.on.replaceMisspelling((id, text) => getWebContents(id)?.replaceMisspelling(text));
  contextMenuIpc.on.newTab(url => applicationIpc.send.onNewTab(url));
  contextMenuIpc.on.navigate((id, action) => {
    switch (action) {
      case 'back':
        getWebContents(id)?.navigationHistory.goBack();
        break;
      case 'forward':
        getWebContents(id)?.navigationHistory.goForward();
        break;
      case 'refresh':
        getWebContents(id)?.reload();
        break;
    }
  });

  contextMenuIpc.on.relaunchAI(id => contextMenuIpc.send.onRelaunchAI(id));
  contextMenuIpc.on.stopAI(id => contextMenuIpc.send.onStopAI(id));
  contextMenuIpc.on.removeTab(tabID => contextMenuIpc.send.onRemoveTab(tabID));
}

export async function listenForBrowserChannels(browserManager: BrowserManager) {
  const contextMenuManager = await classHolder.waitForClass('contextMenuManager');

  const setPosition = (customPosition?: {x: number; y: number}) =>
    contextMenuManager.setCustomContextPosition(customPosition);

  browserIpc.on.openFindInPage(async (id, customPosition) => {
    setPosition(customPosition);

    // Get selected text from webContents using executeJavaScript
    const webContents = browserManager.getWebContentsById(id);
    let selectedText = '';

    if (webContents && !webContents.isDestroyed()) {
      try {
        selectedText = await webContents.executeJavaScript('window.getSelection().toString()');
      } catch (error) {
        console.error('Failed to get selected text:', error);
      }
    }

    contextMenuIpc.send.onFind(id, selectedText);
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

  downloadManagerIpc.on.openDownloadsMenu(() => {
    setPosition(undefined);
    contextMenuIpc.send.onDownloads();
  });
}

export const contextMenuIpc = {
  send: {
    onRelaunchAI: (id: string) => sendToMain(contextMenuChannels.onRelaunchAI, id),
    onStopAI: (id: string) => sendToMain(contextMenuChannels.onStopAI, id),
    onRemoveTab: (tabID: string) => sendToMain(contextMenuChannels.onRemoveTab, tabID),

    rightClick: (params: ContextMenuParams, navHistory: NavHistory, id: number) =>
      sendToContextMenu(contextMenuChannels.rightClick, params, navHistory, id),
    onFind: (id: string, selectedText?: string) => sendToContextMenu(contextMenuChannels.onFind, id, selectedText),
    onZoom: (id: string, factor: number | undefined) => sendToContextMenu(contextMenuChannels.onZoom, id, factor),
    onVolume: (data: ContextMenuVolumeData) => sendToContextMenu(contextMenuChannels.onVolume, data),
    onTerminateAI: (id: string) => sendToContextMenu(contextMenuChannels.onTerminateAI, id),
    onTerminateTab: (id: string) => sendToContextMenu(contextMenuChannels.onTerminateTab, id),
    onCloseApp: () => sendToContextMenu(contextMenuChannels.onCloseApp),
    onDownloads: () => sendToContextMenu(contextMenuChannels.onDownloads),
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
