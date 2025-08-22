import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, FindInPageOptions, session, shell, WebContents, WebContentsView} from 'electron';
import {isEmpty, isNil} from 'lodash';
import url from 'url';

import icon from '../../../resources/icon.png?asset';
import {formatWebAddress} from '../../cross/CrossUtils';
import {browserChannels, CanGoType, tabsChannels, WHType} from '../../cross/IpcChannelAndTypes';
import {appManager, contextMenuManager, storageManager} from '../index';
import {getUserAgent} from '../Utilities/Utils';
import RegisterHotkeys from './HotkeysManager';

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private mainWindow: BrowserWindow;
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

      mainWebContents.send(browserChannels.onTitleChange, id, webContents.getTitle());
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      const mainWebContents = this.getMainWebContents();
      if (isNil(webContents) || isNil(mainWebContents) || webContents.isDestroyed()) return;

      const url = favicons.find(icon => icon.includes('.ico')) || favicons[0] || '';
      mainWebContents.send(browserChannels.onFavIconChange, id, url);

      storageManager.addBrowserFavIcon(formatWebAddress(webContents.getURL()), url);
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

  private listenForFailLoad(view: WebContents) {
    view.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
      // Ignore benign error codes like -3 (ABORTED), which happens on normal navigation.
      if (errorCode === -3) {
        return;
      }

      console.error('failed load:', errorCode, errorDescription, validatedURL);

      const errorPageURL =
        is.dev && process.env['ELECTRON_RENDERER_URL']
          ? `${process.env['ELECTRON_RENDERER_URL']}/error_page.html`
          : url.format({
              pathname: join(__dirname, '../renderer/error_page.html'),
              protocol: 'file:',
              slashes: true,
            });

      const urlWithParams = new URL(errorPageURL);
      urlWithParams.searchParams.append('errorCode', String(errorCode));
      urlWithParams.searchParams.append('errorDescription', errorDescription);
      urlWithParams.searchParams.append('url', validatedURL);

      view.loadURL(urlWithParams.toString());
    });
  }

  public getSession() {
    return session.fromPartition('persist:lynxhub_browser');
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const newView = new WebContentsView({webPreferences: {session: this.getSession()}});
    const webContents = newView.webContents;

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
    this.listenForFailLoad(webContents);

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

  public clearCache() {
    this.getSession().clearCache();
  }

  public clearCookies() {
    this.getSession().clearData({dataTypes: ['cookies']});
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
    this.getViewByID(id)?.webContents.reload();
  }

  public goBack(id: string) {
    this.getViewByID(id)?.webContents.navigationHistory.goBack();
  }

  public goForward(id: string) {
    this.getViewByID(id)?.webContents.navigationHistory.goForward();
  }
}
