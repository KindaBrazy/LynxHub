// Renderer IPC client - Provides methods for renderer process to communicate with main process
import {ContextMenuParams, FindInPageOptions, IpcRendererEvent, OpenDialogOptions} from 'electron';

import {
  AppUpdateData,
  AppUpdateInsiderData,
  ChosenArgumentsData,
  ContextResizeData,
  CustomNotificationInfo,
  ExtensionsInfo,
  FolderListData,
  FolderNames,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
  PatreonUserData,
  RepositoryInfo,
  SubscribeStages,
} from '../../../cross/CrossTypes';
import {
  browserDownloadChannels,
  customNotifChannels,
  DownloadDoneInfo,
  DownloadManagerProgress,
  DownloadStartInfo,
} from '../../../cross/DownloadManagerTypes';
import {ShallowCloneOptions} from '../../../cross/GitTypes';
import {
  AgentTypes,
  appDataChannels,
  appUpdateChannels,
  AppUpdateEventTypes,
  AppUpdateStatus,
  appWindowChannels,
  AudioState,
  browserChannels,
  BrowserHistoryData,
  CanGoType,
  ChangeWindowState,
  contextMenuChannels,
  CustomRunBehaviorData,
  DarkModeTypes,
  DownloadProgress,
  eventsChannels,
  ExtensionsData,
  ExtensionsUpdateStatus,
  fileChannels,
  gitChannels,
  GitProgressCallback,
  HeroToastPlacement,
  HomeCategory,
  imageCacheChannels,
  initChannels,
  LynxInput,
  moduleApiChannels,
  modulesChannels,
  OnPreCommands,
  OnUpdatingExtensions,
  patreonChannels,
  pluginChannels,
  PreCommands,
  PreOpen,
  PreOpenData,
  ptyChannels,
  RecentlyOperation,
  ShowToastTypes,
  staticsChannels,
  storageChannels,
  StorageOperation,
  storageUtilsChannels,
  SystemInfo,
  tabsChannels,
  TaskbarStatus,
  utilsChannels,
  volumeChannels,
  WHType,
  winChannels,
  WinStateChange,
} from '../../../cross/IpcChannelAndTypes';
import {
  PluginAddresses,
  PluginInstalledItem,
  PluginItem,
  PluginSyncItem,
  UnloadedPlugins,
} from '../../../cross/plugin/PluginTypes';
import StorageTypes, {InstalledCard, InstalledCards} from '../../../cross/StorageTypes';
import {extensionRendererApi} from './Extensions/ExtensionLoader';

const ipc = window.electron.ipcRenderer;

