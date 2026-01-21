import path from 'node:path';

import browserChannels from '@lynx_cross/consts/ipc_channels/browser';
import browserVolumeChannels from '@lynx_cross/consts/ipc_channels/browser_volume';
import fileChannels from '@lynx_cross/consts/ipc_channels/files';
import gitChannels from '@lynx_cross/consts/ipc_channels/git';
import modulesChannels, {moduleApiChannels} from '@lynx_cross/consts/ipc_channels/module';
import pluginChannels from '@lynx_cross/consts/ipc_channels/plugins';
import ptyChannels from '@lynx_cross/consts/ipc_channels/pty';
import staticsChannels from '@lynx_cross/consts/ipc_channels/statics';
import storageChannels, {storageUtilsChannels} from '@lynx_cross/consts/ipc_channels/storage';
import utilsChannels from '@lynx_cross/consts/ipc_channels/utils';
import {
  AgentTypes,
  CustomRunBehaviorData,
  PreCommands,
  PreOpen,
  RecentlyOperation,
  StorageOperation,
  WHType,
} from '@lynx_cross/types/ipc';
import {app, FindInPageOptions, ipcMain, OpenDialogOptions, shell} from 'electron';

import {ChosenArgumentsData, ConfirmMenuTypes, FolderNames, SubscribeStages} from '../../cross/types';
import {ShallowCloneOptions} from '../../cross/types/git';
import StorageTypes, {InstalledCard} from '../../cross/types/storage';
import {toMs} from '../../cross/utils';
import BrowserDownloadManager from '../child_windows/browser_download_manager';
import BrowserManager from '../core/browser';
import classHolder from '../core/class_holder';
import {getAppDirectory} from '../core/data_folder';
import {getImageCacheManager} from '../core/image_cache';
import GitManager from '../git';
import {getList} from '../plugins/utils';
import {getAbsolutePath, getDirCreationDate, getRelativePath, getUserAgent, openDialog} from '../utils';
import calcFolderSize from '../utils/calc_folder_size';
import listenApplication from './application';
import {
  checkFilesExist,
  decompressFile,
  getImageAsDataURL,
  getRelativeList,
  isEmptyDir,
  isResponseValid,
  removeDir,
  saveToFile,
  trashDir,
} from './methods';
import {
  disableExtension,
  disableLoadingExtensions,
  getExtensionsDetails,
  getExtensionsUpdate,
  updateAllExtensions,
} from './methods/card_extensions';
import {cancelDownload, downloadFile} from './methods/downloader';
import {
  customPtyCommands,
  customPtyProcess,
  emptyPtyProcess,
  ptyClear,
  ptyProcess,
  ptyResize,
  ptyWrite,
  stopPty,
} from './methods/pty';
import {
  changeBranch,
  getRepositoryInfo,
  pullRepo,
  resetHard,
  shallowClone,
  shallowClonePromise,
  stashDrop,
  unShallow,
  validateGitDir,
} from './methods/repository';
import {handleGetAudioState, handleSetMuted, handleSetVolume} from './methods/volume';

