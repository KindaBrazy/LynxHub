import {BrowserWindow, FindInPageOptions, session, shell, WebContents, WebContentsView} from 'electron';
import {isEmpty, isNil} from 'lodash';

import icon from '../../../resources/icon.png?asset';
import {formatWebAddress} from '../../cross/CrossUtils';
import {
  AudioState,
  browserChannels,
  CanGoType,
  tabsChannels,
  volumeChannels,
  WHType,
} from '../../cross/IpcChannelAndTypes';
import {appManager, contextMenuManager, linkPreviewManager, storageManager} from '../index';
import {getUserAgent, getWindowColor} from '../Utilities/Utils';
import RegisterHotkeys from './HotkeysManager';

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private readonly mainWindow: BrowserWindow;
  private extraOffset: {id: string; offset: WHType}[] = [];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;

    this.mainWindow.on('maximize', () => this.setBounds());
    this.mainWindow.on('unmaximize', () => this.setBounds());
    this.mainWindow.on('enter-full-screen', () => this.setBounds());
    this.mainWindow.on('leave-full-screen', () => this.setBounds());
    this.mainWindow.on('resize', () => this.setBounds());
  }

  private getMainWindow() {
    if (isNil(this.mainWindow) || this.mainWindow.isDestroyed()) return undefined;
    return this.mainWindow;
  }

  private getMainWebContents() {
    const window = this.getMainWindow();
    if (isNil(window) || window.webContents.isDestroyed()) return undefined;
    return window.webContents;
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

  /** Execute action requiring both main and view WebContents */
  private withBothContents(id: string, action: (main: WebContents, view: WebContents) => void): void {
    try {
      const mainWc = this.getMainWebContents();
      const viewWc = this.getWebContents(id);
      if (mainWc && viewWc) action(mainWc, viewWc);
    } catch (error) {
      console.error(`Dual WebContents action failed for ${id}:`, error);
    }
  }

  private getOffsetResult() {
    let width: number = 0;
    let height: number = 0;
    this.extraOffset.forEach(offset => {
      width += offset.offset.width;
      height += offset.offset.height;
    });
    return {width, height};
  }

  private setBounds() {
    if (!isEmpty(this.browsers)) {
      this.browsers.forEach(browser => {
        setTimeout(() => {
          const window = this.getMainWindow();
          if (!window) return;
          const [width, height] = window.getContentSize();
          browser.view.setBounds({
            x: 0,
            y: 80,
            width: width - this.getOffsetResult().width,
            height: height - 80 - this.getOffsetResult().height,
          });
        }, 50);
      });
    }
  }

  private listenForNavigate(id: string, webContents: WebContents) {
    const sendToRenderer = () => {
      this.withBothContents(id, (mainWc, viewWc) => {
        const canGo: CanGoType = {
          back: viewWc.navigationHistory.canGoBack(),
          forward: viewWc.navigationHistory.canGoForward(),
        };
        mainWc.send(browserChannels.onCanGo, id, canGo);
      });
    };

    const trackUrl = (url: string) => {
      if (url && !url.startsWith('about:') && !url.includes('error_page.html')) {
        const formattedUrl = formatWebAddress(url);
        storageManager.addBrowserRecent(formattedUrl);
        storageManager.addBrowserHistory(formattedUrl);
      }
    };

    sendToRenderer();

    webContents.on('did-navigate', (_, url) => {
      sendToRenderer();
      trackUrl(url);
    });

    webContents.on('did-navigate-in-page', (_, url) => {
      sendToRenderer();
      trackUrl(url);
    });

    webContents.on('did-finish-load', sendToRenderer);
    webContents.on('did-stop-loading', sendToRenderer);

    webContents.on('did-start-navigation', e => {
      if (e.isMainFrame) {
        this.getMainWebContents()?.send(browserChannels.onUrlChange, id, e.url);
      }
    });
  }

  private listenForLoading(id: string, webContents: WebContents) {
    const onLoading = (isLoading: boolean) => {
      this.getMainWebContents()?.send(browserChannels.isLoading, id, isLoading);
    };

    webContents.on('did-start-loading', () => onLoading(true));
    webContents.on('did-stop-loading', () => onLoading(false));
  }

  private listenForTitle(id: string, webContents: WebContents) {
    webContents.on('page-title-updated', () => {
      this.withBothContents(id, (mainWc, viewWc) => {
        const title = viewWc.getTitle();
        mainWc.send(browserChannels.onTitleChange, id, title);
        storageManager.updateBrowserFavIconTitle(formatWebAddress(viewWc.getURL()), title);
      });
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      this.withBothContents(id, (mainWc, viewWc) => {
        // Prefer higher quality formats: SVG > PNG > other > ICO
        const url =
          favicons.find(icon => icon.includes('.svg')) ||
          favicons.find(icon => icon.includes('.png')) ||
          favicons.find(icon => !icon.includes('.ico')) ||
          favicons[0] ||
          '';
        mainWc.send(browserChannels.onFavIconChange, id, url);
        storageManager.addBrowserFavIcon(formatWebAddress(viewWc.getURL()), url, viewWc.getTitle());
      });
    });
  }

  private setupWindowOpenHandler(webContents: WebContents) {
    webContents.setWindowOpenHandler(({url, disposition}) => {
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
        appManager?.getWebContent()?.send(tabsChannels.onNewTab, url, openInBackground);
        // Track URLs opened in new tabs (like real browsers)
        if (url && !url.startsWith('about:')) {
          const formattedUrl = formatWebAddress(url);
          storageManager.addBrowserRecent(formattedUrl);
          storageManager.addBrowserHistory(formattedUrl);
        }
      }

      return {action: 'deny'};
    });
  }

  private listenForZoom(webContents: WebContents) {
    webContents.on('zoom-changed', (_, zoomDirection) => {
      if (webContents.isDestroyed()) return;
      let resultFactor = webContents.getZoomFactor();
      resultFactor = zoomDirection === 'in' ? resultFactor + 0.1 : resultFactor - 0.1;
      if (resultFactor > 0.1 && resultFactor < 5) webContents.setZoomFactor(resultFactor);
    });
  }

  private listenForFullScreen(view: WebContentsView) {
    const webContents = view.webContents;
    webContents.on('enter-html-full-screen', () => {
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
      this.getMainWebContents()?.send(browserChannels.onFailedLoadUrl, id, errorCode, errorDescription, validatedURL);
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
      linkPreviewManager.updateUrl(url);
    });
  }

  private sendAudioStateChange(id: string, playing: boolean): void {
    this.withBothContents(id, (mainWc, viewWc) => {
      mainWc.send(volumeChannels.onAudioStateChange, id, {playing, muted: viewWc.audioMuted});
    });
  }

  public getSession() {
    return session.fromPartition('persist:lynxhub_browser');
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const newView = new WebContentsView({webPreferences: {session: this.getSession()}});
    const webContents = newView.webContents;
    newView.setBackgroundColor(getWindowColor());

    webContents.setUserAgent(getUserAgent());

    webContents.setZoomFactor(storageManager.getData('cards').zoomFactor);

    webContents.on('dom-ready', () => {
      this.getMainWebContents()?.send(browserChannels.onDomReady, id, true);
    });

    this.listenForNavigate(id, webContents);
    this.listenForLoading(id, webContents);
    this.listenForTitle(id, webContents);
    this.listenForFavIcon(id, webContents);
    this.listenForZoom(webContents);
    this.listenForFullScreen(newView);
    this.listenForFailLoad(webContents, id);
    this.listenForAudioEvents(id, webContents);
    this.listenForLinkHover(webContents);

    this.browsers.push({id, view: newView});

    const mainWindow = this.getMainWindow();
    if (!isNil(mainWindow)) mainWindow.contentView.addChildView(newView);

    this.setBounds();

    this.setupWindowOpenHandler(webContents);
    RegisterHotkeys(webContents);
    contextMenuManager.listenForMenu(webContents);
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
  }

  public clearHistory(selected: string[]) {
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
    const browser = this.browsers.find(view => view.id === id);
    const mainWindow = this.getMainWindow();

    if (browser && mainWindow) {
      mainWindow.contentView.removeChildView(browser.view);

      browser.view.webContents.removeAllListeners();
      browser.view.webContents.close();

      this.browsers = this.browsers.filter(view => view.id !== id);
    }
  }

  public loadURL(id: string, url: string) {
    this.withWebContents(id, wc => {
      wc.loadURL(url);
      if (url && !url.startsWith('about:') && !url.includes('error_page.html')) {
        const formattedUrl = formatWebAddress(url);
        storageManager.addBrowserRecent(formattedUrl);
        storageManager.addBrowserHistory(formattedUrl);
      }
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
    this.getMainWebContents()?.send(browserChannels.onClearFailed, id);
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
          setTimeout(resolve, 2000);
        });
      }

      if (webContents.isDestroyed()) return;

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
        webContents.executeJavaScript(script, true),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Script execution timeout')), 3000)),
      ]);
    } catch (error) {
      console.warn('Volume set skipped:', error instanceof Error ? error.message : error);
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