const rendererIpc = {
  /** Managing app window states */
  win: {
    // Changes window state (maximize, minimize, close, fullscreen, restart)
    changeWinState: (state: ChangeWindowState): void => {
      extensionRendererApi.events_ipc.emit('win_change_state', {state});
      ipc.send(winChannels.changeState, state);
    },
    // Listens for window state change events
    onChangeState: (result: (event: IpcRendererEvent, result: WinStateChange) => void) =>
      ipc.on(winChannels.onChangeState, result),

    // Sets app theme (light, dark, or system)
    setDarkMode: (darkMode: DarkModeTypes): void => {
      extensionRendererApi.events_ipc.emit('win_set_dark_mode', {darkMode});
      ipc.send(winChannels.setDarkMode, darkMode);
    },
    // Gets system dark mode preference (light/dark)
    getSystemDarkMode: (): Promise<'light' | 'dark'> => {
      extensionRendererApi.events_ipc.emit('win_get_system_dark_mode', {});
      return ipc.invoke(winChannels.getSystemDarkMode);
    },
    // Listens for dark mode change events
    onDarkMode: (result: (event: IpcRendererEvent, darkMode: DarkModeTypes) => void) =>
      ipc.on(winChannels.onDarkMode, result),

    // Sets taskbar visibility status (taskbar, tray, taskbar-tray, tray-minimized)
    setTaskBarStatus: (status: TaskbarStatus): void => {
      extensionRendererApi.events_ipc.emit('win_set_taskbar_status', {status});
      ipc.send(winChannels.setTaskBarStatus, status);
    },

    // Gets system information (OS platform and build number)
    getSystemInfo: (): Promise<SystemInfo> => {
      extensionRendererApi.events_ipc.emit('win_get_system_info', {});
      return ipc.invoke(winChannels.getSystemInfo);
    },

    // Opens URL in default system browser
    openUrlDefaultBrowser: (url: string): void => {
      extensionRendererApi.events_ipc.emit('win_open_url_default_browser', {url});
      ipc.send(winChannels.openUrlDefaultBrowser, url);
    },
  },

  /** Managing files and directories */
  file: {
    // Opens file/folder selection dialog
    openDlg: (option: OpenDialogOptions): Promise<string | undefined> => {
      extensionRendererApi.events_ipc.emit('file_open_dialog', {option});
      return ipc.invoke(fileChannels.dialog, option);
    },

    // Opens directory in system file manager
    openPath: (dir: string): void => {
      extensionRendererApi.events_ipc.emit('file_open_path', {dir});
      ipc.send(fileChannels.openPath, dir);
    },
    // Shows save dialog and saves content to file
    saveToFile: (content: string): Promise<string | null> => ipc.invoke(fileChannels.saveToFile, content),

    // Gets app directory path by folder name (cards, extensions, etc.)
    getAppDirectories: (name: FolderNames): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_app_directories', {name});
      return ipc.invoke(fileChannels.getAppDirectories, name);
    },

    // Permanently removes directory and all contents
    removeDir: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('file_remove_dir', {dir});
      return ipc.invoke(fileChannels.removeDir, dir);
    },

    // Moves directory to system trash
    trashDir: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('file_trash_dir', {dir});
      return ipc.invoke(fileChannels.trashDir, dir);
    },

    // Lists directory contents with relative path support
    listDir: (dirPath: string, relatives: string[]): Promise<FolderListData[]> => {
      extensionRendererApi.events_ipc.emit('file_list_dir', {dirPath, relatives});
      return ipc.invoke(fileChannels.listDir, dirPath, relatives);
    },

    // Checks if specified files exist in directory
    checkFilesExist: (dir: string, fileNames: string[]) => {
      extensionRendererApi.events_ipc.emit('file_check_files_exist', {dir, fileNames});
      return ipc.invoke(fileChannels.checkFilesExist, dir, fileNames);
    },

    // Calculates total size of folder and all contents
    calcFolderSize: (dir: string) => {
      extensionRendererApi.events_ipc.emit('file_calc_folder_size', {dir});
      return ipc.invoke(fileChannels.calcFolderSize, dir);
    },
    // Converts absolute path to relative path
    getRelativePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_relative_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getRelativePath, basePath, targetPath);
    },
    // Converts relative path to absolute path
    getAbsolutePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_absolute_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getAbsolutePath, basePath, targetPath);
    },

    // Checks if directory is empty
    isEmptyDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('file_is_empty_dir', {dir});
      return ipc.invoke(fileChannels.isEmptyDir, dir);
    },
  },

  /** Git operations */
  git: {
    // Performs shallow clone of Git repository (non-blocking)
    cloneShallow: (options: ShallowCloneOptions): void => ipc.send(gitChannels.shallowClone, options),
    // Performs shallow clone and returns promise
    cloneShallowPromise: (options: ShallowCloneOptions): Promise<void> =>
      ipc.invoke(gitChannels.shallowClonePromise, options),
    // Gets repository information (branch, remote, etc.)
    getRepoInfo: (dir: string): Promise<RepositoryInfo> => {
      extensionRendererApi.events_ipc.emit('git_get_repo_info', {dir});
      return ipc.invoke(gitChannels.getRepoInfo, dir);
    },
    // Changes Git branch
    changeBranch: (dir: string, branchName: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_change_branch', {dir, branchName});
      return ipc.invoke(gitChannels.changeBranch, dir, branchName);
    },
    // Converts shallow clone to full clone
    unShallow: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_unshallow', {dir});
      return ipc.invoke(gitChannels.unShallow, dir);
    },
    // Performs hard reset to HEAD
    resetHard: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_reset_hard', {dir});
      return ipc.invoke(gitChannels.resetHard, dir);
    },

    // Validates if directory is a valid Git repository matching the URL
    validateGitDir: (dir: string, url: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('git_validate_git_dir', {dir, url});
      return ipc.invoke(gitChannels.validateGitDir, dir, url);
    },

    // Listens for Git operation progress updates
    onProgress: (callback: GitProgressCallback) => ipc.on(gitChannels.onProgress, callback),

    // Pulls latest changes from remote repository
    pull: (repoDir: string, id: string): void => {
      extensionRendererApi.events_ipc.emit('git_pull', {repoDir, id});
      ipc.send(gitChannels.pull, repoDir, id);
    },
    // Drops Git stash entries
    stashDrop: (
      dir: string,
    ): Promise<{
      message: string;
      type: 'error' | 'success' | 'info';
    }> => {
      extensionRendererApi.events_ipc.emit('git_stash_drop', {dir});
      return ipc.invoke(gitChannels.stashDrop, dir);
    },
  },

  /** Managing app modules */
  module: {
    // Checks if card has available updates
    cardUpdateAvailable: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('module_card_update_available', {card, updateType});
      return ipc.invoke(modulesChannels.cardUpdateAvailable, card, updateType);
    },
    // Uninstalls card by ID
    uninstallCardByID: (id: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('module_uninstall_card_by_id', {id});
      return ipc.invoke(modulesChannels.uninstallCardByID, id);
    },
    // Checks for updates on multiple cards at intervals
    checkCardsUpdateInterval: (updateType: {id: string; type: 'git' | 'stepper'}[]) => {
      extensionRendererApi.events_ipc.emit('module_check_cards_update_interval', {updateType});
      ipc.send(modulesChannels.checkCardsUpdateInterval, updateType);
    },
    // Listens for card update availability events
    onCardsUpdateAvailable: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(modulesChannels.onCardsUpdateAvailable, result),
  },

  moduleApi: {
    // Gets folder creation date
    getFolderCreationTime: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_folder_creation_time', {dir});
      return ipc.invoke(moduleApiChannels.getFolderCreationTime, dir);
    },
    // Gets last Git pull date for repository
    getLastPulledDate: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_last_pulled_date', {dir});
      return ipc.invoke(moduleApiChannels.getLastPulledDate, dir);
    },
    // Gets current Git release tag
    getCurrentReleaseTag: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_current_release_tag', {dir});
      return ipc.invoke(moduleApiChannels.getCurrentReleaseTag, dir);
    },
  },

  plugins: {
    // Gets list of available plugins for subscription stage
    getList: (stage: SubscribeStages): Promise<PluginItem[]> => ipc.invoke(pluginChannels.getList, stage),
    // Gets plugin server addresses
    getAddresses: (): Promise<PluginAddresses> => ipc.invoke(pluginChannels.getAddresses),
    // Gets list of installed plugins
    getInstalledList: (): Promise<PluginInstalledItem[]> => ipc.invoke(pluginChannels.getInstalledList),
    // Gets list of unloaded plugins
    getUnloadedList: (): Promise<UnloadedPlugins[]> => ipc.invoke(pluginChannels.getUnloadedList),

    // Installs plugin from URL
    install: (url: string, commitHash?: string): Promise<boolean> =>
      ipc.invoke(pluginChannels.install, url, commitHash),
    // Uninstalls plugin by ID
    uninstall: (id: string): Promise<boolean> => ipc.invoke(pluginChannels.uninstall, id),
    // Syncs plugin to specific commit
    sync: (id: string, commit: string): Promise<boolean> => ipc.invoke(pluginChannels.sync, id, commit),
    // Updates sync list entry for plugin
    updateSyncList: (id: string, commit: string): Promise<boolean> =>
      ipc.invoke(pluginChannels.updateSyncList, id, commit),
    // Syncs multiple plugins to their commits
    syncAll: (items: {id: string; commit: string}[]): Promise<string[]> => ipc.invoke(pluginChannels.syncAll, items),
    // Checks for available sync updates based on subscription stage
    checkForSync: (stage: SubscribeStages): Promise<void> => ipc.invoke(pluginChannels.checkForSync, stage),

    // Listens for plugin sync availability events
    onSyncAvailable: (result: (event: IpcRendererEvent, cards: PluginSyncItem[]) => void) =>
      ipc.on(pluginChannels.onSyncAvailable, result),
  },

  /** Utilities methods for working with app storage data */
  storageUtils: {
    // Adds installed card to storage
    addInstalledCard: (cardData: InstalledCard): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_installed_card', {cardData});
      ipc.send(storageUtilsChannels.addInstalledCard, cardData);
    },
    // Removes installed card from storage
    removeInstalledCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_installed_card', {cardId});
      ipc.send(storageUtilsChannels.removeInstalledCard, cardId);
    },
    // Listens for installed cards change events
    onInstalledCards: (result: (event: IpcRendererEvent, cards: InstalledCards) => void) =>
      ipc.on(storageUtilsChannels.onInstalledCards, result),

    // Adds card to auto-update list
    addAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateCard, cardId);
    },
    // Removes card from auto-update list
    removeAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateCard, cardId);
    },
    // Listens for auto-update cards change events
    onAutoUpdateCards: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateCards, result),

    // Adds card extensions to auto-update list
    addAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateExtensions, cardId);
    },
    // Removes card extensions from auto-update list
    removeAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateExtensions, cardId);
    },
    // Listens for auto-update extensions change events
    onAutoUpdateExtensions: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateExtensions, result),

    // Manages pinned cards (add, remove, get)
    pinnedCards: (opt: StorageOperation, id: string, pinnedCards?: string[]): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pinned_cards', {opt, id, pinnedCards});
      return ipc.invoke(storageUtilsChannels.pinnedCards, opt, id, pinnedCards);
    },
    // Listens for pinned cards change events
    onPinnedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onPinnedCardsChange, result),

    // Manages pre-commands for cards (commands run before card starts)
    preCommands: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pre_commands', {opt, data});
      return ipc.invoke(storageUtilsChannels.preCommands, opt, data);
    },
    // Listens for pre-commands change events
    onPreCommands: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onPreCommands, result),

    // Manages custom run commands for cards
    customRun: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_custom_run', {opt, data});
      return ipc.invoke(storageUtilsChannels.customRun, opt, data);
    },
    // Listens for custom run commands change events
    onCustomRun: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onCustomRun, result),

    // Updates custom run behavior settings
    updateCustomRunBehavior: (data: Partial<CustomRunBehaviorData>) =>
      ipc.send(storageUtilsChannels.customRunBehavior, data),

    // Manages pre-open items (files/folders opened before card starts)
    preOpen: (opt: StorageOperation, open: PreOpen): Promise<PreOpenData | undefined> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pre_open', {opt, open});
      return ipc.invoke(storageUtilsChannels.preOpen, opt, open);
    },

    // Gets card arguments by card ID
    getCardArguments: (cardId: string): Promise<ChosenArgumentsData> => {
      extensionRendererApi.events_ipc.emit('storage_utils_get_card_arguments', {cardId});
      return ipc.invoke(storageUtilsChannels.getCardArguments, cardId);
    },
    // Sets card arguments by card ID
    setCardArguments: (cardId: string, args: ChosenArgumentsData): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_card_arguments', {cardId, args});
      return ipc.invoke(storageUtilsChannels.setCardArguments, cardId, args);
    },

    // Manages recently used cards (add, remove, get)
    recentlyUsedCards: (opt: RecentlyOperation, id: string): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_recently_used_cards', {opt, id});
      return ipc.invoke(storageUtilsChannels.recentlyUsedCards, opt, id);
    },
    // Listens for recently used cards change events
    onRecentlyUsedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onRecentlyUsedCardsChange, result),

    // Manages home category organization
    homeCategory: (opt: StorageOperation, data: HomeCategory): Promise<HomeCategory> => {
      extensionRendererApi.events_ipc.emit('storage_utils_home_category', {opt, data});
      return ipc.invoke(storageUtilsChannels.homeCategory, opt, data);
    },
    // Listens for home category change events
    onHomeCategory: (result: (event: IpcRendererEvent, data: HomeCategory) => void) =>
      ipc.on(storageUtilsChannels.onHomeCategory, result),
    // Sets app to start with system startup
    setSystemStartup: (startup: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_system_startup', {startup});
      ipc.send(storageUtilsChannels.setSystemStartup, startup);
    },

    // Updates zoom factor for cards
    updateZoomFactor: (zoomFactor: number) => {
      extensionRendererApi.events_ipc.emit('storage_utils_update_zoom_factor', {zoomFactor});
      ipc.send(storageUtilsChannels.updateZoomFactor, zoomFactor);
    },

    // Adds URL to browser recent list
    addBrowserRecent: (recentEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_recent', {recentEntry});
      ipc.send(storageUtilsChannels.addBrowserRecent, recentEntry);
    },
    // Adds URL to browser favorites
    addBrowserFavorite: (favoriteEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_favorite', {favoriteEntry});
      ipc.send(storageUtilsChannels.addBrowserFavorite, favoriteEntry);
    },
    // Adds URL to browser history
    addBrowserHistory: (historyEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_history', {historyEntry});
      ipc.send(storageUtilsChannels.addBrowserHistory, historyEntry);
    },
    // Adds favicon for browser recent URL
    addBrowserRecentFavIcon: (url: string, favIcon: string, title?: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_recent_favicon', {url, favIcon});
      ipc.send(storageUtilsChannels.addBrowserRecentFavIcon, url, favIcon, title);
    },
    // Removes URL from browser recent list
    removeBrowserRecent: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_recent', {url});
      ipc.send(storageUtilsChannels.removeBrowserRecent, url);
    },
    // Removes URL from browser favorites
    removeBrowserFavorite: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_favorite', {url});
      ipc.send(storageUtilsChannels.removeBrowserFavorite, url);
    },
    // Removes URL from browser history
    removeBrowserHistory: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_history', {url});
      ipc.send(storageUtilsChannels.removeBrowserHistory, url);
    },

    // Sets confirmation dialog visibility (close, terminate AI, close tab)
    setShowConfirm: (type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_show_confirm', {type, enable});
      ipc.send(storageUtilsChannels.setShowConfirm, type, enable);
    },

    // Listens for confirmation dialog setting changes
    onConfirmChange: (
      result: (
        event: IpcRendererEvent,
        type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm',
        enable: boolean,
      ) => void,
    ) => ipc.on(storageUtilsChannels.onConfirmChange, result),

    // Marks notification as read
    addReadNotif: (id: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_read_notif', {id});
      ipc.send(storageUtilsChannels.addReadNotif, id);
    },

    // Sets terminal pre-commands for card
    setCardTerminalPreCommands: (id: string, commands: string[]) => {
      extensionRendererApi.events_ipc.emit('storage_utils_setCardTerminalPreCommands', {id, commands});
      ipc.send(storageUtilsChannels.setCardTerminalPreCommands, id, commands);
    },

    // Unassigns card and optionally clears its configurations
    unassignCard: (id: string, clearConfigs: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_unassignCard', {id, clearConfigs});
      return ipc.invoke(storageUtilsChannels.unassignCard, id, clearConfigs);
    },

    // Gets browser history data securely
    getBrowserHistoryData: (): Promise<BrowserHistoryData> => ipc.invoke(storageUtilsChannels.getBrowserHistoryData),
  },

  /** Utilities methods */
  utils: {
    // Updates all extensions in directory sequentially
    updateAllExtensions: (data: {id: string; dir: string}): void => {
      extensionRendererApi.events_ipc.emit('utils_update_all_extensions', {data});
      ipc.send(utilsChannels.updateAllExtensions, data);
    },
    // Listens for extension update progress
    onUpdateAllExtensions: (result: (event: IpcRendererEvent, updateInfo: OnUpdatingExtensions) => void) =>
      ipc.on(utilsChannels.onUpdateAllExtensions, result),

    // Gets detailed information about extensions in directory
    getExtensionsDetails: (dir: string): Promise<ExtensionsData> => {
      extensionRendererApi.events_ipc.emit('utils_get_extensions_details', {dir});
      return ipc.invoke(utilsChannels.extensionsDetails, dir);
    },

    // Gets update status for all extensions in directory
    getExtensionsUpdateStatus: (dir: string): Promise<ExtensionsUpdateStatus> => {
      extensionRendererApi.events_ipc.emit('utils_get_extensions_update_status', {dir});
      return ipc.invoke(utilsChannels.updateStatus, dir);
    },

    // Enables or disables extension by renaming folder (add/remove . prefix)
    disableExtension: (disable: boolean, dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('utils_disable_extension', {disable, dir});
      return ipc.invoke(utilsChannels.disableExtension, disable, dir);
    },

    // Cancels loading extension data operation
    cancelExtensionsData: (): void => {
      extensionRendererApi.events_ipc.emit('utils_cancel_extensions_data', {});
      ipc.send(utilsChannels.cancelExtensionsData);
    },

    // Downloads file from URL with progress tracking
    downloadFile: (url: string): void => {
      extensionRendererApi.events_ipc.emit('utils_download_file', {url});
      ipc.send(utilsChannels.downloadFile, url);
    },
    // Cancels ongoing file download
    cancelDownload: (): void => {
      extensionRendererApi.events_ipc.emit('utils_cancel_download', {});
      ipc.send(utilsChannels.cancelDownload);
    },
    // Listens for file download progress updates
    onDownloadFile: (result: (event: IpcRendererEvent, progress: DownloadProgress) => void) =>
      ipc.on(utilsChannels.onDownloadFile, result),

    // Decompresses archive file (zip, tar, etc.)
    decompressFile: (filePath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('utils_decompress_file', {filePath});
      return ipc.invoke(utilsChannels.decompressFile, filePath);
    },

    // Validates if URL returns valid HTTP response
    isResponseValid: (url: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('utils_is_response_valid', {url});
      return ipc.invoke(utilsChannels.isResponseValid, url);
    },
    // Fetches image from URL and converts to data URL (base64)
    getImageAsDataURL: (url: string): Promise<string | null> => {
      extensionRendererApi.events_ipc.emit('utils_get_image_as_data_url', {url});
      return ipc.invoke(utilsChannels.getImageAsDataURL, url);
    },
  },

  /** Managing and using node_pty(Pseudo Terminal ) */
  pty: {
    // Starts PTY process for card with pre-commands and run commands
    process: (id: string, cardId: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process', {id, cardId});
      ipc.send(ptyChannels.process, id, cardId);
    },
    // Starts custom PTY process with specific file to execute
    customProcess: (id: string, dir?: string, file?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom', {id, dir, file});
      ipc.send(ptyChannels.customProcess, id, dir, file);
    },
    // Starts empty PTY process (no commands executed)
    emptyProcess: (id: string, dir?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_empty', {id, dir});
      ipc.send(ptyChannels.emptyProcess, id, dir);
    },
    // Executes custom commands in PTY
    customCommands: (id: string, commands?: string | string[], dir?: string) => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom_command', {id, commands, dir});
      ipc.send(ptyChannels.customCommands, id, commands, dir);
    },

    // Stops PTY process by ID
    stop: (id: string) => {
      extensionRendererApi.events_ipc.emit('terminal_process_stop', {id});
      ipc.send(ptyChannels.stopProcess, id);
    },

    // Writes data to PTY input
    write: (id: string, data: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_write', {id, data});
      ipc.send(ptyChannels.write, id, data);
    },

    // Clears PTY terminal screen
    clear: (id: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_clear', {id});
      ipc.send(ptyChannels.clear, id);
    },

    // Resizes PTY terminal dimensions
    resize: (id: string, cols: number, rows: number): void => {
      extensionRendererApi.events_ipc.emit('terminal_resize', {id, cols, rows});
      ipc.send(ptyChannels.resize, id, cols, rows);
    },

    // Listens for PTY output data
    onData: (result: (event: IpcRendererEvent, id: string, data: string) => void) => ipc.on(ptyChannels.onData, result),
    // Listens for PTY title changes
    onTitle: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(ptyChannels.onTitle, result),
    // Listens for PTY process exit
    onExit: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(ptyChannels.onExit, result),
  },

  /** Managing app automatic updates */
  appUpdate: {
    // Listens for app update error events
    statusError: (result: (event: IpcRendererEvent) => void) => ipc.on(appUpdateChannels.statusError, result),

    // Listens for app update status events
    status: (result: (event: IpcRendererEvent, type: AppUpdateEventTypes, status: AppUpdateStatus) => void) =>
      ipc.on(appUpdateChannels.status, result),

    // Downloads app update
    download: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_download', {});
      ipc.send(appUpdateChannels.download);
    },

    // Cancels app update download
    cancel: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_cancel', {});
      ipc.send(appUpdateChannels.cancel);
    },

    // Installs downloaded app update
    install: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_install', {});
      ipc.send(appUpdateChannels.install);
    },
  },

  /** Managing app data directories */
  appData: {
    // Gets current app data directory path
    getCurrentPath: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_get_current_path', {});
      return ipc.invoke(appDataChannels.getCurrentPath);
    },

    // Opens dialog to select new app data folder
    selectAnother: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_select_another', {});
      return ipc.invoke(appDataChannels.selectAnother);
    },

    // Checks if directory is valid app data directory
    isAppDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('app_data_is_app_dir', {dir});
      return ipc.invoke(appDataChannels.isAppDir, dir);
    },
  },

  /** Managing app storage data */
  storage: {
    // Gets custom storage data by key
    getCustom: (key: string): Promise<any> => {
      extensionRendererApi.events_ipc.emit('storage_get_custom', {key});
      return ipc.invoke(storageChannels.getCustom, key);
    },
    // Sets custom storage data by key
    setCustom: (key: string, data: any): void => {
      extensionRendererApi.events_ipc.emit('storage_set_custom', {key, data});
      ipc.send(storageChannels.setCustom, key, data);
    },

    // Gets typed storage data by key
    get: <K extends keyof StorageTypes>(key: K): Promise<StorageTypes[K]> => {
      extensionRendererApi.events_ipc.emit('storage_get', {key});
      return ipc.invoke(storageChannels.get, key);
    },

    // Gets all storage data
    getAll: (): Promise<StorageTypes> => {
      extensionRendererApi.events_ipc.emit('storage_get_all', {});
      return ipc.invoke(storageChannels.getAll);
    },

    // Updates storage data partially
    update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_update', {key, updateData});
      return ipc.invoke(storageChannels.update, key, updateData);
    },

    // Clears all storage data
    clear: (): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_clear', {});
      return ipc.invoke(storageChannels.clear);
    },
  },

  appWindow: {
    // Listens for hotkey change events
    onHotkeysChange: (result: (event: IpcRendererEvent, input: LynxInput) => void) =>
      ipc.on(appWindowChannels.hotkeysChange, result),

    // Listens for toast notification events
    onShowToast: (
      result: (event: IpcRendererEvent, message: string, type: ShowToastTypes, placement?: HeroToastPlacement) => void,
    ) => ipc.on(appWindowChannels.showToast, result),
  },

  contextMenu: {
    // Resizes context menu window
    resizeWindow: (data: ContextResizeData) => {
      extensionRendererApi.events_ipc.emit('context_menu_resize_window', {data});
      ipc.send(contextMenuChannels.resizeWindow, data);
    },
    // Shows context menu window
    showWindow: () => {
      extensionRendererApi.events_ipc.emit('context_menu_show_window', {});
      ipc.send(contextMenuChannels.showWindow);
    },
    // Hides context menu window
    hideWindow: () => {
      extensionRendererApi.events_ipc.emit('context_menu_hide_window', {});
      ipc.send(contextMenuChannels.hideWindow);
    },

    // Listens for context menu view initialization events
    onInitView: (
      result: (
        event: IpcRendererEvent,
        params: ContextMenuParams,
        navHistory: {
          canGoBack: boolean;
          canGoForward: boolean;
        },
        id: number,
      ) => void,
    ) => ipc.on(contextMenuChannels.onInitView, result),

    // Opens terminate AI dialog
    openTerminateAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_open_terminate_ai', {id});
      ipc.send(contextMenuChannels.openTerminateAI, id);
    },
    // Opens terminate tab dialog
    openTerminateTab: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events_ipc.emit('context_menu_open_terminate_tab', {id, customPosition});
      ipc.send(contextMenuChannels.openTerminateTab, id, customPosition);
    },
    // Opens close app dialog
    openCloseApp: () => {
      extensionRendererApi.events_ipc.emit('context_menu_open_close_app', {});
      ipc.send(contextMenuChannels.openCloseApp);
    },

    // Listens for find in page events
    onFind: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onFind, result),
    // Listens for terminate AI events
    onTerminateAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onTerminateAI, result),
    // Listens for terminate tab events
    onTerminateTab: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onTerminateTab, result),
    // Listens for close app events
    onCloseApp: (result: (event: IpcRendererEvent) => void) => ipc.on(contextMenuChannels.onCloseApp, result),
    // Listens for zoom events
    onZoom: (result: (event: IpcRendererEvent, id: string, zoomFactor: number) => void) =>
      ipc.on(contextMenuChannels.onZoom, result),
    // Listens for volume control events
    onVolume: (
      result: (
        event: IpcRendererEvent,
        data: {id: string; tabId: string; volume: number; muted: boolean; globalMuted: boolean},
      ) => void,
    ) => ipc.on(contextMenuChannels.onVolume, result),

    // Relaunches AI process
    relaunchAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_relaunch_ai', {id});
      ipc.send(contextMenuChannels.relaunchAI, id);
    },
    // Listens for AI relaunch events
    onRelaunchAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onRelaunchAI, result),

    // Stops AI process
    stopAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_stop_ai', {id});
      ipc.send(contextMenuChannels.stopAI, id);
    },
    // Listens for AI stop events
    onStopAI: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onStopAI, result),

    // Removes browser tab
    removeTab: (tabID: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_remove_tab', {tabID});
      ipc.send(contextMenuChannels.removeTab, tabID);
    },
    // Listens for tab removal events
    onRemoveTab: (result: (event: IpcRendererEvent, tabID: string) => void) =>
      ipc.on(contextMenuChannels.onRemoveTab, result),
  },

  tab: {
    // Listens for new tab events
    onNewTab: (result: (event: IpcRendererEvent, url: string, background?: boolean) => void) =>
      ipc.on(tabsChannels.onNewTab, result),
  },

  contextItems: {
    // Copies selected text in browser
    copy: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_copy', {id});
      ipc.send(contextMenuChannels.copy, id);
    },
    // Cuts selected text in browser
    cut: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_cut', {id});
      ipc.send(contextMenuChannels.cut, id);
    },
    // Pastes clipboard content in browser
    paste: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_paste', {id});
      ipc.send(contextMenuChannels.paste, id);
    },
    // Replaces misspelled word in browser
    replaceMisspelling: (id: number, text: string) => {
      extensionRendererApi.events_ipc.emit('context_items_replace_misspelling', {id, text});
      ipc.send(contextMenuChannels.replaceMisspelling, id, text);
    },
    // Selects all text in browser
    selectAll: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_select_all', {id});
      ipc.send(contextMenuChannels.selectAll, id);
    },

    // Undoes last action in browser
    undo: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_undo', {id});
      ipc.send(contextMenuChannels.undo, id);
    },
    // Redoes last undone action in browser
    redo: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_redo', {id});
      ipc.send(contextMenuChannels.redo, id);
    },

    // Opens new tab with URL
    newTab: (url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_new_tab', {url});
      ipc.send(contextMenuChannels.newTab, url);
    },
    // Opens URL in default system browser
    openExternal: (url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_open_external', {url});
      ipc.send(contextMenuChannels.openExternal, url);
    },

    // Downloads image from URL
    downloadImage: (id: number, url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_download_image', {id, url});
      ipc.send(contextMenuChannels.downloadImage, id, url);
    },

    // Copies image to clipboard
    copyImage: (url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_copy_image', {url});
      ipc.send(contextMenuChannels.copyImage, url);
    },

    // Searches selected text with Google
    searchWithGoogle: (text: string) => {
      extensionRendererApi.events_ipc.emit('context_items_search_google', {text});
      ipc.send(contextMenuChannels.searchWithGoogle, text);
    },

    // Opens DevTools and inspects element at coordinates
    inspectElement: (id: number, x: number, y: number) => {
      extensionRendererApi.events_ipc.emit('context_items_inspect_element', {id, x, y});
      ipc.send(contextMenuChannels.inspectElement, id, x, y);
    },

    // Navigates browser (back, forward, or refresh)
    navigate: (id: number, action: 'back' | 'forward' | 'refresh') => {
      extensionRendererApi.events_ipc.emit('context_items_navigate', {id, action});
      ipc.send(contextMenuChannels.navigate, id, action);
    },
  },

  browser: {
    // Creates new browser webview instance
    createBrowser: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_create', {id});
      ipc.send(browserChannels.createBrowser, id);
    },
    // Removes browser webview instance
    removeBrowser: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_remove', {id});
      ipc.send(browserChannels.removeBrowser, id);
    },
    // Loads URL in browser webview
    loadURL: (id: string, url: string) => {
      extensionRendererApi.events_ipc.emit('browser_load_url', {id, url});
      ipc.send(browserChannels.loadURL, id, url);
    },
    // Sets browser webview visibility
    setVisible: (id: string, visible: boolean) => {
      extensionRendererApi.events_ipc.emit('browser_set_visible', {id, visible});
      ipc.send(browserChannels.setVisible, id, visible);
    },

    // Opens find in page dialog
    openFindInPage: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events_ipc.emit('browser_open_find_in_page', {id, customPosition});
      ipc.send(browserChannels.openFindInPage, id, customPosition);
    },
    // Opens zoom dialog
    openZoom: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_open_zoom', {id});
      ipc.send(browserChannels.openZoom, id);
    },
    // Opens volume control dialog
    openVolume: (data: {id: string; tabId: string; volume: number; muted: boolean; globalMuted: boolean}) =>
      ipc.send(browserChannels.openVolume, data),

    // Finds text in page
    findInPage: (id: string, value: string, options: FindInPageOptions) => {
      extensionRendererApi.events_ipc.emit('browser_find_in_page', {id, value, options});
      ipc.send(browserChannels.findInPage, id, value, options);
    },
    // Stops find in page operation
    stopFindInPage: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') => {
      extensionRendererApi.events_ipc.emit('browser_stop_find_in_page', {id, action});
      ipc.send(browserChannels.stopFindInPage, id, action);
    },

    // Focuses browser webview
    focusWebView: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_focus_web_view', {id});
      ipc.send(browserChannels.focusWebView, id);
    },

    // Clears browser cache
    clearCache: () => {
      extensionRendererApi.events_ipc.emit('browser_clear_cache', {});
      return ipc.invoke(browserChannels.clearCache);
    },
    // Clears browser cookies
    clearCookies: () => {
      extensionRendererApi.events_ipc.emit('browser_clear_cookies', {});
      return ipc.invoke(browserChannels.clearCookies);
    },

    // Sets zoom factor for browser webview
    setZoomFactor: (id: string, factor: number) => {
      extensionRendererApi.events_ipc.emit('browser_set_zoom_factor', {id, factor});
      ipc.send(browserChannels.setZoomFactor, id, factor);
    },
    // Reloads current page
    reload: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_reload', {id});
      ipc.send(browserChannels.reload, id);
    },
    // Stops loading current page
    stop: (id: string) => {
      ipc.send(browserChannels.stop, id);
    },
    // Navigates browser back
    goBack: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_go_back', {id});
      ipc.send(browserChannels.goBack, id);
    },
    // Navigates browser forward
    goForward: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_go_forward', {id});
      ipc.send(browserChannels.goForward, id);
    },

    // Toggles DevTools for browser webview
    toggleDevTools: (id: string) => {
      ipc.send(browserChannels.toggleDevTools, id);
    },

    // Listens for browser navigation availability (can go back/forward)
    onCanGo: (result: (event: IpcRendererEvent, id: string, canGo: CanGoType) => void) =>
      ipc.on(browserChannels.onCanGo, result),

    // Listens for browser loading state changes
    onIsLoading: (result: (event: IpcRendererEvent, id: string, isLoading: boolean) => void) =>
      ipc.on(browserChannels.isLoading, result),

    // Listens for browser page title changes
    onTitleChange: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(browserChannels.onTitleChange, result),

    // Listens for browser favicon changes
    onFavIconChange: (result: (event: IpcRendererEvent, id: string, faviconUrl: string) => void) =>
      ipc.on(browserChannels.onFavIconChange, result),

    // Listens for browser URL changes
    onUrlChange: (result: (event: IpcRendererEvent, id: string, url: string) => void) =>
      ipc.on(browserChannels.onUrlChange, result),

    // Listens for browser DOM ready state
    onDomReady: (result: (event: IpcRendererEvent, id: string, isReady: boolean) => void) =>
      ipc.on(browserChannels.onDomReady, result),

    // Gets user agent string
    getUserAgent: (type?: AgentTypes): Promise<string> => {
      extensionRendererApi.events_ipc.emit('browser_get_user_agent', {type});
      return ipc.invoke(browserChannels.getUserAgent, type);
    },
    // Updates user agent for all browsers
    updateUserAgent: () => {
      extensionRendererApi.events_ipc.emit('browser_update_user_agent', {});
      ipc.send(browserChannels.updateUserAgent);
    },

    // Adds offset to browser webview position
    addOffset: (id: string, offset: WHType) => {
      extensionRendererApi.events_ipc.emit('browser_add_offset', {id, offset});
      ipc.send(browserChannels.addOffset, id, offset);
    },

    // Clears browser history for selected URLs
    clearHistory: (selected: string[]) => ipc.send(browserChannels.clearHistory, selected),

    // Listens for failed URL load events
    onFailedLoadUrl: (
      result: (
        event: IpcRendererEvent,
        id: string,
        errorCode: number,
        errorDescription: string,
        validatedURL: string,
      ) => void,
    ) => ipc.on(browserChannels.onFailedLoadUrl, result),
    // Listens for cleared failed URL events
    onClearFailed: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(browserChannels.onClearFailed, result),
  },

  /** Managing browser volume and audio */
  volume: {
    // Sets volume level for browser webview (0-100)
    setVolume: async (id: string, volume: number): Promise<void> => {
      extensionRendererApi.events_ipc.emit('volume_set_volume', {id, volume});
      try {
        // Add timeout to IPC call (8 seconds - allows main process to handle its own timeout first)
        await Promise.race([
          ipc.invoke(volumeChannels.setVolume, id, volume),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Volume set operation timed out')), 8000)),
        ]);
      } catch {
        // Volume setting can fail during page load - this is expected and handled by main process
      }
    },

    // Sets mute state for browser webview
    setMuted: async (id: string, muted: boolean): Promise<void> => {
      extensionRendererApi.events_ipc.emit('volume_set_muted', {id, muted});
      try {
        // Add timeout to IPC call (8 seconds)
        await Promise.race([
          ipc.invoke(volumeChannels.setMuted, id, muted),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Mute set operation timed out')), 8000)),
        ]);
      } catch {
        // Mute setting can fail during page load - this is expected
      }
    },

    // Gets current audio state (playing, muted) for browser webview
    getState: async (id: string): Promise<AudioState | null> => {
      extensionRendererApi.events_ipc.emit('volume_get_state', {id});
      try {
        // Add timeout to IPC call (3 seconds)
        return await Promise.race([
          ipc.invoke(volumeChannels.getState, id),
          new Promise<AudioState | null>((_, reject) =>
            setTimeout(() => reject(new Error('Get audio state operation timed out')), 3000),
          ),
        ]);
      } catch (error) {
        console.error('Failed to get audio state:', error);
        return null;
      }
    },

    // Listens for audio state changes (media started/paused, mute state)
    onAudioStateChange: (callback: (id: string, state: AudioState) => void) => {
      const handler = (_: IpcRendererEvent, id: string, state: AudioState) => {
        try {
          callback(id, state);
        } catch (error) {
          console.error('Error in audio state change callback:', error);
        }
      };
      return ipc.on(volumeChannels.onAudioStateChange, handler);
    },

    // Updates tab volume from context menu (sends to main window)
    updateTabVolume: (tabId: string, volume: number) => {
      ipc.send(volumeChannels.updateTabVolume, tabId, volume);
    },

    // Updates tab muted state from context menu (sends to main window)
    updateTabMuted: (tabId: string, muted: boolean) => {
      ipc.send(volumeChannels.updateTabMuted, tabId, muted);
    },

    // Listens for tab volume updates from context menu
    onTabVolumeUpdate: (callback: (tabId: string, volume: number) => void) =>
      ipc.on(volumeChannels.onTabVolumeUpdate, (_: IpcRendererEvent, tabId: string, volume: number) =>
        callback(tabId, volume),
      ),

    // Listens for tab muted updates from context menu
    onTabMutedUpdate: (callback: (tabId: string, muted: boolean) => void) =>
      ipc.on(volumeChannels.onTabMutedUpdate, (_: IpcRendererEvent, tabId: string, muted: boolean) =>
        callback(tabId, muted),
      ),
  },

  statics: {
    // Pulls latest static data from server
    pull: (): Promise<void> => {
      extensionRendererApi.events_ipc.emit('statics_pull', {});
      return ipc.invoke(staticsChannels.pull);
    },
    // Gets app release information
    getReleases: (): Promise<AppUpdateData> => {
      extensionRendererApi.events_ipc.emit('statics_get_releases', {});
      return ipc.invoke(staticsChannels.getReleases);
    },
    // Gets insider build information
    getInsider: (): Promise<AppUpdateInsiderData> => {
      extensionRendererApi.events_ipc.emit('statics_get_insider', {});
      return ipc.invoke(staticsChannels.getInsider);
    },
    // Gets notification data
    getNotification: (): Promise<Notification_Data[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_notification', {});
      return ipc.invoke(staticsChannels.getNotification);
    },
    // Gets available modules list
    getModules: (): Promise<ModulesInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_modules', {});
      return ipc.invoke(staticsChannels.getModules);
    },
    // Gets available extensions list
    getExtensions: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions', {});
      return ipc.invoke(staticsChannels.getExtensions);
    },
    // Gets early access extensions list
    getExtensionsEA: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions_ea', {});
      return ipc.invoke(staticsChannels.getExtensionsEA);
    },
    // Gets Patreon supporters list
    getPatrons: (): Promise<PatreonSupporter[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_patrons', {});
      return ipc.invoke(staticsChannels.getPatrons);
    },
  },

  events: {
    // Sends event for card pre-command uninstall
    card_PreCommandUninstall: (preCommands: string[]) => ipc.send(eventsChannels.card_PreCommandUninstall, preCommands),
  },

  downloadManager: {
    // Listens for download count changes
    onDownloadCount: (result: (event: IpcRendererEvent, count: number) => void) =>
      ipc.on(browserDownloadChannels.mainDownloadCount, result),

    // Listens for download start events
    onDlStart: (result: (event: IpcRendererEvent, info: DownloadStartInfo) => void) =>
      ipc.on(browserDownloadChannels.onDlStart, result),

    // Listens for download progress events
    onProgress: (result: (event: IpcRendererEvent, info: DownloadManagerProgress) => void) =>
      ipc.on(browserDownloadChannels.onProgress, result),

    // Listens for download completion events
    onDone: (result: (event: IpcRendererEvent, info: DownloadDoneInfo) => void) =>
      ipc.on(browserDownloadChannels.onDone, result),

    // Opens downloads menu window
    openMenu: () => ipc.send(browserDownloadChannels.openDownloadsMenu),
    // Opens downloaded item or its folder
    openItem: (name: string, action: 'open' | 'openFolder') => ipc.send(browserDownloadChannels.openItem, name, action),
    // Cancels download
    cancel: (name: string) => ipc.send(browserDownloadChannels.cancel, name),
    // Pauses download
    pause: (name: string) => ipc.send(browserDownloadChannels.pause, name),
    // Resumes paused download
    resume: (name: string) => ipc.send(browserDownloadChannels.resume, name),
    // Clears completed download from list
    clear: (name: string) => ipc.send(browserDownloadChannels.clear, name),
    // Clears all downloads from list
    clearAll: () => ipc.send(browserDownloadChannels.clearAll),

    // Gets current download location
    getDownloadLocation: (): Promise<{success: boolean; path?: string; error?: string}> =>
      ipc.invoke(browserDownloadChannels.getDownloadLocation),
    // Sets download location
    setDownloadLocation: (path: string): Promise<{success: boolean; error?: string}> =>
      ipc.invoke(browserDownloadChannels.setDownloadLocation, path),
    // Opens location selection dialog
    openLocationDialog: (): Promise<{success: boolean; path?: string; error?: string}> =>
      ipc.invoke(browserDownloadChannels.openLocationDialog),
    // Gets download behavior setting
    getDownloadBehavior: (): Promise<{success: boolean; behavior?: 'ask' | 'default'; error?: string}> =>
      ipc.invoke(browserDownloadChannels.getDownloadBehavior),
    // Sets download behavior
    setDownloadBehavior: (behavior: 'ask' | 'default'): Promise<{success: boolean; error?: string}> =>
      ipc.invoke(browserDownloadChannels.setDownloadBehavior, behavior),
  },

  customNotification: {
    // Listens for custom notification open events
    onOpen: (result: (event: IpcRendererEvent, info: CustomNotificationInfo) => void) =>
      ipc.on(customNotifChannels.onOpen, result),
    // Listens for custom notification close events
    onClose: (result: (event: IpcRendererEvent, key: string) => void) => ipc.on(customNotifChannels.onClose, result),

    // Sends button press event for custom notification
    btnPress: (btnId: string, notifKey: string) => ipc.send(customNotifChannels.onBtnPress, btnId, notifKey),
  },

  init: {
    // Checks if Git is installed and returns version
    checkGitInstalled: (): Promise<string | undefined> => ipc.invoke(initChannels.checkGitInstalled),
    // Checks if PowerShell 7 is installed and returns version
    checkPwsh7Installed: (): Promise<string | undefined> => ipc.invoke(initChannels.checkPwsh7Installed),
  },

  patreon: {
    // Gets Patreon user information
    getInfo: (): Promise<PatreonUserData> => ipc.invoke(patreonChannels.getInfo),
    // Logs in to Patreon
    login: (): Promise<PatreonUserData> => ipc.invoke(patreonChannels.login),
    // Logs out from Patreon
    logout: (): Promise<void> => ipc.invoke(patreonChannels.logout),
    // Updates Patreon subscription channel
    updateChannel: (channel: SubscribeStages | 'get'): void => ipc.send(patreonChannels.updateChannel, channel),

    // Listens for Patreon release channel changes
    onReleaseChannel: (result: (event: IpcRendererEvent, stage: SubscribeStages) => void) =>
      ipc.on(patreonChannels.onReleaseChannel, result),
  },

  /** Image caching system using lynxcache:// protocol */
  imageCache: {
    // Gets cache statistics (entry count, total size, last cleanup)
    getStats: (): Promise<{
      entryCount: number;
      totalSize: number;
      totalSizeFormatted: string;
      lastCleanup: number;
      lastCleanupFormatted: string;
    }> => ipc.invoke(imageCacheChannels.getStats),

    // Clears all cached images
    clearCache: (): Promise<{success: boolean; clearedEntries: number}> => ipc.invoke(imageCacheChannels.clearCache),

    // Triggers manual cache cleanup (removes expired entries)
    triggerCleanup: (): Promise<{success: boolean}> => ipc.invoke(imageCacheChannels.triggerCleanup),

    // Converts a URL to a cache URL (lynxcache://fetch/...)
    getCacheUrl: (url: string): Promise<string> => ipc.invoke(imageCacheChannels.getCacheUrl, url),

    /**
     * Generates a cache URL for a given image URL (sync, no IPC).
     * Use this URL in img src to load images through the cache.
     * @param url - The original image URL
     * @returns The cache protocol URL
     */
    toCacheUrl: (url: string): string => `lynxcache://fetch/${encodeURIComponent(url)}`,

    /**
     * Checks if a URL is already a cache URL
     * @param url - The URL to check
     * @returns True if the URL is a cache URL
     */
    isCacheUrl: (url: string): boolean => url.startsWith('lynxcache://'),
  },
};

export default rendererIpc;