function file() {
  // Gets app directory path by folder name (cards, extensions, etc.)
  ipcMain.handle(fileChannels.getAppDirectories, (_, name: FolderNames) => getAppDirectory(name));

  // Opens file/folder selection dialog
  ipcMain.handle(fileChannels.dialog, (_, option: OpenDialogOptions) => openDialog(option));

  // Opens directory in system file manager
  ipcMain.on(fileChannels.openPath, (_, dir: string) => shell.openPath(path.resolve(dir)));
  // Shows save dialog and saves content to file
  ipcMain.handle(fileChannels.saveToFile, (_, content: string) => saveToFile(content));

  // Permanently removes directory and all contents
  ipcMain.handle(fileChannels.removeDir, (_, dir: string) => removeDir(dir));
  // Moves directory to system trash
  ipcMain.handle(fileChannels.trashDir, (_, dir: string) => trashDir(dir));
  // Checks if directory is empty
  ipcMain.handle(fileChannels.isEmptyDir, (_, dir: string) => isEmptyDir(dir));

  // Lists directory contents with relative path support
  ipcMain.handle(fileChannels.listDir, async (_e, dirPath: string, relatives: string[]) =>
    getRelativeList(dirPath, relatives),
  );

  // Checks if specified files exist in directory
  ipcMain.handle(fileChannels.checkFilesExist, (_, dir: string, fileNames: string[]) =>
    checkFilesExist(dir, fileNames),
  );

  // Calculates total size of folder and all contents
  ipcMain.handle(fileChannels.calcFolderSize, (_, dir) => calcFolderSize(dir));
  // Converts absolute path to relative path
  ipcMain.handle(fileChannels.getRelativePath, (_, basePath: string, targetPath: string) =>
    getRelativePath(basePath, targetPath),
  );
  // Converts relative path to absolute path
  ipcMain.handle(fileChannels.getAbsolutePath, (_, basePath: string, targetPath: string) =>
    getAbsolutePath(basePath, targetPath),
  );
}

function git() {
  // Validates if directory is a valid Git repository matching the URL
  ipcMain.handle(gitChannels.validateGitDir, (_, dir: string, url: string) => validateGitDir(dir, url));

  // Performs shallow clone of Git repository (non-blocking)
  ipcMain.on(gitChannels.shallowClone, (_, options: ShallowCloneOptions) => shallowClone(options));
  // Performs shallow clone and returns promise
  ipcMain.handle(gitChannels.shallowClonePromise, (_, options: ShallowCloneOptions) => shallowClonePromise(options));

  // Drops Git stash entries
  ipcMain.handle(gitChannels.stashDrop, (_, dir: string) => stashDrop(dir));
  // Gets repository information (branch, remote, etc.)
  ipcMain.handle(gitChannels.getRepoInfo, (_, dir: string) => getRepositoryInfo(dir));
  // Changes Git branch
  ipcMain.handle(gitChannels.changeBranch, (_, dir: string, branchName: string) => changeBranch(dir, branchName));
  // Converts shallow clone to full clone
  ipcMain.handle(gitChannels.unShallow, (_, dir: string) => unShallow(dir));
  // Performs hard reset to HEAD
  ipcMain.handle(gitChannels.resetHard, (_, dir: string) => resetHard(dir));

  // Pulls latest changes from remote repository
  ipcMain.on(gitChannels.pull, (_, dir: string, id: string) => pullRepo(dir, id));
}

function utils() {
  // Gets detailed information about extensions in directory
  ipcMain.handle(utilsChannels.extensionsDetails, (_, dir: string) => getExtensionsDetails(dir));
  // Gets update status for all extensions in directory
  ipcMain.handle(utilsChannels.updateStatus, (_, dir: string) => getExtensionsUpdate(dir));

  // Updates all extensions in directory sequentially
  ipcMain.on(utilsChannels.updateAllExtensions, (_, data: {id: string; dir: string}) => updateAllExtensions(data));
  // Enables or disables extension by renaming folder (add/remove . prefix)
  ipcMain.handle(utilsChannels.disableExtension, (_, disable: boolean, dir: string) => disableExtension(disable, dir));

  // Cancels loading extension data operation
  ipcMain.on(utilsChannels.cancelExtensionsData, () => disableLoadingExtensions());

  // Downloads file from URL with progress tracking
  ipcMain.on(utilsChannels.downloadFile, (_, url: string) => downloadFile(url));
  // Cancels ongoing file download
  ipcMain.on(utilsChannels.cancelDownload, () => cancelDownload());

  // Decompresses archive file (zip, tar, etc.)
  ipcMain.handle(utilsChannels.decompressFile, (_, filePath: string) => decompressFile(filePath));

  // Validates if URL returns valid HTTP response
  ipcMain.handle(utilsChannels.isResponseValid, (_, url: string) => isResponseValid(url));
  // Fetches image from URL and converts to data URL (base64)
  ipcMain.handle(utilsChannels.getImageAsDataURL, (_, url: string) => getImageAsDataURL(url));
}

