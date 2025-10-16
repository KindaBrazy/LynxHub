import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, BrowserWindowConstructorOptions, ipcMain, screen, shell, WebContents} from 'electron';

import {browserChannels, contextMenuChannels, tabsChannels} from '../../cross/IpcChannelAndTypes';
import BrowserManager from './BrowserManager';

export default class ContextMenuManager {
  private contextMenuWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private customContextPosition: {x: number; y: number} | undefined;
  private animationInterval?: NodeJS.Timeout;
  private isHiding = false;
  private webContents: WebContents[] = [];

  private static readonly CONTEXT_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 180,
    height: 290,
    minWidth: 0,
    minHeight: 0,
    resizable: false,
    maximizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  private clearAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
  }

  public createWindow(mainWindow: BrowserWindow) {
    this.contextMenuWindow = new BrowserWindow({...ContextMenuManager.CONTEXT_WINDOW_CONFIG, parent: mainWindow});
    this.mainWindow = mainWindow;

    this.contextMenuWindow.webContents.on('before-input-event', (_, input) => {
      if (input.key.toLowerCase() === 'escape') this.hideContextMenu();
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.contextMenuWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/context_menu.html`);
    } else {
      this.contextMenuWindow.loadFile(path.join(__dirname, `../renderer/context_menu.html`));
    }

    this.contextMenuWindow.on('blur', () => this.hideContextMenu(false));
  }

  public setCustomContextPosition(customPosition?: {x: number; y: number}): void {
    this.customContextPosition = customPosition;
  }

  public listenForMenu(contents: WebContents) {
    this.webContents.push(contents);
    contents.on('context-menu', (_e, params) => {
      const window = this.contextMenuWindow;
      if (!window || window.isDestroyed()) return;

      this.setCustomContextPosition(undefined);
      window.webContents?.send(
        contextMenuChannels.onInitView,
        params,
        {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
        contents.id,
      );
    });
  }

  public listenForBrowserChannels(browserManager: BrowserManager) {
    ipcMain.on(browserChannels.openFindInPage, (_, id: string, customPosition?: {x: number; y: number}) => {
      this.setCustomContextPosition(customPosition);
      this.contextMenuWindow?.webContents.send(contextMenuChannels.onFind, id);
    });
    ipcMain.on(browserChannels.openZoom, (_, id: string) => {
      this.setCustomContextPosition(undefined);
      this.contextMenuWindow?.webContents.send(contextMenuChannels.onZoom, id, browserManager.getCurrentZoom(id));
    });
    ipcMain.on(contextMenuChannels.openTerminateAI, (_, id: string) => {
      this.setCustomContextPosition(undefined);
      this.contextMenuWindow?.webContents.send(contextMenuChannels.onTerminateAI, id);
    });
    ipcMain.on(contextMenuChannels.openTerminateTab, (_, id: string, customPosition?: {x: number; y: number}) => {
      this.setCustomContextPosition(customPosition);
      this.contextMenuWindow?.webContents.send(contextMenuChannels.onTerminateTab, id);
    });
    ipcMain.on(contextMenuChannels.openCloseApp, () => {
      this.setCustomContextPosition(undefined);
      this.contextMenuWindow?.webContents.send(contextMenuChannels.onCloseApp);
    });
  }

  public listenForContextChannels() {
    ipcMain.on(contextMenuChannels.resizeWindow, (_e, dimensions: {width: number | any; height: number | any}) =>
      this.resizeContextMenu(dimensions),
    );

    ipcMain.on(contextMenuChannels.copy, (_, id: number) => this.getContentById(id)?.copy());
    ipcMain.on(contextMenuChannels.paste, (_, id: number) => this.getContentById(id)?.paste());
    ipcMain.on(contextMenuChannels.selectAll, (_, id: number) => this.getContentById(id)?.selectAll());
    ipcMain.on(contextMenuChannels.undo, (_, id: number) => this.getContentById(id)?.undo());
    ipcMain.on(contextMenuChannels.redo, (_, id: number) => this.getContentById(id)?.redo());
    ipcMain.on(contextMenuChannels.openExternal, (_, url: string) => shell.openExternal(url));
    ipcMain.on(contextMenuChannels.downloadImage, (_, id: number, url: string) =>
      this.getContentById(id)?.downloadURL(url),
    );

    ipcMain.on(contextMenuChannels.showWindow, () => this.showContextMenu());
    ipcMain.on(contextMenuChannels.hideWindow, () => this.hideContextMenu());

    ipcMain.on(contextMenuChannels.replaceMisspelling, (_, id: number, text: string) =>
      this.getContentById(id)?.replaceMisspelling(text),
    );
    ipcMain.on(contextMenuChannels.newTab, (_, url: string) => this.sendMainMessage(tabsChannels.onNewTab, url));
    ipcMain.on(contextMenuChannels.navigate, (_, id: number, action: 'back' | 'forward' | 'refresh') => {
      switch (action) {
        case 'back':
          this.getContentById(id)?.navigationHistory.goBack();
          break;
        case 'forward':
          this.getContentById(id)?.navigationHistory.goForward();
          break;
        case 'refresh':
          this.getContentById(id)?.reload();
          break;
      }
    });

    ipcMain.on(contextMenuChannels.relaunchAI, (_, id: string) =>
      this.sendMainMessage(contextMenuChannels.onRelaunchAI, id),
    );
    ipcMain.on(contextMenuChannels.stopAI, (_, id: string) => this.sendMainMessage(contextMenuChannels.onStopAI, id));
    ipcMain.on(contextMenuChannels.removeTab, (_, tabID: string) =>
      this.sendMainMessage(contextMenuChannels.onRemoveTab, tabID),
    );
  }

  public getWindow() {
    return this.contextMenuWindow;
  }

  private showContextMenu() {
    if (!this.contextMenuWindow || this.contextMenuWindow.isDestroyed()) return;

    this.isHiding = false;

    this.clearAnimation();

    this.positionContextMenuAtCursor();
    this.contextMenuWindow.setOpacity(0);
    this.contextMenuWindow.show();

    let opacity = 0;
    this.animationInterval = setInterval(() => {
      const window = this.contextMenuWindow;
      if (!window || window.isDestroyed()) {
        this.clearAnimation();
        return;
      }

      opacity += 0.2;
      if (opacity >= 1) {
        this.clearAnimation();
        window.setOpacity(1);
      } else {
        window.setOpacity(opacity);
      }
    }, 10);
  }

  private hideContextMenu(focusMainWindow: boolean = true) {
    const window = this.contextMenuWindow;

    if (!window || window.isDestroyed() || !window.isVisible() || this.isHiding) {
      return;
    }

    this.isHiding = true;

    this.clearAnimation();

    let opacity = 1;
    this.animationInterval = setInterval(() => {
      opacity -= 0.2;
      if (opacity <= 0) {
        this.clearAnimation();
        window.hide();
        window.setOpacity(1);

        this.isHiding = false;

        if (focusMainWindow && this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow?.focus();
        }
      } else {
        window.setOpacity(opacity);
      }
    }, 10);
  }

  private getContentById(id: number) {
    return this.webContents.find(content => content.id === id);
  }

  private sendMainMessage(channel: string, ...args: any[]) {
    const mainWebcontents = this.mainWindow?.webContents;
    if (!mainWebcontents || mainWebcontents.isDestroyed()) return;

    mainWebcontents.send(channel, ...args);
  }

  private resizeContextMenu(dimensions: {width: number | any; height: number | any}) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    const {width, height} = dimensions;

    const isValuesValid =
      typeof width === 'number' &&
      typeof height === 'number' &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0;

    if (isValuesValid) {
      try {
        const w = Math.max(1, Math.round(width));
        const h = Math.max(1, Math.round(height));
        console.log('Setting size to:', w, h);
        window.setSize(w, h);
        window.setContentSize(w, h);
      } catch (error) {
        console.error('Failed to set window size:', {width, height, error});
      }
    } else {
      console.error('Invalid dimensions received:', dimensions);
    }
  }

  private positionContextMenuAtCursor() {
    const window = this.contextMenuWindow;
    if (!window) return;
    const [menuWidth, menuHeight] = window.getContentSize();

    const {x: cursorX, y: cursorY} = screen.getCursorScreenPoint();
    const defaultDisplay = screen.getDisplayNearestPoint({x: cursorX, y: cursorY});
    const defaultWorkArea = defaultDisplay.workArea;
    let newX = cursorX;
    let newY = cursorY;

    if (newX + menuWidth > defaultWorkArea.x + defaultWorkArea.width) {
      newX = defaultWorkArea.x + defaultWorkArea.width - menuWidth;
    }
    if (newY + menuHeight > defaultWorkArea.y + defaultWorkArea.height) {
      newY = defaultWorkArea.y + defaultWorkArea.height - menuHeight;
    }
    if (newX < defaultWorkArea.x) {
      newX = defaultWorkArea.x;
    }
    if (newY < defaultWorkArea.y) {
      newY = defaultWorkArea.y;
    }

    try {
      if (this.customContextPosition) {
        const parentBounds = this.mainWindow!.getBounds();
        let absX = Math.floor(this.customContextPosition.x) + parentBounds.x + 10;
        let absY = Math.floor(this.customContextPosition.y) + parentBounds.y + 10;

        const disp = screen.getDisplayNearestPoint({x: absX, y: absY});
        const workArea = disp.workArea;

        if (absX + menuWidth > workArea.x + workArea.width) {
          absX = workArea.x + workArea.width - menuWidth;
        }
        if (absY + menuHeight > workArea.y + workArea.height) {
          absY = workArea.y + workArea.height - menuHeight;
        }
        if (absX < workArea.x) {
          absX = workArea.x;
        }
        if (absY < workArea.y) {
          absY = workArea.y;
        }

        window.setPosition(absX, absY, true);
      } else {
        window.setPosition(Math.floor(newX), Math.floor(newY), true);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
