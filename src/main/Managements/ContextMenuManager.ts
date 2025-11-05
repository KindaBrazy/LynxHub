import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {BrowserWindow, BrowserWindowConstructorOptions, ipcMain, screen, shell, WebContents} from 'electron';

import {ContextResizeData} from '../../cross/CrossTypes';
import {browserChannels, contextMenuChannels, tabsChannels} from '../../cross/IpcChannelAndTypes';
import AddBreadcrumb_Main from './Breadcrumbs';
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
    useContentSize: true,
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
    ipcMain.on(contextMenuChannels.resizeWindow, (_e, data: ContextResizeData) => this.resizeContextMenu(data));

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

      if (!window || window.isDestroyed()) {
        this.clearAnimation();
        this.isHiding = false;
        return;
      }

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

  private resizeContextMenu(data: ContextResizeData) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    const {width: cssWidth, height: cssHeight, dpr = 1} = data;

    // noinspection SuspiciousTypeOfGuard
    const isValid =
      typeof cssWidth === 'number' &&
      typeof cssHeight === 'number' &&
      Number.isFinite(cssWidth) &&
      Number.isFinite(cssHeight) &&
      cssWidth > 0 &&
      cssHeight > 0;

    if (!isValid) {
      console.error('Invalid dimensions received:', data);
      return;
    }

    try {
      // noinspection SuspiciousTypeOfGuard
      const scale = typeof dpr === 'number' && dpr > 0 ? dpr : 1;

      const contentW = Math.max(1, Math.ceil(cssWidth * scale));
      const contentH = Math.max(1, Math.ceil(cssHeight * scale));

      AddBreadcrumb_Main(
        `'Resizing context menu (content area):', ${{
          cssWidth,
          cssHeight,
          scale,
          contentW,
          contentH,
        }}`,
      );

      window.setContentSize(contentW, contentH);
    } catch (error) {
      console.error('Failed to set window size:', {data, error});
    }
  }

  private positionContextMenuAtCursor() {
    const window = this.contextMenuWindow;
    if (!window) return;

    const [menuWidth, menuHeight] = window.getContentSize();

    // 1. Determine the initial click point on the screen
    let clickPoint: {x: number; y: number};

    if (this.customContextPosition) {
      // Use the custom position relative to the main window
      const parentBounds = this.mainWindow!.getBounds();
      clickPoint = {
        x: Math.floor(this.customContextPosition.x) + parentBounds.x + 1,
        y: Math.floor(this.customContextPosition.y) + parentBounds.y + 1,
      };
    } else {
      // Use the global cursor position
      clickPoint = screen.getCursorScreenPoint();
    }

    // 2. Determine the display and work area for that point
    const display = screen.getDisplayNearestPoint(clickPoint);
    const workArea = display.workArea;

    // 3. Calculate the ideal menu position with "flipping" logic
    let newX = clickPoint.x;
    let newY = clickPoint.y;

    // Adjust horizontal position: If it goes off the right, open to the left
    if (newX + menuWidth > workArea.x + workArea.width) {
      newX = clickPoint.x - menuWidth;
    }

    // Adjust vertical position: If it goes off the bottom, open to the top
    if (newY + menuHeight > workArea.y + workArea.height) {
      newY = clickPoint.y - menuHeight;
    }

    // Final boundary checks to ensure it never goes off the top/left
    // (This is a failsafe for multi-monitor setups or unusual work areas)
    if (newX < workArea.x) {
      newX = workArea.x;
    }
    if (newY < workArea.y) {
      newY = workArea.y;
    }

    // 4. Set the final position
    try {
      // Use Math.floor to ensure integer coordinates
      window.setPosition(Math.floor(newX), Math.floor(newY), true);
    } catch (e) {
      console.error('Failed to set context menu position:', e);
    }
  }
}
