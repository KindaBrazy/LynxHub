import {existsSync} from 'node:fs';
import {basename, join, parse} from 'node:path';

import {sanitizeFilename} from '@lynx_common/utils/fileUtils';
import listenDownloadManager, {downloadManagerIpc} from '@lynx_main/ipc/downloadManager';
import classHolder from '@lynx_main/managers/classHolder';
import {
  ensureDirectoryExists,
  handleFileSystemError,
  validatePath,
  validateWritableDirectory,
} from '@lynx_main/utils/fileSystem';
import {app, BrowserWindow, dialog, DownloadItem, Session, shell} from 'electron';

export default class BrowserDownloadManager {
  private downloadingItems: DownloadItem[] = [];
  private readonly mainWindow: BrowserWindow;

  // Map to track download identifiers (URL + filename) for persistence
  private downloadIdentifiers = new Map<string, string>();

  // Cache for filename existence checks to improve performance
  private fileExistsCache = new Map<string, boolean>();
  private cacheExpirationTime = 5000; // 5 seconds
  private cacheTimestamps = new Map<string, number>();

  constructor(session: Session, mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupWindowListeners();
    this.setupDownloadListener(session);
    listenDownloadManager();
  }

  private setupWindowListeners() {
    this.mainWindow.on('close', () => {
      this.cleanupAllItems();
    });
  }

  private setupDownloadListener(session: Session) {
    session.on('will-download', (_, item) => {
      const url = item.getURL();
      const filename = item.getFilename();
      const identifier = this.generateDownloadIdentifier(url, filename);
      const behavior = this.getDownloadBehavior();

      // Check if this download was previously cleared
      if (this.isDownloadCleared(identifier)) {
        this.unmarkDownloadAsCleared(identifier);
      }

      // Ask behavior: Let Electron show default save dialog, wait for user selection
    if (behavior === 'ask') {
      this.handleAskBehavior(item, url);
    } else {
      // Default behavior: Save to default location automatically
      this.handleDefaultBehavior(item, url, filename);
    }
    });
  }

  private handleAskBehavior(item: DownloadItem, url: string) {
    let hasNotified = false;

    const notify = () => {
      const savePath = item.getSavePath();
      if (savePath && !hasNotified) {
        hasNotified = true;
        this.downloadingItems.push(item);
        const actualFilename = basename(savePath);
        const actualIdentifier = this.generateDownloadIdentifier(url, actualFilename);
        this.downloadIdentifiers.set(actualFilename, actualIdentifier);
        this.notifyRenderer(item);
      }
    };

    item.on('updated', notify);

    // Some downloads complete immediately or are cancelled before 'updated' fires
    item.once('done', (_, state) => {
      if (!hasNotified && state !== 'cancelled') {
        notify();
      }
    });
  }

  private handleDefaultBehavior(item: DownloadItem, url: string, filename: string) {
    const downloadDir = this.getDownloadLocation();

    // Ensure download directory exists
    if (!ensureDirectoryExists(downloadDir)) {
      console.error('Failed to create download directory:', downloadDir);
      item.cancel();
      return;
    }

    const uniqueFilename = this.resolveUniqueFilename(downloadDir, filename);
    const savePath = join(downloadDir, uniqueFilename);

    item.setSavePath(savePath);
    this.downloadingItems.push(item);

    const actualIdentifier = this.generateDownloadIdentifier(url, uniqueFilename);
    this.downloadIdentifiers.set(uniqueFilename, actualIdentifier);

    this.notifyRenderer(item);
  }

  /**
   * Generates a unique identifier for a download based on URL and filename
   */
  private generateDownloadIdentifier(url: string, filename: string): string {
    return `${url}::${filename}`;
  }

