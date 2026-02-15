import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {ContextResizeData} from '@lynx_common/types';
import classHolder from '@lynx_main/managers/classHolder';
import {contextMenuIpc} from '@lynx_main/ipc/contextMenu';
import {dialogBlured} from '@lynx_main/ipc/dialogsWindow';
import lynxIpc from '@lynx_main/ipc/lynxIpc';
import AddBreadcrumb_Main from '@lynx_main/utils/breadcrumbs';
import {BrowserWindow, BrowserWindowConstructorOptions, screen, WebContents} from 'electron';

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
    minimizable: false,
    titleBarStyle: process.platform === 'darwin' ? 'customButtonsOnHover' : 'default',
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
    // Close existing context menu window if it exists (e.g., on macOS reactivation)
    if (this.contextMenuWindow && !this.contextMenuWindow.isDestroyed()) {
      this.contextMenuWindow.close();
    }

    this.contextMenuWindow = new BrowserWindow({...ContextMenuManager.CONTEXT_WINDOW_CONFIG, parent: mainWindow});
    this.mainWindow = mainWindow;

    this.contextMenuWindow.webContents.on('before-input-event', (_, input) => {
      if (input.key.toLowerCase() === 'escape') this.hideContextMenu();
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.contextMenuWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/contextMenu.html`);
    } else {
      this.contextMenuWindow.loadFile(path.join(__dirname, `../renderer/contextMenu.html`));
    }

    this.contextMenuWindow.on('blur', () => this.hideContextMenu(false));

    this.contextMenuWindow.on('closed', () => {
      this.contextMenuWindow = undefined;

      const browserDownloadManager = classHolder.browserDownloadManager;
      if (browserDownloadManager) {
        browserDownloadManager.onContextClose();
      } else {
        classHolder.waitForClass('browserDownloadManager').then(browserDownloadManager => {
          browserDownloadManager.onContextClose();
        });
      }
    });

    mainWindow.on('close', () => {
      this.mainWindow = undefined;
      this.webContents = [];
    });
  }

  public setCustomContextPosition(customPosition?: {x: number; y: number}): void {
    this.customContextPosition = customPosition;
  }

  public listenForMenu(contents: WebContents) {
    this.webContents.push(contents);

    // Clean up reference when WebContents is destroyed to prevent memory leak
    contents.on('destroyed', () => {
      this.webContents = this.webContents.filter(wc => wc !== contents);
    });

    contents.on('context-menu', (_e, params) => {
      const window = this.contextMenuWindow;
      if (!window || window.isDestroyed()) return;

      this.setCustomContextPosition(undefined);
      contextMenuIpc.send.rightClick(
        params,
        {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
        contents.id,
      );
    });
  }

  public getWindow(): BrowserWindow | undefined {
    if (!this.contextMenuWindow) return undefined;

    if (this.contextMenuWindow.isDestroyed()) {
      this.contextMenuWindow = undefined;
      return undefined;
    }

    return this.contextMenuWindow;
  }

  public getWebContent(): WebContents | undefined {
    const webContent = this.getWindow()?.webContents;

    if (!webContent || webContent.isDestroyed()) return undefined;

    return webContent;
  }

  public sendMessage(channel: string, ...args: any[]): void {
    const webContents = this.getWebContent();
    if (!webContents) {
      console.error('Failed to send message: linkPreview or webContents is not available.');
      return;
    }

    lynxIpc.send(webContents, channel, ...args);
  }

  public showContextMenu() {
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

  public hideContextMenu(focusMainWindow: boolean = true) {
    const window = this.contextMenuWindow;

    if (!window || window.isDestroyed() || !window.isVisible() || this.isHiding) {
      return;
    }

    dialogBlured();

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
          this.mainWindow.focus();
        }
      } else {
        window.setOpacity(opacity);
      }
    }, 10);
  }

  public getContentById(id: number) {
    return this.webContents.find(content => content.id === id);
  }

  public resizeContextMenu(data: ContextResizeData) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    // Validate data object exists
    if (!data || typeof data !== 'object') {
      console.error('Invalid resize data: expected object, received:', typeof data);
      return;
    }

    const {width: cssWidth, height: cssHeight, dpr} = data;

    // Validate width and height are positive finite numbers
    const isValidDimension = (val: unknown): val is number =>
      typeof val === 'number' && Number.isFinite(val) && val > 0;

    if (!isValidDimension(cssWidth) || !isValidDimension(cssHeight)) {
      console.error('Invalid dimensions received:', {width: cssWidth, height: cssHeight});
      return;
    }

    // Validate and normalize dpr (device pixel ratio)
    const scale = isValidDimension(dpr) ? dpr : 1;

    // Calculate content size with bounds checking
    const contentW = Math.max(1, Math.min(Math.ceil(cssWidth * scale), 4096));
    const contentH = Math.max(1, Math.min(Math.ceil(cssHeight * scale), 4096));

    if (!isValidDimension(contentW) || !isValidDimension(contentH) || contentW < 20 || contentH < 20) {
      console.error('Invalid dimensions received:', {width: cssWidth, height: cssHeight});
      return;
    }

    try {
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
    if (!window || window.isDestroyed()) return;

    const [menuWidth, menuHeight] = window.getContentSize();

    // 1. Determine the initial click point on the screen
    let clickPoint: {x: number; y: number};

    if (this.customContextPosition && this.mainWindow && !this.mainWindow.isDestroyed()) {
      // Use the custom position relative to the main window
      const parentBounds = this.mainWindow.getBounds();
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
