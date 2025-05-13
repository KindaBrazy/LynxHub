import {BrowserWindow, FindInPageOptions, shell, WebContents, WebContentsView} from 'electron';

import {browserChannels, CanGoType, tabsChannels} from '../../cross/IpcChannelAndTypes';
import {appManager, storageManager} from '../index';
import {getUserAgent} from '../Utilities/Utils';
import contextMenuManager from './ContextMenuManager';
import RegisterHotkeys from './HotkeysManager';

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  private getViewByID(id: string) {
    return this.browsers.find(view => view.id === id)?.view;
  }

  private setBounds(view: WebContentsView) {
    const [initialWidth, initialHeight] = this.mainWindow.getSize();
    view.setBounds({x: 0, y: 80, width: initialWidth, height: initialHeight - 80});
    this.mainWindow.on('resize', () => {
      const [width, height] = this.mainWindow.getContentSize();
      view.setBounds({x: 0, y: 80, width, height: height - 80});
    });
  }

  private listenForNavigate(id: string, webContents: WebContents) {
    const sendToRenderer = () => {
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
      this.mainWindow.webContents.send(browserChannels.onTitleChange, id, webContents.getTitle());
    });
  }

  private listenForFavIcon(id: string, webContents: WebContents) {
    webContents.on('page-favicon-updated', (_, favicons) => {
      const url = favicons.find(icon => icon.includes('.ico')) || favicons[0] || '';
      this.mainWindow.webContents.send(browserChannels.onFavIconChange, id, url);

      storageManager.addBrowserRecentFavIcon(webContents.getURL(), url);
    });
  }

  private setupWindowOpenHandler(webContents: WebContents) {
    const openExternal = storageManager.getData('app').openLinkExternal;
    webContents.setWindowOpenHandler(({url}) => {
      if (openExternal) {
        shell.openExternal(url);
      } else {
        appManager.getWebContent()?.send(tabsChannels.onNewTab, url);
      }
      return {action: 'deny'};
    });
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const newView = new WebContentsView();
    const webContents = newView.webContents;

    webContents.setUserAgent(getUserAgent());

    webContents.setZoomFactor(storageManager.getData('cards').zoomFactor);

    webContents.on('dom-ready', () => this.mainWindow.webContents.send(browserChannels.onDomReady, id, true));

    this.listenForNavigate(id, webContents);
    this.listenForLoading(id, webContents);
    this.listenForTitle(id, webContents);
    this.listenForFavIcon(id, webContents);

    this.browsers.push({id, view: newView});
    this.mainWindow.contentView.addChildView(newView);

    this.setBounds(newView);

    this.setupWindowOpenHandler(webContents);
    RegisterHotkeys(webContents);
    contextMenuManager(webContents);
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
    this.getViewByID(id)?.setVisible(visible);
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
