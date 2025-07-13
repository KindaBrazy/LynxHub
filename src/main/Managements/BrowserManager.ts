import {join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, FindInPageOptions, session, shell, WebContents, WebContentsView} from 'electron';
import {isNil} from 'lodash';
import url from 'url';

import icon from '../../../resources/icon.png?asset';
import {formatWebAddress} from '../../cross/CrossUtils';
import {browserChannels, CanGoType, tabsChannels, WHType} from '../../cross/IpcChannelAndTypes';
import {appManager, storageManager} from '../index';
import {getUserAgent} from '../Utilities/Utils';
import contextMenuManager from './ContextMenuManager';
import RegisterHotkeys from './HotkeysManager';

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private mainWindow: BrowserWindow;
  private extraOffset: {id: string; offset: WHType}[] = [];

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
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

  private setBounds(view: WebContentsView) {
    const [initialWidth, initialHeight] = this.mainWindow.getSize();
    view.setBounds({
      x: 0,
      y: 80,
      width: initialWidth - this.getOffsetResult().width,
      height: initialHeight - 80 - this.getOffsetResult().height,
    });
    this.mainWindow.on('resize', () => {
      const [width, height] = this.mainWindow.getContentSize();
      view.setBounds({
        x: 0,
        y: 80,
        width: width - this.getOffsetResult().width,
        height: height - 80 - this.getOffsetResult().height,
      });
    });
  }

  private listenForNavigate(id: string, webContents: WebContents) {
    const sendToRenderer = () => {
      if (isNil(webContents) || webContents.isDestroyed()) return;

      const canGo: CanGoType = {
        back: webContents.navigationHistory.canGoBack(),
        forward: webContents.navigationHistory.canGoForward(),
      };
      this.mainWindow.webContents.send(browserChannels.onCanGo, id, canGo);
    };

    sendToRenderer();

    webContents.on('did-navigate', sendToRenderer);
    webContents.on('did-navigate-in-page', sendToRenderer);
    webContents.on('did-finish-load', sendToRenderer);
    webContents.on('did-stop-loading', sendToRenderer);

    webContents.on('did-start-navigation', e => {
      if (e.isMainFrame) this.mainWindow.webContents.send(browserChannels.onUrlChange, id, e.url);
    });
  }

  private listenForLoading(id: string, webContents: WebContents) {
    const onLoading = (isLoading: boolean) => {
      this.mainWindow.webContents.send(browserChannels.isLoading, id, isLoading);
    };

    webContents.on('did-start-loading', () => onLoading(true));
    webContents.on('did-stop-loading', () => onLoading(false));
  }

  private listenForTitle(id: string, webContents: WebContents) {
    webContents.on('page-title-updated', () => {
      if (isNil(webContents) || webContents.isDestroyed()) return;

      this.mainWindow.webContents.send(browserChannels.onTitleChange, id, webContents.getTitle());
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      if (isNil(webContents) || webContents.isDestroyed()) return;

      const url = favicons.find(icon => icon.includes('.ico')) || favicons[0] || '';
      this.mainWindow.webContents.send(browserChannels.onFavIconChange, id, url);

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

  private getSession() {
    return session.fromPartition('persist:lynxhub_browser');
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const newView = new WebContentsView({webPreferences: {session: this.getSession()}});
    const webContents = newView.webContents;

    webContents.setUserAgent(getUserAgent());

    webContents.setZoomFactor(storageManager.getData('cards').zoomFactor);

    webContents.on('dom-ready', () => this.mainWindow.webContents.send(browserChannels.onDomReady, id, true));

    this.listenForNavigate(id, webContents);
    this.listenForLoading(id, webContents);
    this.listenForTitle(id, webContents);
    this.listenForFavIcon(id, webContents);
    this.listenForZoom(webContents);
    this.listenForFullScreen(newView);
    this.listenForFailLoad(webContents);

    this.browsers.push({id, view: newView});
    this.mainWindow.contentView.addChildView(newView);

    this.setBounds(newView);

    this.setupWindowOpenHandler(webContents);
    RegisterHotkeys(webContents);
    contextMenuManager(webContents);
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

  public updateUserAgent() {
    this.browsers.forEach(view => view.view.webContents.setUserAgent(getUserAgent()));
  }

  public removeBrowser(id: string) {
    const browser = this.browsers.find(view => view.id === id);
    if (browser) {
      this.mainWindow.contentView.removeChildView(browser.view);
      browser.view.webContents.close();
      this.browsers = this.browsers.filter(view => view.id !== id);
    }
  }

  public loadURL(id: string, url: string) {
    this.getViewByID(id)?.webContents.loadURL(url);
  }

  public setVisible(id: string, visible: boolean) {
    const view = this.getViewByID(id);
    if (!view) return;
    if (visible) {
      this.mainWindow.contentView.addChildView(view);
    } else {
      this.mainWindow.contentView.removeChildView(view);
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
