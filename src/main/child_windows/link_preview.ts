import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import {browserChannels} from '@lynx_cross/consts/ipc';
import {BrowserWindow, BrowserWindowConstructorOptions, ipcMain} from 'electron';

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
    resizable: false,
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
    // Close existing link preview window if it exists (e.g., on macOS reactivation)
    if (this.linkPreviewWindow && !this.linkPreviewWindow.isDestroyed()) {
      this.linkPreviewWindow.close();
    }

    // Remove listeners from old mainWindow if it exists
    this.removeMainWindowListeners();

    this.mainWindow = mainWindow;
    this.linkPreviewWindow = new BrowserWindow({
      ...LinkPreviewManager.WINDOW_CONFIG,
      parent: mainWindow,
    });

    // Prevent the window from stealing focus
    this.linkPreviewWindow.setIgnoreMouseEvents(true);

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.linkPreviewWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/link_preview.html`);
    } else {
      this.linkPreviewWindow.loadFile(path.join(__dirname, '../renderer/link_preview.html'));
    }

    // Hide when main window is hidden/minimized/loses focus
    mainWindow.on('hide', this.boundHide);
    mainWindow.on('minimize', this.boundHide);
    mainWindow.on('blur', this.boundHide);
    mainWindow.on('move', this.boundUpdatePosition);
    mainWindow.on('resize', this.boundUpdatePosition);

    this.linkPreviewWindow.on('closed', () => {
      this.linkPreviewWindow = undefined;
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
      }
    });

    mainWindow.on('close', () => {
      // Remove listeners before clearing reference
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

    ipcMain.on(browserChannels.resizeLinkPreview, (_, width: number) => {
      this.resizeWindow(width);
    });
  }

  public updateUrl(url: string) {
    if (url) {
      this.show(url);
    } else {
      this.hide();
    }
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
    this.linkPreviewWindow.webContents.send(browserChannels.onLinkHover, url);

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

    this.linkPreviewWindow.setPosition(Math.floor(x), Math.floor(y));
  }

  public resizeWindow(width: number) {
    if (!this.linkPreviewWindow || this.linkPreviewWindow.isDestroyed()) return;
    // Clamp width to reasonable bounds
    const clampedWidth = Math.min(Math.max(width, 100), 800);
    this.linkPreviewWindow.setSize(clampedWidth, 24);
    this.updatePosition();
  }

  public getWindow() {
    return this.linkPreviewWindow;
  }
}
