import {accessSync, constants as fsConstants, existsSync, mkdirSync} from 'node:fs';
import {basename, join, parse} from 'node:path';

import {app, BrowserWindow, dialog, DownloadItem, Session, shell} from 'electron';

import classHolder from '../core/class_holder';
import listenDownloadManager, {downloadManagerIpc} from '../ipc/download_manager';

/**
 * Error types for file system operations
 */
type FileSystemError = {
  code: string;
  message: string;
  userMessage: string;
};

/**
 * Maps Node.js error codes to user-friendly messages
 */
const FILE_SYSTEM_ERROR_MESSAGES: Record<string, string> = {
  EACCES: 'Permission denied. Please check folder permissions.',
  EPERM: 'Operation not permitted. Please run with appropriate permissions.',
  ENOSPC: 'Not enough disk space available.',
  ENOENT: 'Path does not exist.',
  ENOTDIR: 'Path is not a directory.',
  EISDIR: 'Path is a directory, not a file.',
  EMFILE: 'Too many open files.',
  ENAMETOOLONG: 'Path name is too long.',
  EROFS: 'File system is read-only.',
  EEXIST: 'File or directory already exists.',
};

export default class BrowserDownloadManager {
  private downloadingItems: DownloadItem[];

  private readonly mainWindow: BrowserWindow;

  // Map to track download identifiers (URL + filename) for persistence
  private downloadIdentifiers: Map<string, string>;

  // Cache for filename existence checks to improve performance
  private filenameExistenceCache: Map<string, boolean>;
  private cacheExpirationTime: number = 5000; // 5 seconds
  private cacheTimestamps: Map<string, number>;

