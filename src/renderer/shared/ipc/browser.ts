import browserChannels from '@lynx_cross/consts/ipc_channels/browser';
import {AgentTypes, CanGoType, ContextMenuVolumeData, WHType} from '@lynx_cross/types/ipc';
import type {FindInPageOptions} from 'electron';

import lynxIpc from './lynxIpc';

const browserIpc = {
  send: {
    resizeLinkPreview: (width: number) => lynxIpc.send(browserChannels.resizeLinkPreview, width),

    // Creates new browser webview instance
    createBrowser: (id: string) => lynxIpc.send(browserChannels.createBrowser, id),

    // Removes browser webview instance
    removeBrowser: (id: string) => lynxIpc.send(browserChannels.removeBrowser, id),

    // Loads URL in browser webview
    loadURL: (id: string, url: string) => lynxIpc.send(browserChannels.loadURL, id, url),

    // Sets browser webview visibility
    setVisible: (id: string, visible: boolean) => lynxIpc.send(browserChannels.setVisible, id, visible),

    // Opens find in page dialog
    openFindInPage: (id: string, customPosition?: {x: number; y: number}) =>
      lynxIpc.send(browserChannels.openFindInPage, id, customPosition),

    // Opens zoom dialog
    openZoom: (id: string, customPosition?: {x: number; y: number}) =>
      lynxIpc.send(browserChannels.openZoom, id, customPosition),

    // Opens volume control dialog
    openVolume: (data: ContextMenuVolumeData, customPosition?: {x: number; y: number}) =>
      lynxIpc.send(browserChannels.openVolume, data, customPosition),

    // Finds text in page
    findInPage: (id: string, value: string, options: FindInPageOptions) =>
      lynxIpc.send(browserChannels.findInPage, id, value, options),

    // Stops find in page operation
    stopFindInPage: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') =>
      lynxIpc.send(browserChannels.stopFindInPage, id, action),

    // Focuses browser webview
    focusWebView: (id: string) => lynxIpc.send(browserChannels.focusWebView, id),

    // Sets zoom factor for browser webview
    setZoomFactor: (id: string, factor: number) => lynxIpc.send(browserChannels.setZoomFactor, id, factor),

    // Reloads current page
    reload: (id: string) => lynxIpc.send(browserChannels.reload, id),

    // Stops loading current page
    stop: (id: string) => lynxIpc.send(browserChannels.stop, id),

    // Navigates browser back
    goBack: (id: string) => lynxIpc.send(browserChannels.goBack, id),

    // Navigates browser forward
    goForward: (id: string) => lynxIpc.send(browserChannels.goForward, id),

    // Toggles DevTools for browser webview
    toggleDevTools: (id: string) => lynxIpc.send(browserChannels.toggleDevTools, id),

    // Updates user agent for all browsers
    updateUserAgent: () => lynxIpc.send(browserChannels.updateUserAgent),

    // Adds offset to browser webview position
    addOffset: (id: string, offset: WHType) => lynxIpc.send(browserChannels.addOffset, id, offset),

    // Clears browser history for selected URLs
    clearHistory: (selected: string[]) => lynxIpc.send(browserChannels.clearHistory, selected),
  },
  on: {
    linkHover: (callback: (url: string) => void) => lynxIpc.on(browserChannels.onLinkHover, callback),

    // Listens for browser navigation availability (can go back/forward)
    canGoBackForward: (result: (id: string, canGo: CanGoType) => void) => lynxIpc.on(browserChannels.onCanGo, result),

    // Listens for browser loading state changes
    loading: (result: (id: string, isLoading: boolean) => void) => lynxIpc.on(browserChannels.isLoading, result),

    // Listens for browser page title changes
    titleChanged: (result: (id: string, title: string) => void) => lynxIpc.on(browserChannels.onTitleChange, result),

    // Listens for browser favicon changes
    favIconChanged: (result: (id: string, faviconUrl: string) => void) =>
      lynxIpc.on(browserChannels.onFavIconChange, result),

    // Listens for browser URL changes
    urlChanged: (result: (id: string, url: string) => void) => lynxIpc.on(browserChannels.onUrlChange, result),

    // Listens for browser DOM ready state
    domReady: (result: (id: string, isReady: boolean) => void) => lynxIpc.on(browserChannels.onDomReady, result),

    // Listens for failed URL load events
    failedLoadUrl: (result: (id: string, errorCode: number, errorDescription: string, validatedURL: string) => void) =>
      lynxIpc.on(browserChannels.onFailedLoadUrl, result),

    // Listens for cleared failed URL events
    clearFailed: (result: (id: string) => void) => lynxIpc.on(browserChannels.onClearFailed, result),
  },
  invoke: {
    // Clears browser cache
    clearCache: () => lynxIpc.invoke<void>(browserChannels.clearCache),

    // Clears browser cookies
    clearCookies: () => lynxIpc.invoke<void>(browserChannels.clearCookies),

    // Gets user agent string
    getUserAgent: (type?: AgentTypes) => lynxIpc.invoke<string>(browserChannels.getUserAgent, type),
  },
};

export default browserIpc;