function modules() {
  const {moduleManager} = classHolder;
  // Checks if card has available updates
  ipcMain.handle(
    modulesChannels.cardUpdateAvailable,
    (_, card: InstalledCard, updateType: 'git' | 'stepper' | undefined) =>
      moduleManager?.checkCardUpdate(card, updateType),
  );
  // Uninstalls card by ID
  ipcMain.handle(modulesChannels.uninstallCardByID, (_, id: string) => moduleManager?.uninstallCardByID(id));

  // Checks for updates on multiple cards at intervals
  ipcMain.on(
    modulesChannels.checkCardsUpdateInterval,
    (
      _,
      updateType: {
        id: string;
        type: 'git' | 'stepper';
      }[],
    ) => moduleManager?.cardsUpdateInterval(updateType),
  );
}

function plugins() {
  const {pluginManager} = classHolder;
  // Gets plugin server addresses
  ipcMain.handle(pluginChannels.getAddresses, () => pluginManager?.getAddresses());
  // Gets list of installed plugins
  ipcMain.handle(pluginChannels.getInstalledList, () => pluginManager?.getInstalledList());
  // Gets list of unloaded plugins
  ipcMain.handle(pluginChannels.getUnloadedList, () => pluginManager?.getUnloadedList());
  // Installs plugin from URL
  ipcMain.handle(pluginChannels.install, (_, url: string, commitHash?: string) =>
    pluginManager?.install(url, commitHash),
  );
  // Uninstalls plugin by ID
  ipcMain.handle(pluginChannels.uninstall, (_, id: string) => pluginManager?.uninstall(id));
  // Syncs plugin to specific commit
  ipcMain.handle(pluginChannels.sync, (_, id: string, commit: string) => pluginManager?.syncItem(id, commit));
  // Syncs multiple plugins to their commits
  ipcMain.handle(pluginChannels.syncAll, (_, items: {id: string; commit: string}[]) => pluginManager?.syncAll(items));
  // Checks for available sync updates based on subscription stage
  ipcMain.handle(pluginChannels.checkForSync, (_, stage: SubscribeStages) => pluginManager?.checkForSync(stage));
  // Gets list of available plugins for subscription stage
  ipcMain.handle(pluginChannels.getList, (_, stage: SubscribeStages) => getList(stage));
  // Updates sync list entry for plugin
  ipcMain.handle(pluginChannels.updateSyncList, (_, id: string, commit: string) =>
    pluginManager?.updateSyncItem(id, commit),
  );
}

function pty() {
  // Starts PTY process for card with pre-commands and run commands
  ipcMain.on(ptyChannels.process, (_, id: string, cardId: string) => ptyProcess(id, cardId));
  // Starts custom PTY process with specific file to execute
  ipcMain.on(ptyChannels.customProcess, (_, id: string, dir?: string, file?: string) =>
    customPtyProcess(id, dir, file),
  );
  // Starts empty PTY process (no commands executed)
  ipcMain.on(ptyChannels.emptyProcess, (_, id: string, dir?: string) => emptyPtyProcess(id, dir));
  // Stops PTY process by ID
  ipcMain.on(ptyChannels.stopProcess, (_, id: string) => stopPty(id));
  // Executes custom commands in PTY
  ipcMain.on(ptyChannels.customCommands, (_, id: string, commands?: string | string[], dir?: string) =>
    customPtyCommands(id, commands, dir),
  );
  // Writes data to PTY input
  ipcMain.on(ptyChannels.write, (_, id: string, data: string) => ptyWrite(id, data));
  // Clears PTY terminal screen
  ipcMain.on(ptyChannels.clear, (_, id: string) => ptyClear(id));
  // Resizes PTY terminal dimensions
  ipcMain.on(ptyChannels.resize, (_, id: string, cols: number, rows: number) => ptyResize(id, cols, rows));
}

