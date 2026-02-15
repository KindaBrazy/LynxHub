import path from 'node:path';

import {AudioState, CanGoType, WHType} from '@lynx_common/types/ipc';
import {formatWebAddress} from '@lynx_common/utils';
import {applicationIpc} from '@lynx_main/ipc/application';
import {browserIpc} from '@lynx_main/ipc/browser';
import {getUserAgent, getWindowColor} from '@lynx_main/utils';
import {BrowserWindow, FindInPageOptions, session, shell, WebContents, WebContentsView} from 'electron';
import {debounce, isEmpty, isNil} from 'lodash';

import icon from '../../../resources/icon.png?asset';
import classHolder from './classHolder';
import RegisterHotkeys from './hotkeys';

// Constants
const BROWSER_SESSION_PARTITION = 'persist:lynxhub_browser';
const NAVBAR_HEIGHT = 80;
const DEBOUNCE_DELAY_MS = 50;
const PAGE_LOAD_TIMEOUT_MS = 2000;
const SCRIPT_EXECUTION_TIMEOUT_MS = 3000;

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private readonly mainWindow: BrowserWindow;
  private extraOffset: {id: string; offset: WHType}[] = [];
  private cachedOffset: WHType | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;

    const debouncedSetBounds = debounce(() => this.setBounds(), DEBOUNCE_DELAY_MS);
    this.mainWindow.on('maximize', debouncedSetBounds);
    this.mainWindow.on('unmaximize', debouncedSetBounds);
    this.mainWindow.on('enter-full-screen', debouncedSetBounds);
    this.mainWindow.on('leave-full-screen', debouncedSetBounds);
    this.mainWindow.on('resize', debouncedSetBounds);
  }

  private getMainWindow() {
    if (isNil(this.mainWindow) || this.mainWindow.isDestroyed()) return undefined;
    return this.mainWindow;
  }

  private getViewByID(id: string) {
    return this.browsers.find(view => view.id === id)?.view;
  }

  /** Get valid WebContents by ID, returns undefined if not found or destroyed */
  private getWebContents(id: string): WebContents | undefined {
    const view = this.getViewByID(id);
    if (!view?.webContents || view.webContents.isDestroyed()) return undefined;
    return view.webContents;
  }

  /** Public method to get WebContents by ID for external use */
  public getWebContentsById(id: string): WebContents | undefined {
    return this.getWebContents(id);
  }

  /** Execute action on WebContents if valid, with optional error handling */
  private withWebContents<T>(id: string, action: (wc: WebContents) => T, fallback?: T): T | undefined {
    try {
      const wc = this.getWebContents(id);
      if (!wc) return fallback;
      return action(wc);
    } catch (error) {
      console.error(`WebContents action failed for ${id}:`, error);
      return fallback;
    }
  }

  private getOffsetResult() {
    if (this.cachedOffset) return this.cachedOffset;

    let width = 0;
    let height = 0;
    for (const {offset} of this.extraOffset) {
      width += offset.width;
      height += offset.height;
    }
    this.cachedOffset = {width, height};
    return this.cachedOffset;
  }

  /** Invalidate cached offset when offsets change */
  private invalidateOffsetCache() {
    this.cachedOffset = null;
  }

  private setBounds() {
    if (isEmpty(this.browsers)) return;

    const window = this.getMainWindow();
    if (!window) return;

    const [width, height] = window.getContentSize();
    const offset = this.getOffsetResult();
    const calculatedWidth = width - offset.width;
    const calculatedHeight = height - NAVBAR_HEIGHT - offset.height;

    // Validate bounds are positive
    if (calculatedWidth <= 0 || calculatedHeight <= 0) return;

    this.browsers.forEach(browser => {
      browser.view.setBounds({
        x: 0,
        y: NAVBAR_HEIGHT,
        width: calculatedWidth,
        height: calculatedHeight,
      });
    });
  }

  private listenForNavigate(id: string, webContents: WebContents) {
    const sendToRenderer = () => {
      const viewWc = this.getWebContents(id);
      if (!viewWc) return;

      const canGo: CanGoType = {
        back: viewWc.navigationHistory.canGoBack(),
        forward: viewWc.navigationHistory.canGoForward(),
      };

      browserIpc.send.onCanGo(id, canGo);
    };

    sendToRenderer();

    webContents.on('did-navigate', (_, url) => {
      sendToRenderer();
      this.trackUrl(url);
    });

    webContents.on('did-navigate-in-page', (_, url) => {
      sendToRenderer();
      this.trackUrl(url);
    });

    webContents.on('did-finish-load', sendToRenderer);
    webContents.on('did-stop-loading', sendToRenderer);

    webContents.on('did-start-navigation', e => {
      if (e.isMainFrame) browserIpc.send.onUrlChange(id, e.url);
    });
  }

  /** Track URL in browser history (shared helper to avoid duplication) */
  private trackUrl(url: string) {
    const storageManager = classHolder.storageManager;
    if (url && !url.startsWith('about:') && !url.includes('error_page.html')) {
      const formattedUrl = formatWebAddress(url);
      storageManager.addBrowserRecent(formattedUrl);
      storageManager.addBrowserHistory(formattedUrl);
    }
  }

  private listenForLoading(id: string, webContents: WebContents) {
    const onLoading = (isLoading: boolean) => browserIpc.send.isLoading(id, isLoading);

    webContents.on('did-start-loading', () => onLoading(true));
    webContents.on('did-stop-loading', () => onLoading(false));
  }

  private listenForTitle(id: string, webContents: WebContents) {
    webContents.on('page-title-updated', () => {
      const viewWc = this.getWebContents(id);
      if (!viewWc) return;

      const storageManager = classHolder.storageManager;

      const title = viewWc.getTitle();
      browserIpc.send.onTitleChange(id, title);
      storageManager.updateBrowserFavIconTitle(formatWebAddress(viewWc.getURL()), title);
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      const viewWc = this.getWebContents(id);
      if (!viewWc) return;

      const storageManager = classHolder.storageManager;

      // Prefer higher quality formats: SVG > PNG > other > ICO
      const url =
        favicons.find(icon => icon.includes('.svg')) ||
        favicons.find(icon => icon.includes('.png')) ||
        favicons.find(icon => !icon.includes('.ico')) ||
        favicons[0] ||
        '';

      browserIpc.send.onFavIconChange(id, url);
      storageManager.addBrowserFavIcon(formatWebAddress(viewWc.getURL()), url, viewWc.getTitle());
    });
  }

  private setupWindowOpenHandler(webContents: WebContents) {
    webContents.setWindowOpenHandler(({url, disposition}) => {
      const {storageManager, appManager} = classHolder;
      if (disposition === 'new-window') {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            icon,
            parent: appManager?.getMainWindow(),
            modal: true,
            maximizable: false,
            fullscreenable: false,
          },
        };
      } else if (storageManager.getData('app').openLinkExternal) {
        shell.openExternal(url);
      } else {
        // background-tab = middle-click = open in background (don't switch)
        // foreground-tab = Shift+middle-click = switch to new tab
        const openInBackground = disposition === 'background-tab';
        applicationIpc.send.onNewTab(url, openInBackground);
        // Track URLs opened in new tabs (like real browsers)
        this.trackUrl(url);
      }

      return {action: 'deny'};
    });
  }

  private listenForZoom(id: string, webContents: WebContents) {
    webContents.on('zoom-changed', (_, zoomDirection) => {
      if (webContents.isDestroyed()) return;
      let resultFactor = webContents.getZoomFactor();
      resultFactor = zoomDirection === 'in' ? resultFactor + 0.1 : resultFactor - 0.1;
      if (resultFactor > 0.1 && resultFactor < 5) {
        webContents.setZoomFactor(resultFactor);
        // Notify renderer about zoom change to auto-open zoom dialog
        browserIpc.send.onZoomChanged(id, resultFactor);
      }
    });
  }

  private listenForFullScreen(view: WebContentsView) {
    const webContents = view.webContents;
    webContents.on('enter-html-full-screen', () => {
      const appManager = classHolder.appManager;
      const mainBounds = appManager?.getMainWindow()?.getBounds();
      if (mainBounds) {
        view.setBounds({x: 0, y: 0, width: mainBounds.width, height: mainBounds.height});
      }
    });
  }

  private listenForFailLoad(view: WebContents, id: string) {
    view.on('did-fail-load', (_, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (errorCode === -3 || !isMainFrame) return;

      this.setVisible(id, false);
      browserIpc.send.onFailedLoadUrl(id, errorCode, errorDescription, validatedURL);
      console.error('failed load:', errorCode, errorDescription, validatedURL);
    });
  }

  private listenForAudioEvents(id: string, webContents: WebContents) {
    webContents.on('media-started-playing', () => {
      this.sendAudioStateChange(id, true);
    });

    webContents.on('media-paused', () => {
      this.sendAudioStateChange(id, false);
    });
  }

  private listenForLinkHover(webContents: WebContents) {
    webContents.on('update-target-url', (_, url) => {
      const linkPreviewManager = classHolder.linkPreviewManager;
      linkPreviewManager?.updateUrl(url);
    });
  }

  private listenForFindInPage(webContents: WebContents) {
    webContents.on('found-in-page', (_, result) => {
      browserIpc.send.onFoundInPage(result);
    });
  }

  private sendAudioStateChange(id: string, playing: boolean): void {
    const viewWc = this.getWebContents(id);
    if (!viewWc) return;

    browserIpc.send.onAudioStateChange(id, {playing, muted: viewWc.audioMuted});
  }

  public getSession() {
    return session.fromPartition(BROWSER_SESSION_PARTITION);
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    const {storageManager, contextMenuManager} = classHolder;
    const newView = new WebContentsView({
      webPreferences: {session: this.getSession(), preload: path.join(__dirname, '../preload/webview.cjs')},
    });
    const webContents = newView.webContents;
    newView.setBackgroundColor(getWindowColor());

    webContents.setUserAgent(getUserAgent());

    webContents.setZoomFactor(storageManager.getData('cards').zoomFactor);

    webContents.on('dom-ready', () => browserIpc.send.onDomReady(id, true));

    this.listenForNavigate(id, webContents);
    this.listenForLoading(id, webContents);
    this.listenForTitle(id, webContents);
    this.listenForFavIcon(id, webContents);
    this.listenForZoom(id, webContents);
    this.listenForFullScreen(newView);
    this.listenForFailLoad(webContents, id);
    this.listenForAudioEvents(id, webContents);
    this.listenForLinkHover(webContents);
    this.listenForFindInPage(webContents);

    this.browsers.push({id, view: newView});
    mainWindow.contentView.addChildView(newView);

    this.setBounds();

    this.setupWindowOpenHandler(webContents);
    RegisterHotkeys(webContents);
    contextMenuManager?.listenForMenu(webContents);
  }

  public focusWebView(id: string) {
    this.withWebContents(id, wc => wc.focus());
  }

  public async clearCache() {
    return this.getSession().clearData({
      dataTypes: ['backgroundFetch', 'cache', 'serviceWorkers'],
      avoidClosingConnections: true,
    });
  }

  public async clearCookies() {
    return this.getSession().clearData({dataTypes: ['cookies', 'indexedDB', 'localStorage']});
  }

  public addOffset(id: string, offset: WHType) {
    const existingOffset = this.extraOffset.findIndex(item => item.id === id);
    if (existingOffset !== -1) {
      this.extraOffset[existingOffset].offset = offset;
    } else {
      this.extraOffset.push({id, offset});
    }
    this.invalidateOffsetCache();
  }

  public clearHistory(selected: string[]) {
    const storageManager = classHolder.storageManager;
    if (selected.includes('favorites')) {
      storageManager.updateBrowserDataSecurely({favoriteAddress: []});
    }
    if (selected.includes('history')) {
      storageManager.updateBrowserDataSecurely({historyAddress: [], recentAddress: []});
    }
    if (selected.includes('fav-icons')) {
      storageManager.updateBrowserDataSecurely({favIcons: []});
    }
  }

  public updateUserAgent() {
    this.browsers.forEach(({view}) => {
      if (!view.webContents.isDestroyed()) view.webContents.setUserAgent(getUserAgent());
    });
  }

  public removeBrowser(id: string) {
    const browserIndex = this.browsers.findIndex(view => view.id === id);
    if (browserIndex === -1) return;

    const browser = this.browsers[browserIndex];
    const mainWindow = this.getMainWindow();

    // Remove from array first to prevent any callbacks from accessing stale data
    this.browsers.splice(browserIndex, 1);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.contentView.removeChildView(browser.view);
    }

    const webContents = browser.view.webContents;
    if (webContents && !webContents.isDestroyed()) {
      // Navigate to blank page to stop any running scripts/workers before closing
      webContents.loadURL('about:blank').finally(() => {
        if (!webContents.isDestroyed()) {
          webContents.removeAllListeners();
          webContents.close();
        }
      });
    }

    // Cleanup orphaned service workers when all browsers are closed
    if (this.browsers.length === 0) {
      this.cleanupAllServiceWorkers();
    }
  }

  /** Clear all service workers when no browsers are open */
  private cleanupAllServiceWorkers() {
    this.getSession()
      .clearData({dataTypes: ['serviceWorkers']})
      .catch(error => console.warn('Service worker cleanup failed:', error));
  }

  public loadURL(id: string, url: string) {
    this.withWebContents(id, wc => {
      wc.loadURL(url).catch(error => {
        // ERR_ABORTED (-3) happens on redirects - not a real error
        if (error?.errno === -3 || error?.code === 'ERR_ABORTED') return;
        console.error(`Failed to load URL ${url}:`, error);
      });
      // URL tracking is handled by listenForNavigate's did-navigate event
    });
  }

  public setVisible(id: string, visible: boolean) {
    const view = this.getViewByID(id);
    const mainWindow = this.getMainWindow();
    if (isNil(view) || isNil(mainWindow)) return;

    if (visible) {
      mainWindow.contentView.addChildView(view);
    } else {
      mainWindow.contentView.removeChildView(view);
    }
  }

  public findInPage(id: string, value: string, options: FindInPageOptions) {
    this.withWebContents(id, wc => wc.findInPage(value, options));
  }

  public stopFindInPage(id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') {
    this.withWebContents(id, wc => wc.stopFindInPage(action));
  }

  public getCurrentZoom(id: string) {
    return this.withWebContents(id, wc => wc.getZoomFactor());
  }

  public setZoomFactor(id: string, factor: number) {
    this.withWebContents(id, wc => wc.setZoomFactor(factor));
  }

  public reload(id: string) {
    browserIpc.send.onClearFailed(id);
    this.setVisible(id, true);
    this.withWebContents(id, wc => wc.reload());
  }

  public stop(id: string) {
    this.withWebContents(id, wc => wc.stop());
  }

  public goBack(id: string) {
    this.withWebContents(id, wc => wc.navigationHistory.goBack());
  }

  public goForward(id: string) {
    this.withWebContents(id, wc => wc.navigationHistory.goForward());
  }

  public toggleDevTools(id: string) {
    this.withWebContents(id, wc => {
      if (wc.isDevToolsOpened()) {
        wc.closeDevTools();
      } else {
        wc.openDevTools({mode: 'detach'});
      }
    });
  }

  public setMuted(id: string, muted: boolean): void {
    this.withWebContents(id, wc => wc.setAudioMuted(muted));
  }

  public async setVolume(id: string, volume: number): Promise<void> {
    const webContents = this.getWebContents(id);
    if (!webContents) return;

    // Store browser id to verify it still exists after async operations
    const browserId = id;

    try {
      // Wait for page to be ready for script execution
      if (webContents.isLoading()) {
        await new Promise<void>(resolve => {
          const onFinish = () => {
            webContents.off('did-finish-load', onFinish);
            webContents.off('did-fail-load', onFinish);
            resolve();
          };
          webContents.once('did-finish-load', onFinish);
          webContents.once('did-fail-load', onFinish);
          setTimeout(resolve, PAGE_LOAD_TIMEOUT_MS);
        });
      }

      // Re-verify webContents is still valid after async wait
      const currentWebContents = this.getWebContents(browserId);
      if (!currentWebContents || currentWebContents.isDestroyed()) return;

      const volumeDecimal = Math.max(0, Math.min(100, volume)) / 100;
      const script = `
        (function() {
          document.querySelectorAll('audio, video').forEach(el => { el.volume = ${volumeDecimal}; });
          if (!window.__lynxVolumeObserver) {
            window.__lynxVolumeObserver = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') node.volume = ${volumeDecimal};
                  if (node.querySelectorAll) {
                    node.querySelectorAll('audio, video').forEach(el => { el.volume = ${volumeDecimal}; });
                  }
                });
              });
            });
            window.__lynxVolumeObserver.observe(document.body, {childList: true, subtree: true});
          }
          window.__lynxVolume = ${volumeDecimal};
        })();
      `;

      await Promise.race([
        currentWebContents.executeJavaScript(script, true),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Script execution timeout')), SCRIPT_EXECUTION_TIMEOUT_MS),
        ),
      ]);
    } catch (error) {
      console.warn('Volume set skipped:', error instanceof Error ? error.message : String(error));
    }
  }

  public getAudioState(id: string): AudioState | null {
    return (
      this.withWebContents(
        id,
        wc => ({
          playing: !wc.audioMuted && wc.isCurrentlyAudible(),
          muted: wc.audioMuted,
        }),
        null,
      ) ?? null
    );
  }
}
