import browserChannels from '@lynx_common/consts/ipcChannels/browser';
import {AgentTypes, AudioState, CanGoType, ContextMenuVolumeData, MainHT, WHType} from '@lynx_common/types/ipc';
import {toMs} from '@lynx_common/utils';
import BrowserManager from '@lynx_main/managers/browser';
import classHolder from '@lynx_main/managers/classHolder';
import {getUserAgent} from '@lynx_main/utils';
import {FindInPageOptions} from 'electron';

import BrowserDownloadManager from '../childWindows/browserDownloadManager';
import {listenForBrowserChannels} from './contextMenu';
import lynxIpc from './ipcWrapper';
import {handleGetAudioState, handleSetMuted, handleSetVolume} from './methods/volume';
import {sendToContextMenu, sendToLinkPreview, sendToMain} from './sender';

let browserTimeout: NodeJS.Timeout | undefined = undefined;
let browserIpcInitialized = false;

/** Resets the browserIPC initialization state. Call this before recreating
 *  the main window (e.g., on macOS activate). */
export function resetBrowserIPC() {
  browserIpcInitialized = false;
  if (browserTimeout) {
    clearTimeout(browserTimeout);
    browserTimeout = undefined;
  }
}

export async function listenBrowser() {
  // Prevent registering handlers multiple times
  if (browserIpcInitialized) {
    console.warn('listenBrowser already initialized, skipping...');
    return;
  }

  const appManager = await classHolder.waitForClass('appManager');

  const mainWindow = appManager.getMainWindow();

  if (!mainWindow) {
    browserTimeout = setTimeout(listenBrowser, toMs(1, 'seconds'));
    return;
  }

  clearTimeout(browserTimeout);
  browserTimeout = undefined;
  browserIpcInitialized = true;

  const browserManager: BrowserManager = new BrowserManager(mainWindow);
  classHolder.browserDownloadManager = new BrowserDownloadManager(browserManager.getSession(), mainWindow);

  await listenForBrowserChannels(browserManager);

  // Creates new browser webview instance
  browserIpc.on.createBrowser(id => browserManager.createBrowser(id));

  // Removes browser webview instance
  browserIpc.on.removeBrowser(id => browserManager.removeBrowser(id));

  // Loads URL in browser webview
  browserIpc.on.loadURL((id, url) => browserManager.loadURL(id, url));

  // Sets browser webview visibility
  browserIpc.on.setVisible((id, visible) => browserManager.setVisible(id, visible));

  // Finds text in page
  browserIpc.on.findInPage((id, value, options) => browserManager.findInPage(id, value, options));

  // Stops find in page operation
  browserIpc.on.stopFindInPage((id, action) => browserManager.stopFindInPage(id, action));

  // Sets zoom factor for browser webview
  browserIpc.on.setZoomFactor((id, factor) => browserManager.setZoomFactor(id, factor));

  // Reloads current page
  browserIpc.on.reload(id => browserManager.reload(id));

  // Stops loading current page
  browserIpc.on.stop(id => browserManager.stop(id));

  // Navigates browser back
  browserIpc.on.goBack(id => browserManager.goBack(id));

  // Navigates browser forward
  browserIpc.on.goForward(id => browserManager.goForward(id));

  // Toggles DevTools for browser webview
  browserIpc.on.toggleDevTools(id => browserManager.toggleDevTools(id));

  // Focuses browser webview
  browserIpc.on.focusWebView(id => browserManager.focusWebView(id));

  // Updates user agent for all browsers
  browserIpc.on.updateUserAgent(() => {
    browserManager.updateUserAgent();
    const webContents = appManager.getWebContent();
    if (webContents) webContents.setUserAgent(getUserAgent());
  });

  // Adds offset to browser webview position
  browserIpc.on.addOffset((id, offset) => browserManager.addOffset(id, offset));

  // Clears browser history for selected URLs
  browserIpc.on.clearHistory(selected => browserManager.clearHistory(selected));

  // Forward volume updates from context menu to main window
  browserIpc.on.updateTabVolume((tabId, volume) => browserIpc.send.onTabVolumeUpdate(tabId, volume));
  browserIpc.on.updateTabMuted((tabId, muted) => browserIpc.send.onTabMutedUpdate(tabId, muted));

  // Clears browser cache - remove existing handler first to prevent duplicate registration
  browserIpc.handle.clearCache(() => browserManager.clearCache());

  // Clears browser cookies - remove existing handler first to prevent duplicate registration
  browserIpc.handle.clearCookies(() => browserManager.clearCookies());

  // Gets user agent string - remove existing handler first to prevent duplicate registration
  browserIpc.handle.getUserAgent(type => getUserAgent(type));

  // Sets volume level for browser webview (0-100)
  browserIpc.handle.setVolume((id, volume) => handleSetVolume(browserManager, id, volume));

  // Sets mute state for browser webview
  browserIpc.handle.setMuted((id, muted) => handleSetMuted(browserManager, id, muted));

  // Gets current audio state (playing, muted) for browser webview
  browserIpc.handle.getState(id => handleGetAudioState(browserManager, id));
}

