import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import appChannels from '@lynx_cross/consts/ipc_channels/application';
import browserChannels from '@lynx_cross/consts/ipc_channels/browser';
import contextMenuChannels from '@lynx_cross/consts/ipc_channels/context_menu';
import {browserDownloadChannels} from '@lynx_cross/consts/ipc_channels/donwload_manager';
import windowDialogsChannels from '@lynx_cross/consts/ipc_channels/window_dialogs';
import {ContextMenuVolumeData} from '@lynx_cross/types/ipc';
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  IpcMainEvent,
  screen,
  shell,
  WebContents,
} from 'electron';

import {ContextResizeData} from '../../cross/types';
import BrowserManager from '../core/browser';
import classHolder from '../core/class_holder';
import AddBreadcrumb_Main from '../utils/breadcrumbs';

export default class ContextMenuManager {
  private contextMenuWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private customContextPosition: {x: number; y: number} | undefined;
  private animationInterval?: NodeJS.Timeout;
  private isHiding = false;
  private webContents: WebContents[] = [];
  private browserChannelsRegistered = false;
  private contextChannelsRegistered = false;

  private dialogEvent?: IpcMainEvent;
  private dialogDefaultResult: boolean | null | string = null;

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

    // Reset browser channels flag so listenForBrowserChannels can re-register with new BrowserManager
    this.browserChannelsRegistered = false;

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

    this.contextMenuWindow.on('closed', () => {
      this.contextMenuWindow = undefined;
      const {browserDownloadManager} = classHolder;
      if (browserDownloadManager) {
        browserDownloadManager.onContextClose();
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

  public sendToRenderer(channel: string, ...data: any) {
    if (
      this.contextMenuWindow &&
      !this.contextMenuWindow.isDestroyed() &&
      !this.contextMenuWindow.webContents.isDestroyed()
    )
      this.contextMenuWindow.webContents.send(channel, ...data);
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
      window.webContents?.send(
        contextMenuChannels.rightClick,
        params,
        {canGoBack: contents.navigationHistory.canGoBack(), canGoForward: contents.navigationHistory.canGoForward()},
        contents.id,
      );
    });
  }

  public listenForBrowserChannels(browserManager: BrowserManager) {
    // Prevent duplicate listener registration
    if (this.browserChannelsRegistered) return;
    this.browserChannelsRegistered = true;

    ipcMain.on(browserChannels.openFindInPage, (_, id: string, customPosition?: {x: number; y: number}) => {
      this.setCustomContextPosition(customPosition);
      this.sendContextMenuMessage(contextMenuChannels.onFind, id);
    });
    ipcMain.on(browserChannels.openZoom, (_, id: string, customPosition?: {x: number; y: number}) => {
      this.setCustomContextPosition(customPosition);
      this.sendContextMenuMessage(contextMenuChannels.onZoom, id, browserManager.getCurrentZoom(id));
    });
    ipcMain.on(
      browserChannels.openVolume,
      (_, data: ContextMenuVolumeData, customPosition?: {x: number; y: number}) => {
        this.setCustomContextPosition(customPosition);
        this.sendContextMenuMessage(contextMenuChannels.onVolume, data);
      },
    );
    ipcMain.on(contextMenuChannels.openTerminateAI, (_, id: string) => {
      this.setCustomContextPosition(undefined);
      this.sendContextMenuMessage(contextMenuChannels.onTerminateAI, id);
    });
    ipcMain.on(contextMenuChannels.openTerminateTab, (_, id: string, customPosition?: {x: number; y: number}) => {
      this.setCustomContextPosition(customPosition);
      this.sendContextMenuMessage(contextMenuChannels.onTerminateTab, id);
    });
    ipcMain.on(contextMenuChannels.openCloseApp, () => {
      this.setCustomContextPosition(undefined);
      this.sendContextMenuMessage(contextMenuChannels.onCloseApp);
    });
    ipcMain.on(browserDownloadChannels.openDownloadsMenu, () => {
      this.setCustomContextPosition(undefined);
      this.sendContextMenuMessage(contextMenuChannels.onDownloads);
    });

    this.listenForDialogWindows();
  }

  private listenForDialogWindows() {
    ipcMain.on(windowDialogsChannels.onPrompt, (event, message: string, defaultValue?: string) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const {width, height} = this.mainWindow.getBounds();
        this.setCustomContextPosition({x: width / 2 - 150, y: height / 2 - 60});
      }

      this.sendContextMenuMessage(windowDialogsChannels.promptShow, message, defaultValue);

      this.dialogEvent = event;
      this.dialogDefaultResult = null;
    });

