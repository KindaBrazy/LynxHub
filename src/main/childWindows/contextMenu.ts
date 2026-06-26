import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {ElementResizeData} from '@lynx_common/types';
import {isMac, isWin} from '@lynx_common/utils';
import {contextMenuIpc} from '@lynx_main/ipc/contextMenu';
import {dialogBlurred} from '@lynx_main/ipc/dialogsWindow';
import lynxIpc from '@lynx_main/ipc/ipcWrapper';
import classHolder from '@lynx_main/managers/classHolder';
import {BrowserWindow, BrowserWindowConstructorOptions, screen, WebContents} from 'electron';

export default class ContextMenuManager {
  private contextMenuWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private customContextPosition: {x: number; y: number} | undefined;
  private webContents: WebContents[] = [];

  private static readonly CONTEXT_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    minWidth: 1,
    minHeight: 1,
    resizable: isWin,
    maximizable: false,
    skipTaskbar: true,
    minimizable: false,
    titleBarStyle: isMac ? 'customButtonsOnHover' : 'default',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  public createWindow(mainWindow: BrowserWindow) {
    if (this.contextMenuWindow && !this.contextMenuWindow.isDestroyed()) {
      this.contextMenuWindow.close();
    }

    this.contextMenuWindow = new BrowserWindow({...ContextMenuManager.CONTEXT_WINDOW_CONFIG, parent: mainWindow});
    this.mainWindow = mainWindow;

    this.setupWindowListeners();
    this.loadWindowContent();
  }

  private setupWindowListeners() {
    if (!this.contextMenuWindow) return;

    this.contextMenuWindow.webContents.on('before-input-event', (_, input) => {
      if (input.key.toLowerCase() === 'escape') this.hideContextMenu();
    });

    this.contextMenuWindow.on('blur', () => this.hideContextMenu(false));

    this.contextMenuWindow.on('closed', () => {
      this.contextMenuWindow = undefined;
      this.notifyDownloadManagerClose();
    });

    if (this.mainWindow) {
      this.mainWindow.on('close', () => {
        this.mainWindow = undefined;
        this.webContents = [];
      });
    }
  }

  private loadWindowContent() {
    if (!this.contextMenuWindow) return;

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.contextMenuWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/contextMenu.html`);
    } else {
      this.contextMenuWindow.loadFile(path.join(__dirname, `../renderer/contextMenu.html`));
    }
  }

  private notifyDownloadManagerClose() {
    const browserDownloadManager = classHolder.browserDownloadManager;
    if (browserDownloadManager) {
      browserDownloadManager.onContextClose();
    } else {
      classHolder.waitForClass('browserDownloadManager').then(browserDownloadManager => {
        browserDownloadManager.onContextClose();
      });
    }
  }

  public setCustomContextPosition(customPosition?: {x: number; y: number}): void {
    this.customContextPosition = customPosition;
  }

  public listenForMenu(contents: WebContents) {
    this.webContents.push(contents);

    contents.on('destroyed', () => {
      this.webContents = this.webContents.filter(wc => wc !== contents);
    });

    contents.on('context-menu', (_e, params) => {
      if (!this.contextMenuWindow || this.contextMenuWindow.isDestroyed()) return;

      this.setCustomContextPosition(undefined);
      contextMenuIpc.send.rightClick(
        params,
        {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
        contents.id,
      );

      this.showContextMenu();
    });
  }

  public getWindow(): BrowserWindow | undefined {
    if (this.contextMenuWindow?.isDestroyed()) {
      this.contextMenuWindow = undefined;
    }
    return this.contextMenuWindow;
  }

  public getWebContent(): WebContents | undefined {
    const window = this.getWindow();
    return window && !window.webContents.isDestroyed() ? window.webContents : undefined;
  }

  public sendMessage(channel: string, ...args: any[]): void {
    const webContents = this.getWebContent();
    if (!webContents) {
      console.error('Failed to send message: webContents is not available.');
      return;
    }
    lynxIpc.send(webContents, channel, ...args);
  }

  public showContextMenu() {
    if (!this.contextMenuWindow || this.contextMenuWindow.isDestroyed()) return;

    // We must show the window (with opacity 0) so that Chromium runs the rendering pipeline.
    // If the window is completely hidden, requestAnimationFrame and ResizeObserver will not fire.
    this.contextMenuWindow.setOpacity(0);
    this.contextMenuWindow.show();

    // Send request to renderer to calculate size and get back to us
    contextMenuIpc.send.requestShow();
  }

  /**
   * Called by the renderer when it is ready to show, with its final calculated size.
   */
  public applySizeAndShow(data: ElementResizeData) {
    if (!this.contextMenuWindow || this.contextMenuWindow.isDestroyed()) return;

    this.resizeContextMenu(data);
    this.positionContextMenuAtCursor();

    // Now that it's sized and positioned correctly, make it instantly visible
    this.contextMenuWindow.setOpacity(1);
  }

  public hideContextMenu(focusMainWindow: boolean = true) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed() || !window.isVisible()) return;

    dialogBlurred();

    window.hide();
    window.setOpacity(1);

    if (focusMainWindow && this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
    }
  }

  public getContentById(id: number) {
    return this.webContents.find(content => content.id === id);
  }

  /**
   * Resizes the context menu based on content dimensions from the renderer.
   * Ensures the window stays within safe bounds (20x20 to 4096x4096).
   */
  public resizeContextMenu(data: ElementResizeData) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    if (!data || typeof data !== 'object') return;

    const {width, height, dpr} = data;
    const isValid = (val: any) => typeof val === 'number' && Number.isFinite(val) && val > 0;

    if (!isValid(width) || !isValid(height)) return;

    const scale = isWin ? 1 : isValid(dpr) ? dpr : 1;
    const contentW = Math.max(20, Math.min(Math.ceil(width * scale), 4096));
    const contentH = Math.max(20, Math.min(Math.ceil(height * scale), 4096));

    try {
      window.setBounds({width: contentW, height: contentH}, false);
    } catch (error) {
      console.error('Failed to resize context menu:', error);
    }
  }

  /**
   * Calculates the best position for the context menu.
   * Keeps the menu fully on-screen by "flipping" direction if needed.
   */
  private positionContextMenuAtCursor() {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    const {width: menuWidth, height: menuHeight} = window.getBounds();
    let clickPoint: {x: number; y: number};

    if (this.customContextPosition && this.mainWindow && !this.mainWindow.isDestroyed()) {
      const parentBounds = this.mainWindow.getBounds();
      clickPoint = {
        x: Math.floor(this.customContextPosition.x) + parentBounds.x + 1,
        y: Math.floor(this.customContextPosition.y) + parentBounds.y + 1,
      };
    } else {
      clickPoint = screen.getCursorScreenPoint();
    }

    const display = screen.getDisplayNearestPoint(clickPoint);
    const workArea = display.workArea;

    let newX = clickPoint.x;
    let newY = clickPoint.y;

    if (newX + menuWidth > workArea.x + workArea.width) {
      newX = clickPoint.x - (this.customContextPosition ? menuWidth / 2 : menuWidth);
    }

    if (newY + menuHeight > workArea.y + workArea.height) {
      newY = clickPoint.y - menuHeight;
    }

    newX = Math.max(newX, workArea.x);
    newY = Math.max(newY, workArea.y);

    try {
      window.setBounds({x: Math.floor(newX), y: Math.floor(newY)}, false);
    } catch (e) {
      console.error('Failed to set context menu position:', e);
    }
  }
}