  constructor(session: Session, mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;

    this.downloadingItems = [];
    this.downloadIdentifiers = new Map();
    this.filenameExistenceCache = new Map();
    this.cacheTimestamps = new Map();

    this.initialWindow();

    session.on('will-download', (_, item) => {
      const url = item.getURL();
      const filename = item.getFilename();
      const identifier = this.generateDownloadIdentifier(url, filename);
      const behavior = this.getDownloadBehavior();

      // Check if this download was previously cleared
      // If so, remove it from the cleared list (user is re-downloading)
      if (this.isDownloadCleared(identifier)) {
        this.unmarkDownloadAsCleared(identifier);
      }

      if (behavior === 'ask') {
        // For "ask" behavior, don't set save path - let Electron show its default save dialog
        // Wait for the 'updated' event which fires after user selects location
        let hasNotified = false;

        item.on('updated', () => {
          // Once save path is set (user selected location), notify renderer
          const savePath = item.getSavePath();
          if (savePath && !hasNotified) {
            hasNotified = true;
            this.downloadingItems.push(item);
            const actualFilename = basename(savePath);
            const actualIdentifier = this.generateDownloadIdentifier(url, actualFilename);
            this.downloadIdentifiers.set(actualFilename, actualIdentifier);
            this.notifyRenderer(item);
          }
        });

        item.once('done', (_, state) => {
          // Handle case where download completes very quickly or is cancelled before 'updated' fires
          if (!hasNotified && state === 'cancelled') {
            // User cancelled the save dialog, nothing to do
            return;
          }
          if (!hasNotified) {
            const savePath = item.getSavePath();
            if (savePath) {
              hasNotified = true;
              this.downloadingItems.push(item);
              const actualFilename = basename(savePath);
              const actualIdentifier = this.generateDownloadIdentifier(url, actualFilename);
              this.downloadIdentifiers.set(actualFilename, actualIdentifier);
              this.notifyRenderer(item);
            }
          }
        });
      } else {
        // For "default" behavior, set save path synchronously to prevent default dialog
        const downloadDir = this.getDownloadLocation();

        // Ensure download directory exists
        if (!this.ensureDirectoryExists(downloadDir)) {
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
    });

    listenDownloadManager();
  }

  /**
   * Generates a unique identifier for a download based on URL and filename
   * This identifier is used to track cleared downloads across sessions
   * @param url - The download URL
   * @param filename - The filename
   * @returns A unique identifier string
   */
  private generateDownloadIdentifier(url: string, filename: string): string {
    // Create a stable identifier from URL and filename
    // We use a simple concatenation with a separator that's unlikely to appear in URLs
    return `${url}::${filename}`;
  }

  /**
   * Checks if a download was previously cleared by the user
   * @param identifier - The download identifier
   * @returns True if the download was cleared, false otherwise
   */
  private isDownloadCleared(identifier: string): boolean {
    const {storageManager} = classHolder;
    const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];
    return clearedDownloads.includes(identifier);
  }

  /**
   * Marks a download as cleared in storage to prevent reappearance
   * @param identifier - The download identifier to mark as cleared
   */
  private markDownloadAsCleared(identifier: string): void {
    const {storageManager} = classHolder;
    try {
      const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];

      // Only add if not already present
      if (!clearedDownloads.includes(identifier)) {
        const updatedClearedDownloads = [...clearedDownloads, identifier];
        storageManager.updateData('browser', {clearedDownloads: updatedClearedDownloads});
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error('Failed to mark download as cleared:', fsError.userMessage);
    }
  }

  /**
   * Removes a download identifier from the cleared list
   * This is useful if a user re-downloads the same file
   * @param identifier - The download identifier to unmark
   */
  private unmarkDownloadAsCleared(identifier: string): void {
    const {storageManager} = classHolder;
    try {
      const clearedDownloads = storageManager.getData('browser').clearedDownloads || [];
      const updatedClearedDownloads = clearedDownloads.filter(id => id !== identifier);
      storageManager.updateData('browser', {clearedDownloads: updatedClearedDownloads});
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error('Failed to unmark download as cleared:', fsError.userMessage);
    }
  }

  /**
   * Converts a Node.js error to a FileSystemError with user-friendly message
   * @param error - The error object
   * @returns FileSystemError with code, technical message, and user-friendly message
   */
  public handleFileSystemError(error: any): FileSystemError {
    const code = error.code || 'UNKNOWN';
    const message = error.message || 'Unknown error occurred';
    const userMessage = FILE_SYSTEM_ERROR_MESSAGES[code] || 'An unexpected error occurred with the file system.';

    console.error(`File system error [${code}]:`, message);

    return {
      code,
      message,
      userMessage,
    };
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * @param dirPath - The directory path to ensure exists
   * @returns True if successful, false otherwise
   */
  private ensureDirectoryExists(dirPath: string): boolean {
    try {
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, {recursive: true});
        console.log(`Created directory: ${dirPath}`);
      }
      return true;
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`Failed to create directory ${dirPath}:`, fsError.userMessage);
      return false;
    }
  }

  /**
   * Checks if a path has write permissions
   * @param path - The path to check
   * @returns True if writable, false otherwise
   */
  private hasWritePermission(path: string): boolean {
    try {
      accessSync(path, fsConstants.W_OK);
      return true;
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`No write permission for ${path}:`, fsError.userMessage);
      return false;
    }
  }

  /**
   * Validates that a directory path is writable
   * @param dirPath - The directory path to validate
   * @returns Object with success status and optional error message
   */
  private validateWritableDirectory(dirPath: string): {success: boolean; error?: string} {
    try {
      // Ensure directory exists
      if (!this.ensureDirectoryExists(dirPath)) {
        return {success: false, error: 'Failed to create directory'};
      }

      // Check write permissions
      if (!this.hasWritePermission(dirPath)) {
        return {success: false, error: 'No write permission for directory'};
      }

      return {success: true};
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      return {success: false, error: fsError.userMessage};
    }
  }

  /**
   * Checks if a file exists, using cache for performance
   * @param filePath - The full path to check
   * @returns True if file exists, false otherwise
   */
  private cachedFileExists(filePath: string): boolean {
    const now = Date.now();
    const cachedTimestamp = this.cacheTimestamps.get(filePath);

    // Check if cache is valid (not expired)
    if (cachedTimestamp && now - cachedTimestamp < this.cacheExpirationTime) {
      const cachedValue = this.filenameExistenceCache.get(filePath);
      if (cachedValue !== undefined) {
        return cachedValue;
      }
    }

    // Cache miss or expired - check file system
    const exists = existsSync(filePath);
    this.filenameExistenceCache.set(filePath, exists);
    this.cacheTimestamps.set(filePath, now);

    return exists;
  }

  /**
   * Clears the filename existence cache
   * Called after downloads complete to ensure fresh checks
   */
  private clearFilenameCache(): void {
    this.filenameExistenceCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Resolves a unique filename by appending a counter if the file already exists.
   * Implements the pattern: "filename (N).ext" where N is an incrementing counter.
   * Uses caching to improve performance for rapid duplicate checks.
   *
   * @param directory - The directory where the file will be saved
   * @param filename - The original filename
   * @returns The resolved unique filename (not the full path)
   */
  private resolveUniqueFilename(directory: string, filename: string): string {
    try {
      // Sanitize the filename first to prevent path traversal and invalid characters
      filename = this.sanitizeFilename(filename);

      // Parse the filename to separate name and extension
      const parsed = parse(filename);
      const name = parsed.name;
      const ext = parsed.ext;

      // Handle edge case: filename with no extension
      if (!ext && name.includes('.')) {
        // If there's a dot but no extension detected, treat the whole thing as name
        // This handles cases like ".gitignore" or "file."
      }

      // Check if the original filename exists (using cache)
      let resolvedPath = join(directory, filename);
      if (!this.cachedFileExists(resolvedPath)) {
        return filename;
      }

      // File exists, start incrementing counter
      let counter = 1;
      let uniqueFilename: string;

      do {
        // Create filename with counter: "filename (N).ext"
        uniqueFilename = `${name} (${counter})${ext}`;
        resolvedPath = join(directory, uniqueFilename);
        counter++;

        // Safety check to prevent infinite loops (though unlikely)
        if (counter > 10000) {
          // Fallback to timestamp-based naming
          uniqueFilename = `${name}_${Date.now()}${ext}`;
          break;
        }
      } while (this.cachedFileExists(resolvedPath));

      return uniqueFilename;
    } catch (error: any) {
      // If any error occurs during filename resolution, fallback to timestamp-based naming
      const fsError = this.handleFileSystemError(error);
      console.error('Error resolving unique filename:', fsError.userMessage);
      const parsed = parse(filename);
      return `${parsed.name}_${Date.now()}${parsed.ext}`;
    }
  }

  private initialWindow() {
    this.mainWindow.on('close', () => {
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
    });
  }

  public onContextClose() {
    this.downloadingItems = [];
    this.downloadIdentifiers.clear();
    this.clearFilenameCache();
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
      // Clear filename cache when download completes to ensure fresh checks for next download
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

  /**
   * Gets the download location from storage with default fallback
   * @returns The download directory path
   */
  public getDownloadLocation(): string {
    const {storageManager} = classHolder;
    const location = storageManager.getData('browser').downloadLocation;
    // Fallback to default if not set
    return location || join(app.getPath('downloads'), 'LynxHub');
  }

  /**
   * Sets the download location in storage with path validation
   * @param path - The new download directory path
   * @returns Object with success status and optional error message
   */
  public setDownloadLocation(path: string): {success: boolean; error?: string} {
    const {storageManager} = classHolder;
    try {
      // Validate path
      const pathValidation = this.validatePath(path);
      if (!pathValidation.success) {
        return {success: false, error: pathValidation.error};
      }

      // Validate directory is writable
      const dirValidation = this.validateWritableDirectory(path);
      if (!dirValidation.success) {
        return {success: false, error: dirValidation.error};
      }

      storageManager.updateData('browser', {downloadLocation: path});
      return {success: true};
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error('Failed to set download location:', fsError.userMessage);
      return {success: false, error: fsError.userMessage};
    }
  }

  /**
   * Opens a directory selection dialog for choosing download location
   * @returns The selected path or null if cancelled
   */
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

  /**
   * Gets the download behavior setting from storage
   * @returns The download behavior ('ask' or 'default')
   */
  public getDownloadBehavior(): 'ask' | 'default' {
    const {storageManager} = classHolder;
    return storageManager.getData('browser').downloadBehavior || 'default';
  }

  /**
   * Sets the download behavior in storage
   * @param behavior - The download behavior to set
   */
  public setDownloadBehavior(behavior: 'ask' | 'default'): void {
    const {storageManager} = classHolder;
    storageManager.updateData('browser', {downloadBehavior: behavior});
  }

  /**
   * Sanitizes a filename to prevent path traversal and invalid characters
   * @param filename - The filename to sanitize
   * @returns Sanitized filename safe for file system operations
   */
  private sanitizeFilename(filename: string): string {
    if (!filename || filename.trim() === '') {
      return 'download';
    }

    // Remove path separators and parent directory references
    let sanitized = filename.replace(/[/\\]/g, '_').replace(/\.\./g, '_');

    // Remove invalid characters based on OS
    if (process.platform === 'win32') {
      // Windows invalid characters: < > : " / \ | ? *
      sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
      // Remove trailing dots and spaces (Windows doesn't allow these)
      sanitized = sanitized.replace(/[\s.]+$/, '');
    } else {
      // Unix-like systems: only null character is invalid
      sanitized = sanitized.replace(/\0/g, '_');
    }

    // Ensure filename is not empty after sanitization
    if (sanitized.trim() === '') {
      return 'download';
    }

    // Limit filename length (leaving room for counter suffix)
    const maxLength = 200;
    if (sanitized.length > maxLength) {
      const parsed = parse(sanitized);
      const ext = parsed.ext;
      const name = parsed.name.substring(0, maxLength - ext.length);
      sanitized = name + ext;
    }

    return sanitized;
  }

  /**
   * Validates a file system path
   * @param path - The path to validate
   * @returns Object with success status and optional error message
   */
  private validatePath(path: string): {success: boolean; error?: string} {
    try {
      // Check for empty path
      if (!path || path.trim() === '') {
        return {success: false, error: 'Path cannot be empty'};
      }

      // Check for invalid characters (OS-specific)
      // Windows: < > : " | ? * (but NOT parentheses, which are valid)
      // Note: We don't check for / and \ as they are path separators
      const invalidChars = process.platform === 'win32' ? /[<>"|?*]/ : /\0/;
      if (invalidChars.test(path)) {
        return {success: false, error: 'Path contains invalid characters'};
      }

      // Check path length limits (OS-specific)
      const maxPathLength = process.platform === 'win32' ? 260 : 4096;
      if (path.length > maxPathLength) {
        return {success: false, error: `Path is too long (max ${maxPathLength} characters)`};
      }

      // Check if path exists
      if (existsSync(path)) {
        return {success: true};
      }

      // Path doesn't exist - this is okay, we can create it later
      return {success: true};
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error('Path validation error:', fsError.userMessage);
      return {success: false, error: fsError.userMessage};
    }
  }

  public cancelItem(name: string) {
    try {
      const item = this.getItemByName(name);
      if (item && (!item.getState || item.getState() !== 'cancelled')) {
        item.cancel();
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`Failed to cancel download ${name}:`, fsError.userMessage);
    }
  }

  public pauseItem(name: string) {
    try {
      const item = this.getItemByName(name);
      if (item && !item.isPaused()) {
        item.pause();
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`Failed to pause download ${name}:`, fsError.userMessage);
    }
  }

  public resumeItem(name: string) {
    try {
      const item = this.getItemByName(name);
      if (item && item.canResume()) {
        item.resume();
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`Failed to resume download ${name}:`, fsError.userMessage);
    }
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
      // Find the item to clear
      const itemToRemove = this.getItemByName(name);

      if (itemToRemove) {
        try {
          this.cancelItem(name);
          // Remove all event listeners to prevent memory leaks
          itemToRemove.removeAllListeners();
        } catch (error: any) {
          // Log error but continue with removal
          const fsError = this.handleFileSystemError(error);
          console.error(`Error cleaning up download item ${name}:`, fsError.userMessage);
        }
      }

      // Mark the download as cleared in storage for persistence
      const identifier = this.downloadIdentifiers.get(name);
      if (identifier) {
        this.markDownloadAsCleared(identifier);
        this.downloadIdentifiers.delete(name);
      }

      // Remove the item from the array
      this.downloadingItems = this.downloadingItems.filter(item => basename(item.getSavePath()) !== name);

      // Update the download count in the main window
      downloadManagerIpc.send.dlCount(this.downloadingItems.length);

      // Hide the download menu window if no items remain
      if (this.downloadingItems.length === 0) {
        const contextMenuManager = classHolder.contextMenuManager;
        if (contextMenuManager) {
          contextMenuManager.hideContextMenu();
        } else {
          classHolder.waitForClass('contextMenuManager').then(contextMenuManager => {
            contextMenuManager.hideContextMenu();
          });
        }
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
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
      // Cancel all active or paused downloads and clean up listeners
      this.downloadingItems.forEach(item => {
        try {
          // If the item is still downloading or paused, cancel it first

          this.cancelItem(basename(item.getSavePath()));

          // Remove all event listeners to prevent memory leaks
          item.removeAllListeners();

          // Mark each download as cleared in storage
          const name = basename(item.getSavePath());
          const identifier = this.downloadIdentifiers.get(name);
          if (identifier) {
            this.markDownloadAsCleared(identifier);
          }
        } catch (error: any) {
          // Log error but continue with other items
          const fsError = this.handleFileSystemError(error);
          console.error(`Error cleaning up download item:`, fsError.userMessage);
        }
      });

      // Clear the arrays
      this.downloadingItems = [];
      this.downloadIdentifiers.clear();

      // Update the download count in the main window to zero
      downloadManagerIpc.send.dlCount(0);

      // Hide the download menu window since there are no items
      const contextMenuManager = classHolder.contextMenuManager;
      if (contextMenuManager) {
        contextMenuManager.hideContextMenu();
      } else {
        classHolder.waitForClass('contextMenuManager').then(contextMenuManager => {
          contextMenuManager.hideContextMenu();
        });
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error('Failed to clear all downloads:', fsError.userMessage);
    }
  }

  public openItem(name: string, action: 'open' | 'openFolder') {
    try {
      const savePath = this.getItemByName(name)?.getSavePath();
      if (savePath) {
        if (action === 'open') {
          shell.openPath(savePath).catch((error: any) => {
            const fsError = this.handleFileSystemError(error);
            console.error(`Failed to open file ${savePath}:`, fsError.userMessage);
            dialog.showErrorBox('Open File Error', `Failed to open file: ${fsError.userMessage}`);
          });
        } else {
          shell.showItemInFolder(savePath);
        }
      }
    } catch (error: any) {
      const fsError = this.handleFileSystemError(error);
      console.error(`Failed to ${action} item ${name}:`, fsError.userMessage);
      dialog.showErrorBox('File Operation Error', `Failed to ${action} file: ${fsError.userMessage}`);
    }
  }
}