    ipcMain.on(windowDialogsChannels.onConfirm, (event, message: string) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const {width, height} = this.mainWindow.getBounds();
        this.setCustomContextPosition({x: width / 2 - 150, y: height / 2 - 60});
      }

      this.sendContextMenuMessage(windowDialogsChannels.confirmShow, message);

      this.dialogEvent = event;
      this.dialogDefaultResult = false;
    });

    ipcMain.on(windowDialogsChannels.onAlert, (event, message: string) => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const {width, height} = this.mainWindow.getBounds();
        this.setCustomContextPosition({x: width / 2 - 150, y: height / 2 - 60});
      }

      this.sendContextMenuMessage(windowDialogsChannels.alertShow, message);

      this.dialogEvent = event;
      this.dialogDefaultResult = null;
    });

    ipcMain.on(windowDialogsChannels.promptResult, (_e: any, result: string | null) => {
      if (this.dialogEvent) {
        this.dialogEvent.returnValue = result;
        this.dialogEvent = undefined;
      }
    });

    ipcMain.on(windowDialogsChannels.confirmResult, (_e: any, result: boolean) => {
      if (this.dialogEvent) {
        this.dialogEvent.returnValue = result;
        this.dialogEvent = undefined;
      }
    });
  }

  public listenForContextChannels() {
    // Prevent duplicate listener registration
    if (this.contextChannelsRegistered) return;
    this.contextChannelsRegistered = true;

    ipcMain.on(contextMenuChannels.resizeWindow, (_e, data: ContextResizeData) => this.resizeContextMenu(data));

    ipcMain.on(contextMenuChannels.copy, (_, id: number) => this.getContentById(id)?.copy());
    ipcMain.on(contextMenuChannels.cut, (_, id: number) => this.getContentById(id)?.cut());
    ipcMain.on(contextMenuChannels.paste, (_, id: number) => this.getContentById(id)?.paste());
    ipcMain.on(contextMenuChannels.selectAll, (_, id: number) => this.getContentById(id)?.selectAll());
    ipcMain.on(contextMenuChannels.undo, (_, id: number) => this.getContentById(id)?.undo());
    ipcMain.on(contextMenuChannels.redo, (_, id: number) => this.getContentById(id)?.redo());
    ipcMain.on(contextMenuChannels.openExternal, (_, url: string) => shell.openExternal(url));
    ipcMain.on(contextMenuChannels.downloadImage, (_, id: number, url: string) =>
      this.getContentById(id)?.downloadURL(url),
    );
    ipcMain.on(contextMenuChannels.copyImage, async (_, url: string) => {
      const {appManager} = classHolder;
      try {
        const {net, clipboard, nativeImage} = await import('electron');
        const response = await net.fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const image = nativeImage.createFromBuffer(buffer);
        if (!image.isEmpty()) {
          clipboard.writeImage(image);
          appManager?.showToast('Image copied to clipboard', 'success', 'top-center');
        } else {
          appManager?.showToast('Failed to copy image', 'error', 'top-center');
        }
      } catch (error) {
        console.error('Failed to copy image:', error);
        appManager?.showToast('Failed to copy image', 'error', 'top-center');
      }
    });
    ipcMain.on(contextMenuChannels.searchWithGoogle, (_, text: string) => {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
      this.sendMainMessage(appChannels.onNewTab, searchUrl);
    });
    ipcMain.on(contextMenuChannels.inspectElement, (_, id: number, x: number, y: number) => {
      const webContents = this.getContentById(id);
      if (webContents) {
        webContents.inspectElement(x, y);
      }
    });

    ipcMain.on(contextMenuChannels.showWindow, () => this.showContextMenu());
    ipcMain.on(contextMenuChannels.hideWindow, () => this.hideContextMenu());

    ipcMain.on(contextMenuChannels.replaceMisspelling, (_, id: number, text: string) =>
      this.getContentById(id)?.replaceMisspelling(text),
    );
    ipcMain.on(contextMenuChannels.newTab, (_, url: string) => this.sendMainMessage(appChannels.onNewTab, url));
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

  public hideContextMenu(focusMainWindow: boolean = true) {
    const window = this.contextMenuWindow;

    if (!window || window.isDestroyed() || !window.isVisible() || this.isHiding) {
      return;
    }

    if (this.dialogEvent) {
      this.dialogEvent.returnValue = this.dialogDefaultResult;
      this.dialogEvent = undefined;
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
          this.mainWindow.focus();
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

  private sendContextMenuMessage(channel: string, ...args: any[]) {
    const window = this.contextMenuWindow;
    if (!window || window.isDestroyed()) return;

    const webContents = window.webContents;
    if (!webContents || webContents.isDestroyed()) return;

    webContents.send(channel, ...args);
  }

  private resizeContextMenu(data: ContextResizeData) {
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
