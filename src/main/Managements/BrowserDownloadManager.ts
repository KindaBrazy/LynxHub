import {basename, join} from 'node:path';

import {app, DownloadItem, Session, WebContents} from 'electron';

import {browserDownloadChannels, DownloadProgress} from '../../cross/DownloadManagerTypes';

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
  }

  private sendToRenderer(channel: string, ...data: any) {
    if (this.webContents && !this.webContents.isDestroyed()) this.webContents.send(channel, ...data);
  }

  private onDlStart(name: string) {
    this.sendToRenderer(browserDownloadChannels.onDlStart, name);
  }

  private onProgress(name: string, progress: DownloadProgress) {
    this.sendToRenderer(browserDownloadChannels.onProgress, name, progress);
  }

  private onDone(name: string, state: string) {
    this.sendToRenderer(browserDownloadChannels.onDone, name, state);
  }

  private notifyRenderer(item: DownloadItem) {
    const itemName = basename(item.getSavePath());

    this.onDlStart(itemName);

    item.on('done', (_, state) => this.onDone(itemName, state));
    item.on('updated', (_, state) => {
      if (state === 'progressing') {
        const totalBytes = item.getTotalBytes();
        const receivedBytes = item.getReceivedBytes();
        const percent = item.getPercentComplete();
        const bytesPerSecond = item.getCurrentBytesPerSecond();
        const etaSecond = bytesPerSecond > 0 ? Math.floor((totalBytes - receivedBytes) / bytesPerSecond) : 0;

        this.onProgress(itemName, {totalBytes, receivedBytes, percent, bytesPerSecond, etaSecond});
      }
    });
  }
}