function storage() {
  const {storageManager} = classHolder;
  // Gets custom storage data by key
  ipcMain.handle(storageChannels.getCustom, (_, key: string) => storageManager.getCustomData(key));
  // Sets custom storage data by key
  ipcMain.on(storageChannels.setCustom, (_, key: string, data: any) => storageManager.setCustomData(key, data));

  // Gets typed storage data by key
  ipcMain.handle(storageChannels.get, (_, key: keyof StorageTypes) => storageManager.getData(key));
  // Gets all storage data
  ipcMain.handle(storageChannels.getAll, () => storageManager.getAll());

  // Updates storage data partially
  ipcMain.handle(
    storageChannels.update,
    async (_, key: keyof StorageTypes, updateData: Partial<StorageTypes[keyof StorageTypes]>) => {
      return storageManager.updateData(key, updateData);
    },
  );

  // Clears all storage data
  ipcMain.handle(storageChannels.clear, () => storageManager.clearStorage());
}

function storageUtilsIpc() {
  const {storageManager} = classHolder;
  // Sets app to start with system startup
  ipcMain.on(storageUtilsChannels.setSystemStartup, (_, startup: boolean) => {
    app.setLoginItemSettings({openAtLogin: startup});
    storageManager.updateData('app', {systemStartup: startup});
  });

  // Adds installed card to storage
  ipcMain.on(storageUtilsChannels.addInstalledCard, (_, cardData: InstalledCard) =>
    storageManager.addInstalledCard(cardData),
  );
  // Removes installed card from storage
  ipcMain.on(storageUtilsChannels.removeInstalledCard, (_, cardId: string) =>
    storageManager.removeInstalledCard(cardId),
  );

  // Adds card to auto-update list
  ipcMain.on(storageUtilsChannels.addAutoUpdateCard, (_, cardId: string) => storageManager.addAutoUpdateCard(cardId));
  // Removes card from auto-update list
  ipcMain.on(storageUtilsChannels.removeAutoUpdateCard, (_, cardId: string) =>
    storageManager.removeAutoUpdateCard(cardId),
  );

  // Adds card extensions to auto-update list
  ipcMain.on(storageUtilsChannels.addAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.addAutoUpdateExtensions(cardId),
  );
  // Removes card extensions from auto-update list
  ipcMain.on(storageUtilsChannels.removeAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.removeAutoUpdateExtensions(cardId),
  );

  // Manages pinned cards (add, remove, get)
  ipcMain.handle(storageUtilsChannels.pinnedCards, (_, opt: StorageOperation, id: string, pinnedCards?: string[]) =>
    storageManager.pinnedCardsOpt(opt, id, pinnedCards),
  );

  // Manages recently used cards (add, remove, get)
  ipcMain.handle(storageUtilsChannels.recentlyUsedCards, (_, opt: RecentlyOperation, id: string) =>
    storageManager.recentlyUsedCardsOpt(opt, id),
  );

  // Manages home category organization
  ipcMain.handle(storageUtilsChannels.homeCategory, (_, opt: StorageOperation, data: string[]) =>
    storageManager.homeCategoryOpt(opt, data),
  );

  // Manages pre-commands for cards (commands run before card starts)
  ipcMain.handle(storageUtilsChannels.preCommands, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.preCommandOpt(opt, data),
  );

  // Manages custom run commands for cards
  ipcMain.handle(storageUtilsChannels.customRun, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.customRunOpt(opt, data),
  );

  // Manages pre-open items (files/folders opened before card starts)
  ipcMain.handle(storageUtilsChannels.preOpen, (_, opt: StorageOperation, data: PreOpen) =>
    storageManager.preOpenOpt(opt, data),
  );

  // Updates custom run behavior settings
  ipcMain.on(storageUtilsChannels.customRunBehavior, (_, data: Partial<CustomRunBehaviorData>) =>
    storageManager.updateCustomRunBehavior(data),
  );

  // Gets card arguments by card ID
  ipcMain.handle(storageUtilsChannels.getCardArguments, (_, cardId: string) =>
    storageManager.getCardArgumentsById(cardId),
  );
  // Sets card arguments by card ID
  ipcMain.handle(storageUtilsChannels.setCardArguments, (_, cardId: string, args: ChosenArgumentsData) =>
    storageManager.setCardArguments(cardId, args),
  );

  // Updates zoom factor for cards
  ipcMain.on(storageUtilsChannels.updateZoomFactor, (_, zoomFactor: number) =>
    storageManager.updateData('cards', {zoomFactor}),
  );

  // Adds URL to browser recent list
  ipcMain.on(storageUtilsChannels.addBrowserRecent, (_, recentEntry: string) =>
    storageManager.addBrowserRecent(recentEntry),
  );
  // Adds URL to browser favorites
  ipcMain.on(storageUtilsChannels.addBrowserFavorite, (_, favoriteEntry: string) =>
    storageManager.addBrowserFavorite(favoriteEntry),
  );
  // Adds URL to browser history
  ipcMain.on(storageUtilsChannels.addBrowserHistory, (_, historyEntry: string) =>
    storageManager.addBrowserHistory(historyEntry),
  );

  // Adds favicon for browser recent URL
  ipcMain.on(storageUtilsChannels.addBrowserRecentFavIcon, (_, url: string, favIcon: string, title?: string) =>
    storageManager.addBrowserFavIcon(url, favIcon, title),
  );
  // Removes URL from browser recent list
  ipcMain.on(storageUtilsChannels.removeBrowserRecent, (_, url: string) => storageManager.removeBrowserRecent(url));
  // Removes URL from browser favorites
  ipcMain.on(storageUtilsChannels.removeBrowserFavorite, (_, url: string) => storageManager.removeBrowserFavorite(url));
  // Removes URL from browser history
  ipcMain.on(storageUtilsChannels.removeBrowserHistory, (_, url: string) => storageManager.removeBrowserHistory(url));

  // Sets confirmation dialog visibility (close, terminate AI, close tab)
  ipcMain.on(storageUtilsChannels.setShowConfirm, (_, type: ConfirmMenuTypes, enable: boolean) =>
    storageManager.setShowConfirm(type, enable),
  );

  // Marks notification as read
  ipcMain.on(storageUtilsChannels.addReadNotif, (_, id: string) => storageManager.addReadNotif(id));

  // Sets terminal pre-commands for card
  ipcMain.on(storageUtilsChannels.setCardTerminalPreCommands, (_, id: string, commands: string[]) =>
    storageManager.setCardTerminalPreCommands(id, commands),
  );
  // Unassigns card and optionally clears its configurations
  ipcMain.handle(storageUtilsChannels.unassignCard, (_, id: string, clearConfigs: boolean) =>
    storageManager.unassignCard(id, clearConfigs),
  );
  // Gets browser history data securely
  ipcMain.handle(storageUtilsChannels.getBrowserHistoryData, () => storageManager.getBrowserDataSecurely());
}

