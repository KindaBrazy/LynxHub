import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {isWin} from '@lynx_common/utils';
import {browserIpc} from '@lynx_main/ipc/browser';
import lynxIpc from '@lynx_main/ipc/ipcWrapper';
import {BrowserWindow, BrowserWindowConstructorOptions, WebContents} from 'electron';

export default class LinkPreviewManager {
  private linkPreviewWindow?: BrowserWindow;
  private mainWindow?: BrowserWindow;
  private hideTimeout?: NodeJS.Timeout;
  private channelsRegistered = false;

  // Store bound handlers for cleanup
  private boundHide = () => this.hide();
  private boundUpdatePosition = () => this.updatePosition();

  private static readonly WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 400,
    height: 24,
    minWidth: 0,
    minHeight: 0,
    resizable: isWin,
    maximizable: false,
    minimizable: false,
    skipTaskbar: true,
    focusable: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  public createWindow(mainWindow: BrowserWindow) {
    if (this.linkPreviewWindow && !this.linkPreviewWindow.isDestroyed()) {
      this.linkPreviewWindow.close();
    }

    this.removeMainWindowListeners();

    this.mainWindow = mainWindow;
    this.linkPreviewWindow = new BrowserWindow({
      ...LinkPreviewManager.WINDOW_CONFIG,
      parent: mainWindow,
    });

    // Prevent the window from stealing focus
    this.linkPreviewWindow.setIgnoreMouseEvents(true);

    this.loadWindowContent();
    this.setupWindowListeners();
  }

  private loadWindowContent() {
    if (!this.linkPreviewWindow) return;

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.linkPreviewWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/linkPreview.html`);
    } else {
      this.linkPreviewWindow.loadFile(path.join(__dirname, '../renderer/linkPreview.html'));
    }
  }

  private setupWindowListeners() {
    if (!this.mainWindow || !this.linkPreviewWindow) return;

    // Hide when main window is hidden/minimized/loses focus
    this.mainWindow.on('hide', this.boundHide);
    this.mainWindow.on('minimize', this.boundHide);
    this.mainWindow.on('blur', this.boundHide);
    this.mainWindow.on('move', this.boundUpdatePosition);
    this.mainWindow.on('resize', this.boundUpdatePosition);

    this.linkPreviewWindow.on('closed', () => {
      this.linkPreviewWindow = undefined;
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
      }
    });

    this.mainWindow.on('close', () => {
      this.removeMainWindowListeners();
      this.mainWindow = undefined;
    });
  }

  private removeMainWindowListeners() {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    this.mainWindow.off('hide', this.boundHide);
    this.mainWindow.off('minimize', this.boundHide);
    this.mainWindow.off('blur', this.boundHide);
    this.mainWindow.off('move', this.boundUpdatePosition);
    this.mainWindow.off('resize', this.boundUpdatePosition);
  }

  public listenForChannels() {
    // Prevent duplicate listener registration
    if (this.channelsRegistered) return;
    this.channelsRegistered = true;

    browserIpc.on.resizeLinkPreview(width => this.resizeWindow(width));
  }

  public updateUrl(url: string) {
    if (url) {
      this.show(url);
    } else {
      this.hide();
    }
  }

  public getWindow(): BrowserWindow | undefined {
    if (this.linkPreviewWindow?.isDestroyed()) {
      this.linkPreviewWindow = undefined;
    }
    return this.linkPreviewWindow;
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

  private show(url: string) {
    if (!this.linkPreviewWindow || this.linkPreviewWindow.isDestroyed()) return;
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    // Send URL to the preview window
    browserIpc.send.onLinkHover(url);

    // Update position and show
    this.updatePosition();

    if (!this.linkPreviewWindow.isVisible()) {
      this.linkPreviewWindow.showInactive();
    }
  }

  private hide() {
    if (!this.linkPreviewWindow || this.linkPreviewWindow.isDestroyed()) return;

    // Small delay to prevent flickering when moving between links
    this.hideTimeout = setTimeout(() => {
      if (this.linkPreviewWindow && !this.linkPreviewWindow.isDestroyed()) {
        this.linkPreviewWindow.hide();
      }
    }, 50);
  }

  private updatePosition() {
    if (!this.linkPreviewWindow || this.linkPreviewWindow.isDestroyed()) return;
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    const mainBounds = this.mainWindow.getBounds();

    // Position at bottom-left of main window
    const x = mainBounds.x + 4;
    const y = mainBounds.y + mainBounds.height - 23;

    try {
      this.linkPreviewWindow.setPosition(Math.floor(x), Math.floor(y));
    } catch (e) {
      // Ignore errors if window is destroyed during update
    }
  }

  /**
   * Resizes the link preview window width.
   * Clamps width between 100px and 800px.
   */
  public resizeWindow(width: number) {
    if (!this.linkPreviewWindow || this.linkPreviewWindow.isDestroyed()) return;

    const clampedWidth = Math.min(Math.max(width, 100), 800);
    this.linkPreviewWindow.setSize(clampedWidth, 24);
    this.updatePosition();
  }
}
