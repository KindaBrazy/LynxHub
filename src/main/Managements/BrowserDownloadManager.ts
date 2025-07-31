import {basename, join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  DownloadItem,
  ipcMain,
  screen,
  Session,
  shell,
  WebContents,
} from 'electron';

import icon from '../../../resources/icon.png?asset';
import {
  browserDownloadChannels,
  DownloadDoneInfo,
  DownloadProgress,
  DownloadStartInfo,
} from '../../cross/DownloadManagerTypes';

export default class BrowserDownloadManager {
  private menuWindow: BrowserWindow;
  private downloadingItems: DownloadItem[];

  private readonly mainWebContents: WebContents;
  private readonly mainWindow: BrowserWindow;
  private readonly dlDirectory: string;

  private DOWNLOAD_MENU_WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    width: 377,
    height: 517,
    frame: false,
    show: false,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };

  constructor(session: Session, mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.mainWebContents = mainWindow.webContents;

    this.downloadingItems = [];
    this.dlDirectory = join(app.getPath('downloads'), 'LynxHub');

    this.menuWindow = new BrowserWindow(this.DOWNLOAD_MENU_WINDOW_CONFIG);
    this.initialWindow();

    session.on('will-download', (_, item) => {
      this.downloadingItems.push(item);
      item.setSavePath(join(this.dlDirectory, item.getFilename()));

      this.notifyRenderer(item);
    });

    this.listenForMainChannels();
  }

  private positionWindow() {
    const [menuWidth, menuHeight] = this.menuWindow.getSize();

    const {x: cursorX, y: cursorY} = screen.getCursorScreenPoint();
    const defaultDisplay = screen.getDisplayNearestPoint({x: cursorX, y: cursorY});
    const defaultWorkArea = defaultDisplay.workArea;
    let newX = cursorX;
    let newY = cursorY;

    if (newX + menuWidth > defaultWorkArea.x + defaultWorkArea.width) {
      newX = defaultWorkArea.x + defaultWorkArea.width - menuWidth - 10;
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
      this.menuWindow.setPosition(Math.floor(newX), Math.floor(newY), true);
    } catch (e) {
      console.error(e);
    }
  }

  private initialWindow() {
    this.menuWindow.setParentWindow(this.mainWindow);

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.menuWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/downloads_menu.html`);
    } else {
      this.menuWindow.loadFile(join(__dirname, `../renderer/downloads_menu.html`));
    }

    this.menuWindow.on('blur', () => this.menuWindow.hide());
  }

  private getItemByName(name: string) {
    return this.downloadingItems.find(item => basename(item.getSavePath()) === name);
  }

  private sendToRenderer(channel: string, ...data: any) {
    if (!this.menuWindow.isDestroyed() && !this.menuWindow.webContents.isDestroyed())
      this.menuWindow.webContents.send(channel, ...data);
  }

  private onDlStart(info: DownloadStartInfo) {
    this.sendToRenderer(browserDownloadChannels.onDlStart, info);
  }

  private onProgress(info: DownloadProgress) {
    this.sendToRenderer(browserDownloadChannels.onProgress, info);
  }

  private onDone(info: DownloadDoneInfo) {
    this.sendToRenderer(browserDownloadChannels.onDone, info);
  }

  private notifyRenderer(item: DownloadItem) {
    const itemName = basename(item.getSavePath());

    this.onDlStart({
      name: itemName,
      startTime: item.getStartTime(),
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
    });

    item.on('done', (_, state) => this.onDone({name: itemName, state}));
    item.on('updated', (_, state) => {
      if (state === 'progressing') {
        const totalBytes = item.getTotalBytes();
        const receivedBytes = item.getReceivedBytes();
        const percent = item.getPercentComplete();
        const bytesPerSecond = item.getCurrentBytesPerSecond();
        const etaSecond = bytesPerSecond > 0 ? Math.floor((totalBytes - receivedBytes) / bytesPerSecond) : 0;

        this.onProgress({name: itemName, totalBytes, receivedBytes, percent, bytesPerSecond, etaSecond});
      }
    });

    this.mainWebContents.send(browserDownloadChannels.mainDownloadCount, this.downloadingItems.length);
  }

  private listenForMainChannels() {
    ipcMain.on(browserDownloadChannels.cancel, (_, name: string) => this.cancelItem(name));
    ipcMain.on(browserDownloadChannels.pause, (_, name: string) => this.pauseItem(name));
    ipcMain.on(browserDownloadChannels.resume, (_, name: string) => this.resumeItem(name));
    ipcMain.on(browserDownloadChannels.openItem, (_, name: string) => this.openItem(name));

    ipcMain.on(browserDownloadChannels.openDownloadsMenu, () => this.openDownloadsMenu());
  }

  private cancelItem(name: string) {
    this.getItemByName(name)?.cancel();
  }

  private pauseItem(name: string) {
    this.getItemByName(name)?.pause();
  }

  private resumeItem(name: string) {
    this.getItemByName(name)?.resume();
  }

  private openItem(name: string) {
    const target = this.getItemByName(name)?.getSavePath();
    if (target) shell.openPath(target);
  }

  private openDownloadsMenu() {
    this.positionWindow();
    this.menuWindow.show();
  }
}