  private isDownloadCleared(identifier: string): boolean {
    const {storageManager} = classHolder;
    const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];
    return clearedDownloads.includes(identifier);
  }

  private markDownloadAsCleared(identifier: string): void {
    const {storageManager} = classHolder;
    try {
      const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];
      if (!clearedDownloads.includes(identifier)) {
        storageManager.updateData('browser', {clearedDownloads: [...clearedDownloads, identifier]});
      }
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error('Failed to mark download as cleared:', fsError.userMessage);
    }
  }

  private unmarkDownloadAsCleared(identifier: string): void {
    const {storageManager} = classHolder;
    try {
      const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];
      const updatedClearedDownloads = clearedDownloads.filter(id => id !== identifier);
      storageManager.updateData('browser', {clearedDownloads: updatedClearedDownloads});
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error('Failed to unmark download as cleared:', fsError.userMessage);
    }
  }

  /**
   * Checks if a file exists, using cache for performance
   */
  private cachedFileExists(filePath: string): boolean {
    const now = Date.now();
    const cachedTimestamp = this.cacheTimestamps.get(filePath);

    if (cachedTimestamp && now - cachedTimestamp < this.cacheExpirationTime) {
      const cachedValue = this.fileExistsCache.get(filePath);
      if (cachedValue !== undefined) {
        return cachedValue;
      }
    }

    const exists = existsSync(filePath);
    this.fileExistsCache.set(filePath, exists);
    this.cacheTimestamps.set(filePath, now);

    return exists;
  }

  private clearFilenameCache(): void {
    this.fileExistsCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Resolves a unique filename by appending a counter if the file already exists.
   */
  private resolveUniqueFilename(directory: string, filename: string): string {
    try {
      filename = sanitizeFilename(filename);
      const parsed = parse(filename);
      const {name, ext} = parsed;

      if (!this.cachedFileExists(join(directory, filename))) {
        return filename;
      }

      return this.findUniqueFilenameWithCounter(directory, name, ext);
    } catch (error: any) {
      return this.generateTimestampFilename(filename, error);
    }
  }

  private findUniqueFilenameWithCounter(directory: string, name: string, ext: string): string {
    const MAX_ATTEMPTS = 10000;
    let counter = 1;

    while (counter <= MAX_ATTEMPTS) {
      const uniqueFilename = `${name} (${counter})${ext}`;
      const resolvedPath = join(directory, uniqueFilename);

      if (!this.cachedFileExists(resolvedPath)) {
        return uniqueFilename;
      }
      counter++;
    }

    return `${name}_${Date.now()}${ext}`;
  }

  /**
   * Generates a timestamp-based filename as fallback
   */
  private generateTimestampFilename(filename: string, error?: any): string {
    if (error) {
      const fsError = handleFileSystemError(error);
      console.error('Error resolving unique filename:', fsError.userMessage);
    }
    const parsed = parse(filename);
    return `${parsed.name}_${Date.now()}${parsed.ext}`;
  }

  /**
   * Cleans up all active downloads and listeners.
   * Called on window close or context destruction.
   */
  private cleanupAllItems() {
    this.downloadingItems.forEach(item => {
      try {
        item.removeAllListeners();
      } catch (error) {
        console.error('Error cleaning up download item:', error);
      }
    });
    this.downloadingItems = [];
    this.downloadIdentifiers.clear();
    this.clearFilenameCache();
  }

  public onContextClose() {
    this.cleanupAllItems();
  }

  private getItemByName(name: string) {
    return this.downloadingItems.find(item => basename(item.getSavePath()) === name);
  }

  private notifyRenderer(item: DownloadItem) {
    const itemName = basename(item.getSavePath());

    downloadManagerIpc.send.onDlStart({
      name: itemName,
      startTime: item.getStartTime(),
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
    });

    item.on('done', (_, state) => {
      downloadManagerIpc.send.onDone({name: itemName, state});
      this.clearFilenameCache();
    });

    item.on('updated', (_, state) => {
      if (state === 'progressing') {
        const totalBytes = item.getTotalBytes();
        const receivedBytes = item.getReceivedBytes();
        const percent = item.getPercentComplete();
        const bytesPerSecond = item.getCurrentBytesPerSecond();
        const etaSecond = bytesPerSecond > 0 ? Math.floor((totalBytes - receivedBytes) / bytesPerSecond) : 0;

        downloadManagerIpc.send.onProgress({
          name: itemName,
          totalBytes,
          receivedBytes,
          percent,
          bytesPerSecond,
          etaSecond,
        });
      }
    });

    downloadManagerIpc.send.dlCount(this.downloadingItems.length);
  }

  public getDownloadLocation(): string {
    const {storageManager} = classHolder;
    const location = storageManager.getData('browser').downloadLocation;
    return location || join(app.getPath('downloads'), 'LynxHub');
  }

  public setDownloadLocation(path: string): {success: boolean; error?: string} {
    const {storageManager} = classHolder;
    try {
      const pathValidation = validatePath(path);
      if (!pathValidation.success) {
        return {success: false, error: pathValidation.error};
      }

      const dirValidation = validateWritableDirectory(path);
      if (!dirValidation.success) {
        return {success: false, error: dirValidation.error};
      }

      storageManager.updateData('browser', {downloadLocation: path});
      return {success: true};
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error('Failed to set download location:', fsError.userMessage);
      return {success: false, error: fsError.userMessage};
    }
  }

  public async openLocationDialog(): Promise<string | null> {
    try {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        title: 'Select Download Location',
        defaultPath: this.getDownloadLocation(),
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      return result.filePaths[0];
    } catch (error) {
      console.error('Failed to open location dialog:', error);
      return null;
    }
  }

  public getDownloadBehavior(): 'ask' | 'default' {
    const {storageManager} = classHolder;
    return storageManager.getData('browser').downloadBehavior || 'default';
  }

  public setDownloadBehavior(behavior: 'ask' | 'default'): void {
    const {storageManager} = classHolder;
    storageManager.updateData('browser', {downloadBehavior: behavior});
  }

  private handleDownloadItemOperation(
    name: string,
    operation: 'cancel' | 'pause' | 'resume',
    checkCondition: (item: DownloadItem) => boolean,
    action: (item: DownloadItem) => void,
  ): void {
    try {
      const item = this.getItemByName(name);
      if (item && checkCondition(item)) {
        action(item);
      }
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error(`Failed to ${operation} download ${name}:`, fsError.userMessage);
    }
  }

  public cancelItem(name: string) {
    this.handleDownloadItemOperation(
      name,
      'cancel',
      item => !item.getState || item.getState() !== 'cancelled',
      item => item.cancel(),
    );
  }

  public pauseItem(name: string) {
    this.handleDownloadItemOperation(
      name,
      'pause',
      item => !item.isPaused(),
      item => item.pause(),
    );
  }

  public resumeItem(name: string) {
    this.handleDownloadItemOperation(
      name,
      'resume',
      item => item.canResume(),
      item => item.resume(),
    );
  }

  /**
   * Clears a download item from the list by name.
   * Handles all download states (completed, cancelled, interrupted, downloading, paused).
   * Updates the download count notification to main window.
   * Hides the download menu window when the list becomes empty.
   * Marks the download as cleared in storage to prevent reappearance on restart.
   *
   * @param name - The filename of the download item to clear
   */
  public clearItem(name: string) {
    try {
      const itemToRemove = this.getItemByName(name);

      if (itemToRemove) {
        try {
          this.cancelItem(name);
          itemToRemove.removeAllListeners();
        } catch (error: any) {
          const fsError = handleFileSystemError(error);
          console.error(`Error cleaning up download item ${name}:`, fsError.userMessage);
        }
      }

      const identifier = this.downloadIdentifiers.get(name);
      if (identifier) {
        this.markDownloadAsCleared(identifier);
        this.downloadIdentifiers.delete(name);
      }

      this.downloadingItems = this.downloadingItems.filter(item => basename(item.getSavePath()) !== name);
      downloadManagerIpc.send.dlCount(this.downloadingItems.length);

      if (this.downloadingItems.length === 0) {
        this.hideContextMenu();
      }
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error(`Failed to clear download item ${name}:`, fsError.userMessage);
    }
  }

  /**
   * Clears all download items from the list.
   * Cancels any active or paused downloads before clearing.
   * Sends count update to main window and hides the download menu window.
   * Marks all downloads as cleared in storage to prevent reappearance on restart.
   */
  public clearAllItems() {
    try {
      this.downloadingItems.forEach(item => {
        try {
          this.cancelItem(basename(item.getSavePath()));
          item.removeAllListeners();
          const name = basename(item.getSavePath());
          const identifier = this.downloadIdentifiers.get(name);
          if (identifier) {
            this.markDownloadAsCleared(identifier);
          }
        } catch (error: any) {
          const fsError = handleFileSystemError(error);
          console.error(`Error cleaning up download item:`, fsError.userMessage);
        }
      });

      this.downloadingItems = [];
      this.downloadIdentifiers.clear();
      downloadManagerIpc.send.dlCount(0);
      this.hideContextMenu();
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error('Failed to clear all downloads:', fsError.userMessage);
    }
  }

  private hideContextMenu() {
    const contextMenuManager = classHolder.contextMenuManager;
    if (contextMenuManager) {
      contextMenuManager.hideContextMenu();
    } else {
      classHolder.waitForClass('contextMenuManager').then(contextMenuManager => {
        contextMenuManager.hideContextMenu();
      });
    }
  }

  public openItem(name: string, action: 'open' | 'openFolder') {
    try {
      const savePath = this.getItemByName(name)?.getSavePath();
      if (savePath) {
        if (action === 'open') {
          shell.openPath(savePath).catch((error: any) => {
            const fsError = handleFileSystemError(error);
            console.error(`Failed to open file ${savePath}:`, fsError.userMessage);
            dialog.showErrorBox('Open File Error', `Failed to open file: ${fsError.userMessage}`);
          });
        } else {
          shell.showItemInFolder(savePath);
        }
      }
    } catch (error: any) {
      const fsError = handleFileSystemError(error);
      console.error(`Failed to ${action} item ${name}:`, fsError.userMessage);
      dialog.showErrorBox('File Operation Error', `Failed to ${action} file: ${fsError.userMessage}`);
    }
  }
}
