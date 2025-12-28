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
      const mainWebContents = this.getMainWebContents();
      if (!mainWebContents) return;
      if (isNil(webContents) || isNil(mainWebContents) || webContents.isDestroyed()) return;

      const canGo: CanGoType = {
        back: webContents.navigationHistory.canGoBack(),
        forward: webContents.navigationHistory.canGoForward(),
      };

      mainWebContents.send(browserChannels.onCanGo, id, canGo);
    };

    sendToRenderer();

    webContents.on('did-navigate', sendToRenderer);
    webContents.on('did-navigate-in-page', sendToRenderer);
    webContents.on('did-finish-load', sendToRenderer);
    webContents.on('did-stop-loading', sendToRenderer);

    webContents.on('did-start-navigation', e => {
      const mainWebContents = this.getMainWebContents();
      if (e.isMainFrame && !isNil(mainWebContents)) mainWebContents.send(browserChannels.onUrlChange, id, e.url);
    });
  }

  private listenForLoading(id: string, webContents: WebContents) {
    const onLoading = (isLoading: boolean) => {
      const mainWebContents = this.getMainWebContents();
      if (isNil(mainWebContents)) return;

      mainWebContents.send(browserChannels.isLoading, id, isLoading);
    };

    webContents.on('did-start-loading', () => onLoading(true));
    webContents.on('did-stop-loading', () => onLoading(false));
  }

  private listenForTitle(id: string, webContents: WebContents) {
    webContents.on('page-title-updated', () => {
      const mainWebContents = this.getMainWebContents();
      if (isNil(webContents) || isNil(mainWebContents) || webContents.isDestroyed()) return;

      const title = webContents.getTitle();
      mainWebContents.send(browserChannels.onTitleChange, id, title);

      // Update title in storage for existing favicon entries
      storageManager.updateBrowserFavIconTitle(formatWebAddress(webContents.getURL()), title);
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      const mainWebContents = this.getMainWebContents();
      if (isNil(webContents) || isNil(mainWebContents) || webContents.isDestroyed()) return;

      // Prefer higher quality formats: SVG > PNG > other > ICO
      const url =
        favicons.find(icon => icon.includes('.svg')) ||
        favicons.find(icon => icon.includes('.png')) ||
        favicons.find(icon => !icon.includes('.ico')) ||
        favicons[0] ||
        '';
      mainWebContents.send(browserChannels.onFavIconChange, id, url);

      storageManager.addBrowserFavIcon(formatWebAddress(webContents.getURL()), url, webContents.getTitle());
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
        appManager?.getWebContent()?.send(tabsChannels.onNewTab, url);
      }

      return {action: 'deny'};
    });
  }

  private listenForZoom(webContents: WebContents) {
    webContents.on('zoom-changed', (_, zoomDirection) => {
      if (isNil(webContents) || webContents.isDestroyed()) return;

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
      // Ignore benign error codes like -3 (ABORTED), which happens on normal navigation.
      if (errorCode === -3 || !isMainFrame) {
        return;
      }

      this.setVisible(id, false);

      const mainWebContents = this.getMainWebContents();
      if (isNil(mainWebContents)) return;

      mainWebContents.send(browserChannels.onFailedLoadUrl, id, errorCode, errorDescription, validatedURL);

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
    const mainWebContents = this.getMainWebContents();
    if (!mainWebContents) return;

    const webContents = this.getViewByID(id)?.webContents;
    if (!webContents) return;

    try {
      mainWebContents.send(volumeChannels.onAudioStateChange, id, {
        playing,
        muted: webContents.audioMuted,
      });
    } catch (error) {
      console.error('Error sending audio state change:', error);
    }
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
      const mainWebContents = this.getMainWebContents();
      if (isNil(mainWebContents)) return;
      mainWebContents.send(browserChannels.onDomReady, id, true);
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
    this.getViewByID(id)?.webContents.focus();
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
    this.browsers.forEach(view => view.view.webContents.setUserAgent(getUserAgent()));
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
    this.getViewByID(id)?.webContents.loadURL(url);
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
    this.getViewByID(id)?.webContents.findInPage(value, options);
  }

  public stopFindInPage(id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') {
    this.getViewByID(id)?.webContents.stopFindInPage(action);
  }

  public getCurrentZoom(id: string) {
    return this.getViewByID(id)?.webContents.getZoomFactor();
  }

  public setZoomFactor(id: string, factor: number) {
    this.getViewByID(id)?.webContents.setZoomFactor(factor);
  }

  public reload(id: string) {
    const mainWebContents = this.getMainWebContents();
    if (!isNil(mainWebContents)) {
      mainWebContents.send(browserChannels.onClearFailed, id);
    }
    this.setVisible(id, true);
    this.getViewByID(id)?.webContents.reload();
  }

  public goBack(id: string) {
    this.getViewByID(id)?.webContents.navigationHistory.goBack();
  }

  public goForward(id: string) {
    this.getViewByID(id)?.webContents.navigationHistory.goForward();
  }

  public setMuted(id: string, muted: boolean): void {
    try {
      const webContents = this.getViewByID(id)?.webContents;
      if (!webContents || webContents.isDestroyed()) {
        console.warn(`WebContents not found or destroyed for id: ${id}`);
        return;
      }

      if (typeof webContents.setAudioMuted === 'function') {
        webContents.setAudioMuted(muted);
      } else {
        console.warn('setAudioMuted API not available');
      }
    } catch (error) {
      console.error('Error setting mute state:', error);
    }
  }

  public async setVolume(id: string, volume: number): Promise<void> {
    try {
      const webContents = this.getViewByID(id)?.webContents;
      if (!webContents || webContents.isDestroyed()) {
        console.warn(`WebContents not found or destroyed for id: ${id}`);
        return;
      }

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
          // Timeout fallback in case events don't fire
          setTimeout(resolve, 2000);
        });
      }

      // Re-check after waiting
      if (webContents.isDestroyed()) return;

      const volumeDecimal = Math.max(0, Math.min(100, volume)) / 100;

      const script = `
        (function() {
          // Set volume on all existing audio/video elements
          document.querySelectorAll('audio, video').forEach(el => {
            el.volume = ${volumeDecimal};
          });
          
          // Set up mutation observer to catch dynamically added elements
          if (!window.__lynxVolumeObserver) {
            window.__lynxVolumeObserver = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') {
                    node.volume = ${volumeDecimal};
                  }
                  // Also check children of added nodes
                  if (node.querySelectorAll) {
                    node.querySelectorAll('audio, video').forEach(el => {
                      el.volume = ${volumeDecimal};
                    });
                  }
                });
              });
            });
            
            window.__lynxVolumeObserver.observe(document.body, {
              childList: true,
              subtree: true
            });
          }
          
          // Store volume for new elements
          window.__lynxVolume = ${volumeDecimal};
        })();
      `;

      // Execute with timeout to prevent hanging
      await Promise.race([
        webContents.executeJavaScript(script, true),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Script execution timeout')), 3000)),
      ]);
    } catch (error) {
      // Silently handle timeout/execution errors - volume will be applied when user interacts with media
      console.warn('Volume set skipped:', error instanceof Error ? error.message : error);
    }
  }

  public getAudioState(id: string): AudioState | null {
    try {
      const webContents = this.getViewByID(id)?.webContents;
      if (!webContents || webContents.isDestroyed()) {
        console.warn(`WebContents not found or destroyed for id: ${id}`);
        return null;
      }

      return {
        playing: !webContents.audioMuted && webContents.isCurrentlyAudible(),
        muted: webContents.audioMuted,
      };
    } catch (error) {
      console.error('Error getting audio state:', error);
      return null;
    }
  }
}