function modulesIpc() {
  const {moduleManager} = classHolder;
  moduleManager?.listenForChannels();
}

function extensionsIpc() {
  classHolder.extensionManager?.listenForChannels();
}

function modulesApi() {
  // Gets folder creation date
  ipcMain.handle(moduleApiChannels.getFolderCreationTime, (_, dir: string) => getDirCreationDate(dir));
  // Gets last Git pull date for repository
  ipcMain.handle(moduleApiChannels.getLastPulledDate, (_, dir: string) => GitManager.getLastPulledDate(dir));
  // Gets current Git release tag
  ipcMain.handle(moduleApiChannels.getCurrentReleaseTag, (_, dir: string) => GitManager.getCurrentReleaseTag(dir));
}

let browserTimeout: NodeJS.Timeout | undefined = undefined;
let browserIPCInitialized = false;

/** Resets the browserIPC initialization state. Call this before recreating
 *  the main window (e.g., on macOS activate). */
export function resetBrowserIPC() {
  browserIPCInitialized = false;
  if (browserTimeout) {
    clearTimeout(browserTimeout);
    browserTimeout = undefined;
  }
}

export function browserIPC() {
  const {appManager, contextMenuManager} = classHolder;

  // Prevent registering handlers multiple times
  if (browserIPCInitialized) {
    console.warn('browserIPC already initialized, skipping...');
    return;
  }

  const mainWindow = appManager?.getMainWindow();

  if (!mainWindow) {
    browserTimeout = setTimeout(browserIPC, toMs(1, 'seconds'));
    return;
  }

  clearTimeout(browserTimeout);
  browserTimeout = undefined;
  browserIPCInitialized = true;

  const browserManager: BrowserManager = new BrowserManager(mainWindow);
  classHolder.browserDownloadManager = new BrowserDownloadManager(browserManager.getSession(), mainWindow);

  contextMenuManager?.listenForBrowserChannels(browserManager);

  // Creates new browser webview instance
  ipcMain.on(browserChannels.createBrowser, (_, id: string) => browserManager.createBrowser(id));
  // Removes browser webview instance
  ipcMain.on(browserChannels.removeBrowser, (_, id: string) => browserManager.removeBrowser(id));
  // Loads URL in browser webview
  ipcMain.on(browserChannels.loadURL, (_, id: string, url: string) => browserManager.loadURL(id, url));
  // Sets browser webview visibility
  ipcMain.on(browserChannels.setVisible, (_, id: string, visible: boolean) => browserManager.setVisible(id, visible));

  // Finds text in page
  ipcMain.on(browserChannels.findInPage, (_, id: string, value: string, options: FindInPageOptions) =>
    browserManager.findInPage(id, value, options),
  );
  // Stops find in page operation
  ipcMain.on(
    browserChannels.stopFindInPage,
    (_, id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') =>
      browserManager.stopFindInPage(id, action),
  );

  // Sets zoom factor for browser webview
  ipcMain.on(browserChannels.setZoomFactor, (_, id: string, factor: number) =>
    browserManager.setZoomFactor(id, factor),
  );

  // Reloads current page
  ipcMain.on(browserChannels.reload, (_, id: string) => browserManager.reload(id));
  // Stops loading current page
  ipcMain.on(browserChannels.stop, (_, id: string) => browserManager.stop(id));
  // Navigates browser back
  ipcMain.on(browserChannels.goBack, (_, id: string) => browserManager.goBack(id));
  // Navigates browser forward
  ipcMain.on(browserChannels.goForward, (_, id: string) => browserManager.goForward(id));

  // Toggles DevTools for browser webview
  ipcMain.on(browserChannels.toggleDevTools, (_, id: string) => browserManager.toggleDevTools(id));

  // Focuses browser webview
  ipcMain.on(browserChannels.focusWebView, (_, id: string) => browserManager.focusWebView(id));

  // Clears browser cache - remove existing handler first to prevent duplicate registration
  ipcMain.removeHandler(browserChannels.clearCache);
  ipcMain.handle(browserChannels.clearCache, () => browserManager.clearCache());
  // Clears browser cookies - remove existing handler first to prevent duplicate registration
  ipcMain.removeHandler(browserChannels.clearCookies);
  ipcMain.handle(browserChannels.clearCookies, () => browserManager.clearCookies());

  // Gets user agent string - remove existing handler first to prevent duplicate registration
  ipcMain.removeHandler(browserChannels.getUserAgent);
  ipcMain.handle(browserChannels.getUserAgent, (_, type: AgentTypes) => getUserAgent(type));
  // Updates user agent for all browsers
  ipcMain.on(browserChannels.updateUserAgent, () => {
    browserManager.updateUserAgent();
    appManager?.getMainWindow()?.webContents.setUserAgent(getUserAgent());
  });

  // Adds offset to browser webview position
  ipcMain.on(browserChannels.addOffset, (_, id: string, offset: WHType) => browserManager.addOffset(id, offset));
  // Clears browser history for selected URLs
  ipcMain.on(browserChannels.clearHistory, (_, selected: string[]) => browserManager.clearHistory(selected));

  // Volume control handlers
  // Sets volume level for browser webview (0-100) - remove existing handler first to prevent duplicate registration
  ipcMain.removeHandler(browserVolumeChannels.setVolume);
  ipcMain.handle(browserVolumeChannels.setVolume, (_, id: string, volume: number) =>
    handleSetVolume(browserManager, id, volume),
  );
  // Sets mute state for browser webview - remove existing handler first to prevent duplicate registration
  ipcMain.removeHandler(browserVolumeChannels.setMuted);
  ipcMain.handle(browserVolumeChannels.setMuted, (_, id: string, muted: boolean) =>
    handleSetMuted(browserManager, id, muted),
  );
  // Gets current audio state (playing, muted) for browser webview - remove existing handler first
  ipcMain.removeHandler(browserVolumeChannels.getState);
  ipcMain.handle(browserVolumeChannels.getState, (_, id: string) => handleGetAudioState(browserManager, id));

  // Forward volume updates from context menu to main window
  ipcMain.on(browserVolumeChannels.updateTabVolume, (_, tabId: string, volume: number) => {
    mainWindow.webContents.send(browserVolumeChannels.onTabVolumeUpdate, tabId, volume);
  });
  ipcMain.on(browserVolumeChannels.updateTabMuted, (_, tabId: string, muted: boolean) => {
    mainWindow.webContents.send(browserVolumeChannels.onTabMutedUpdate, tabId, muted);
  });
}

function statics() {
  const {staticManager} = classHolder;

  // Pulls latest static data from server
  ipcMain.handle(staticsChannels.pull, () => staticManager?.pull());
  // Gets app release information
  ipcMain.handle(staticsChannels.getReleases, () => staticManager?.getReleases());
  // Gets insider build information
  ipcMain.handle(staticsChannels.getInsider, () => staticManager?.getInsider());
  // Gets notification data
  ipcMain.handle(staticsChannels.getNotification, () => staticManager?.getNotification());
  // Gets available modules list
  ipcMain.handle(staticsChannels.getModules, () => staticManager?.getModules());
  // Gets available extensions list
  ipcMain.handle(staticsChannels.getExtensions, () => staticManager?.getExtensions());
  // Gets early access extensions list
  ipcMain.handle(staticsChannels.getExtensionsEA, () => staticManager?.getExtensionsEA());
  // Gets Patreon supporters list
  ipcMain.handle(staticsChannels.getPatrons, () => staticManager?.getPatrons());
}

function imageCache() {
  const cacheManager = getImageCacheManager();

  // Gets cache statistics (entry count, total size, last cleanup)
  ipcMain.handle(utilsChannels.getImageCacheStats, () => {
    const stats = cacheManager.getStats();
    return {
      entryCount: stats.entryCount,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatBytes(stats.totalSize),
      lastCleanup: stats.lastCleanup,
      lastCleanupFormatted: new Date(stats.lastCleanup).toISOString(),
    };
  });

  // Clears all cached images
  ipcMain.handle(utilsChannels.clearImageCache, async () => {
    const clearedCount = await cacheManager.clearCache();
    return {success: true, clearedEntries: clearedCount};
  });

  // Triggers manual cache cleanup (removes expired entries)
  ipcMain.handle(utilsChannels.triggerImageCacheCleanup, async () => {
    await cacheManager.triggerCleanup();
    return {success: true};
  });
}

/** Formats bytes to human readable string */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function listenToIpcChannels() {
  storage();
  storageUtilsIpc();

  listenApplication();
  file();

  git();
  utils();
  pty();

  modules();
  modulesApi();
  modulesIpc();

  extensionsIpc();

  plugins();

  const {contextMenuManager, linkPreviewManager} = classHolder;
  contextMenuManager?.listenForContextChannels();
  linkPreviewManager?.listenForChannels();

  statics();
  imageCache();
}