export const browserIpc = {
  send: {
    onLinkHover: (url: string) => sendToLinkPreview(browserChannels.onLinkHover, url),
    onCanGo: (id: string, canGo: CanGoType) => sendToMain(browserChannels.onCanGo, id, canGo),
    onUrlChange: (id: string, url: string) => sendToMain(browserChannels.onUrlChange, id, url),
    isLoading: (id: string, isLoading: boolean) => sendToMain(browserChannels.isLoading, id, isLoading),
    onTitleChange: (id: string, title: string) => sendToMain(browserChannels.onTitleChange, id, title),
    onFavIconChange: (id: string, url: string) => sendToMain(browserChannels.onFavIconChange, id, url),
    onFailedLoadUrl: (id: string, errorCode: number, errorDescription: string, validatedURL: string) =>
      sendToMain(browserChannels.onFailedLoadUrl, id, errorCode, errorDescription, validatedURL),
    onDomReady: (id: string, isReady: boolean) => sendToMain(browserChannels.onDomReady, id, isReady),
    onClearFailed: (id: string) => sendToMain(browserChannels.onClearFailed, id),
    onTabVolumeUpdate: (tabId: string, volume: number) => sendToMain(browserChannels.onTabVolumeUpdate, tabId, volume),
    onTabMutedUpdate: (tabId: string, muted: boolean) => sendToMain(browserChannels.onTabMutedUpdate, tabId, muted),
    onAudioStateChange: (id: string, state: AudioState) => sendToMain(browserChannels.onAudioStateChange, id, state),
    onFoundInPage: (result: {activeMatchOrdinal: number; matches: number; finalUpdate: boolean}) =>
      sendToContextMenu(browserChannels.onFoundInPage, result),
    onZoomChanged: (id: string, factor: number) => sendToMain(browserChannels.onZoomChanged, id, factor),
  },
  on: {
    createBrowser: (callback: (id: string) => void) => lynxIpc.on(browserChannels.createBrowser, callback),
    removeBrowser: (callback: (id: string) => void) => lynxIpc.on(browserChannels.removeBrowser, callback),
    loadURL: (callback: (id: string, url: string) => void) => lynxIpc.on(browserChannels.loadURL, callback),
    setVisible: (callback: (id: string, visible: boolean) => void) => lynxIpc.on(browserChannels.setVisible, callback),
    findInPage: (callback: (id: string, value: string, options: FindInPageOptions) => void) =>
      lynxIpc.on(browserChannels.findInPage, callback),
    stopFindInPage: (
      callback: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') => void,
    ) => lynxIpc.on(browserChannels.stopFindInPage, callback),
    setZoomFactor: (callback: (id: string, factor: number) => void) =>
      lynxIpc.on(browserChannels.setZoomFactor, callback),
    reload: (callback: (id: string) => void) => lynxIpc.on(browserChannels.reload, callback),
    stop: (callback: (id: string) => void) => lynxIpc.on(browserChannels.stop, callback),
    goBack: (callback: (id: string) => void) => lynxIpc.on(browserChannels.goBack, callback),
    goForward: (callback: (id: string) => void) => lynxIpc.on(browserChannels.goForward, callback),
    toggleDevTools: (callback: (id: string) => void) => lynxIpc.on(browserChannels.toggleDevTools, callback),
    focusWebView: (callback: (id: string) => void) => lynxIpc.on(browserChannels.focusWebView, callback),
    updateUserAgent: (callback: () => void) => lynxIpc.on(browserChannels.updateUserAgent, callback),
    addOffset: (callback: (id: string, offset: WHType) => void) => lynxIpc.on(browserChannels.addOffset, callback),
    clearHistory: (callback: (selected: string[]) => void) => lynxIpc.on(browserChannels.clearHistory, callback),

    openFindInPage: (callback: (id: string, customPosition?: {x: number; y: number}) => void) =>
      lynxIpc.on(browserChannels.openFindInPage, callback),
    openZoom: (callback: (id: string, customPosition?: {x: number; y: number}) => void) =>
      lynxIpc.on(browserChannels.openZoom, callback),
    openVolume: (callback: (data: ContextMenuVolumeData, customPosition?: {x: number; y: number}) => void) =>
      lynxIpc.on(browserChannels.openVolume, callback),
    resizeLinkPreview: (callback: (width: number) => void) => lynxIpc.on(browserChannels.resizeLinkPreview, callback),

    updateTabVolume: (callback: (tabId: string, volume: number) => void) =>
      lynxIpc.on(browserChannels.updateTabVolume, callback),
    updateTabMuted: (callback: (tabId: string, muted: boolean) => void) =>
      lynxIpc.on(browserChannels.updateTabMuted, callback),
  },
  handle: {
    clearCache: (callback: () => MainHT<void>) => lynxIpc.handle(browserChannels.clearCache, callback),
    clearCookies: (callback: () => MainHT<void>) => lynxIpc.handle(browserChannels.clearCookies, callback),
    getUserAgent: (callback: (type: AgentTypes) => MainHT<string>) =>
      lynxIpc.handle(browserChannels.getUserAgent, callback),
    setVolume: (callback: (id: string, volume: number) => MainHT<void>) =>
      lynxIpc.handle(browserChannels.setVolume, callback),
    setMuted: (callback: (id: string, muted: boolean) => MainHT<void>) =>
      lynxIpc.handle(browserChannels.setMuted, callback),
    getState: (callback: (id: string) => MainHT<AudioState | null>) =>
      lynxIpc.handle(browserChannels.getState, callback),
  },
};
