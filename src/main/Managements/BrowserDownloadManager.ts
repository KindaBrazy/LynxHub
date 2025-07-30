import {basename, join} from 'node:path';

import {app, DownloadItem, ipcMain, Session, WebContents} from 'electron';

import {
  browserDownloadChannels,
  DownloadDoneInfo,
  DownloadProgress,
  DownloadStartInfo,
} from '../../cross/DownloadManagerTypes';

export default class BrowserDownloadManager {
  private downloadingItems: DownloadItem[];
  private readonly webContents: WebContents;
  private readonly dlDirectory: string;

  constructor(session: Session, webContents: WebContents) {
    this.webContents = webContents;
    this.downloadingItems = [];
    this.dlDirectory = join(app.getPath('downloads'), 'LynxHub');

    session.on('will-download', (_, item) => {
      this.downloadingItems.push(item);
      item.setSavePath(join(this.dlDirectory, item.getFilename()));

      this.notifyRenderer(item);
    });

    this.listenForMainChannels();
  }

  private getItemByName(name: string) {
    return this.downloadingItems.find(item => basename(item.getSavePath()) === name);
  }

  private sendToRenderer(channel: string, ...data: any) {
    if (this.webContents && !this.webContents.isDestroyed()) this.webContents.send(channel, ...data);
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
  }

  private listenForMainChannels() {
    ipcMain.on(browserDownloadChannels.cancel, (_, name: string) => this.cancelItem(name));
    ipcMain.on(browserDownloadChannels.pause, (_, name: string) => this.pauseItem(name));
    ipcMain.on(browserDownloadChannels.resume, (_, name: string) => this.resumeItem(name));
  }

  public cancelItem(name: string) {
    this.getItemByName(name)?.cancel();
  }

  public pauseItem(name: string) {
    this.getItemByName(name)?.pause();
  }

  public resumeItem(name: string) {
    this.getItemByName(name)?.resume();
  }
}
