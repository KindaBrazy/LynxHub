import {BrowserWindow, WebContentsView} from 'electron';

import {getUserAgent} from '../Utilities/Utils';
import contextMenuManager from './ContextMenuManager';
import RegisterHotkeys from './HotkeysManager';

export default class BrowserManager {
  private browsers: {id: string; view: WebContentsView}[] = [];
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  private setBounds(view: WebContentsView) {
    const [initialWidth, initialHeight] = this.mainWindow.getSize();
    view.setBounds({x: 0, y: 80, width: initialWidth, height: initialHeight});
    this.mainWindow.on('resize', () => {
      const [width, height] = this.mainWindow.getContentSize();
      view.setBounds({x: 0, y: 80, width, height});
    });
  }

  public createBrowser(id: string) {
    if (this.browsers.some(view => view.id === id)) return;

    const newView = new WebContentsView();
    newView.webContents.setUserAgent(getUserAgent());

    this.browsers.push({id, view: newView});
    this.mainWindow.contentView.addChildView(newView);

    this.setBounds(newView);

    RegisterHotkeys(newView.webContents);
    contextMenuManager(newView.webContents);
  }

  public removeBrowser(id: string) {
    const browser = this.browsers.find(view => view.id === id);
    if (browser) {
      this.mainWindow.contentView.removeChildView(browser.view);
      this.browsers = this.browsers.filter(view => view.id !== id);
    }
  }

  public loadURL(id: string, url: string) {
    this.browsers.find(view => view.id === id)?.view.webContents.loadURL(url);
  }

  public setVisible(id: string, visible: boolean) {
    this.browsers.find(view => view.id === id)?.view.setVisible(visible);
  }

  public reload(id: string) {
    this.browsers.find(view => view.id === id)?.view.webContents.reload();
  }
}
