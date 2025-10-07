// RendererIpc.ts
import {ContextMenuParams, FindInPageOptions, IpcRendererEvent, OpenDialogOptions} from 'electron';

import {
  AppUpdateData,
  AppUpdateInsiderData,
  ChosenArgumentsData,
  CustomNotificationInfo,
  DiscordRPC,
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
import {
  AgentTypes,
  appDataChannels,
  appUpdateChannels,
  AppUpdateEventTypes,
  AppUpdateStatus,
  appWindowChannels,
  browserChannels,
  BrowserHistoryData,
  CanGoType,
  ChangeWindowState,
  contextMenuChannels,
  CustomRunBehaviorData,
  DarkModeTypes,
  DiscordRunningAI,
  DownloadProgress,
  eventsChannels,
  ExtensionsData,
  ExtensionsUpdateStatus,
  fileChannels,
  gitChannels,
  GitProgressCallback,
  HomeCategory,
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
  PtyProcessOpt,
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
    changeWinState: (state: ChangeWindowState): void => {
      extensionRendererApi.events_ipc.emit('win_change_state', {state});
      ipc.send(winChannels.changeState, state);
    },
    onChangeState: (result: (event: IpcRendererEvent, result: WinStateChange) => void) =>
      ipc.on(winChannels.onChangeState, result),

    setDarkMode: (darkMode: DarkModeTypes): void => {
      extensionRendererApi.events_ipc.emit('win_set_dark_mode', {darkMode});
      ipc.send(winChannels.setDarkMode, darkMode);
    },
    getSystemDarkMode: (): Promise<'light' | 'dark'> => {
      extensionRendererApi.events_ipc.emit('win_get_system_dark_mode', {});
      return ipc.invoke(winChannels.getSystemDarkMode);
    },
    onDarkMode: (result: (event: IpcRendererEvent, darkMode: DarkModeTypes) => void) =>
      ipc.on(winChannels.onDarkMode, result),

    setTaskBarStatus: (status: TaskbarStatus): void => {
      extensionRendererApi.events_ipc.emit('win_set_taskbar_status', {status});
      ipc.send(winChannels.setTaskBarStatus, status);
    },

    setDiscordRP: (discordRp: DiscordRPC): void => {
      extensionRendererApi.events_ipc.emit('win_set_discord_rp', {discordRp});
      ipc.send(winChannels.setDiscordRP, discordRp);
    },

    setDiscordRpAiRunning: (status: DiscordRunningAI): void => {
      extensionRendererApi.events_ipc.emit('win_set_discord_rp_ai_running', {status});
      ipc.send(winChannels.setDiscordRpAiRunning, status);
    },

    getSystemInfo: (): Promise<SystemInfo> => {
      extensionRendererApi.events_ipc.emit('win_get_system_info', {});
      return ipc.invoke(winChannels.getSystemInfo);
    },

    openUrlDefaultBrowser: (url: string): void => {
      extensionRendererApi.events_ipc.emit('win_open_url_default_browser', {url});
      ipc.send(winChannels.openUrlDefaultBrowser, url);
    },
  },

  /** Managing files and directories */
  file: {
    openDlg: (option: OpenDialogOptions): Promise<string | undefined> => {
      extensionRendererApi.events_ipc.emit('file_open_dialog', {option});
      return ipc.invoke(fileChannels.dialog, option);
    },

    openPath: (dir: string): void => {
      extensionRendererApi.events_ipc.emit('file_open_path', {dir});
      ipc.send(fileChannels.openPath, dir);
    },

    getAppDirectories: (name: FolderNames): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_app_directories', {name});
      return ipc.invoke(fileChannels.getAppDirectories, name);
    },

    removeDir: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('file_remove_dir', {dir});
      return ipc.invoke(fileChannels.removeDir, dir);
    },

    trashDir: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('file_trash_dir', {dir});
      return ipc.invoke(fileChannels.trashDir, dir);
    },

    listDir: (dirPath: string, relatives: string[]): Promise<FolderListData[]> => {
      extensionRendererApi.events_ipc.emit('file_list_dir', {dirPath, relatives});
      return ipc.invoke(fileChannels.listDir, dirPath, relatives);
    },

    checkFilesExist: (dir: string, fileNames: string[]) => {
      extensionRendererApi.events_ipc.emit('file_check_files_exist', {dir, fileNames});
      return ipc.invoke(fileChannels.checkFilesExist, dir, fileNames);
    },

    calcFolderSize: (dir: string) => {
      extensionRendererApi.events_ipc.emit('file_calc_folder_size', {dir});
      return ipc.invoke(fileChannels.calcFolderSize, dir);
    },
    getRelativePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_relative_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getRelativePath, basePath, targetPath);
    },
    getAbsolutePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('file_get_absolute_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getAbsolutePath, basePath, targetPath);
    },

    isEmptyDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('file_is_empty_dir', {dir});
      return ipc.invoke(fileChannels.isEmptyDir, dir);
    },
  },

  /** Git operations */
  git: {
    cloneShallow: (url: string, directory: string, singleBranch: boolean, depth?: number, branch?: string): void => {
      extensionRendererApi.events_ipc.emit('git_clone_shallow', {url, directory, singleBranch, depth, branch});
      ipc.send(gitChannels.cloneShallow, url, directory, singleBranch, depth, branch);
    },
    cloneShallowPromise: (
      url: string,
      directory: string,
      singleBranch: boolean,
      depth?: number,
      branch?: string,
    ): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_clone_shallow_promise', {
        url,
        directory,
        singleBranch,
        depth,
        branch,
      });
      return ipc.invoke(gitChannels.cloneShallowPromise, url, directory, singleBranch, depth, branch);
    },
    getRepoInfo: (dir: string): Promise<RepositoryInfo> => {
      extensionRendererApi.events_ipc.emit('git_get_repo_info', {dir});
      return ipc.invoke(gitChannels.getRepoInfo, dir);
    },
    changeBranch: (dir: string, branchName: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_change_branch', {dir, branchName});
      return ipc.invoke(gitChannels.changeBranch, dir, branchName);
    },
    unShallow: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_unshallow', {dir});
      return ipc.invoke(gitChannels.unShallow, dir);
    },
    resetHard: (dir: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('git_reset_hard', {dir});
      return ipc.invoke(gitChannels.resetHard, dir);
    },

    validateGitDir: (dir: string, url: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('git_validate_git_dir', {dir, url});
      return ipc.invoke(gitChannels.validateGitDir, dir, url);
    },

    onProgress: (callback: GitProgressCallback) => ipc.on(gitChannels.onProgress, callback),
    offProgress: () => ipc.removeAllListeners(gitChannels.onProgress),

    pull: (repoDir: string, id: string): void => {
      extensionRendererApi.events_ipc.emit('git_pull', {repoDir, id});
      ipc.send(gitChannels.pull, repoDir, id);
    },
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
    cardUpdateAvailable: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('module_card_update_available', {card, updateType});
      return ipc.invoke(modulesChannels.cardUpdateAvailable, card, updateType);
    },
    uninstallCardByID: (id: string): Promise<void> => {
      extensionRendererApi.events_ipc.emit('module_uninstall_card_by_id', {id});
      return ipc.invoke(modulesChannels.uninstallCardByID, id);
    },
    checkCardsUpdateInterval: (updateType: {id: string; type: 'git' | 'stepper'}[]) => {
      extensionRendererApi.events_ipc.emit('module_check_cards_update_interval', {updateType});
      ipc.send(modulesChannels.checkCardsUpdateInterval, updateType);
    },
    onCardsUpdateAvailable: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(modulesChannels.onCardsUpdateAvailable, result),
  },

  moduleApi: {
    getFolderCreationTime: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_folder_creation_time', {dir});
      return ipc.invoke(moduleApiChannels.getFolderCreationTime, dir);
    },
    getLastPulledDate: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_last_pulled_date', {dir});
      return ipc.invoke(moduleApiChannels.getLastPulledDate, dir);
    },
    getCurrentReleaseTag: (dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('module_api_get_current_release_tag', {dir});
      return ipc.invoke(moduleApiChannels.getCurrentReleaseTag, dir);
    },
  },

  plugins: {
    getList: (stage: SubscribeStages): Promise<PluginItem[]> => ipc.invoke(pluginChannels.getList, stage),
    getAddresses: (): Promise<PluginAddresses> => ipc.invoke(pluginChannels.getAddresses),
    getInstalledList: (): Promise<PluginInstalledItem[]> => ipc.invoke(pluginChannels.getInstalledList),
    getUnloadedList: (): Promise<UnloadedPlugins[]> => ipc.invoke(pluginChannels.getUnloadedList),

    install: (url: string, commitHash?: string): Promise<boolean> =>
      ipc.invoke(pluginChannels.install, url, commitHash),
    uninstall: (id: string): Promise<boolean> => ipc.invoke(pluginChannels.uninstall, id),
    update: (id: string): Promise<boolean> => ipc.invoke(pluginChannels.update, id),
    syncAll: (): Promise<void> => ipc.invoke(pluginChannels.syncAll),
    checkForSync: (stage: SubscribeStages): Promise<void> => ipc.invoke(pluginChannels.checkForSync, stage),

    onSyncAvailable: (result: (event: IpcRendererEvent, cards: PluginSyncItem[]) => void) =>
      ipc.on(pluginChannels.onSyncAvailable, result),
  },

  /** Utilities methods for working with app storage data */
  storageUtils: {
    addInstalledCard: (cardData: InstalledCard): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_installed_card', {cardData});
      ipc.send(storageUtilsChannels.addInstalledCard, cardData);
    },
    removeInstalledCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_installed_card', {cardId});
      ipc.send(storageUtilsChannels.removeInstalledCard, cardId);
    },
    onInstalledCards: (result: (event: IpcRendererEvent, cards: InstalledCards) => void) =>
      ipc.on(storageUtilsChannels.onInstalledCards, result),

    addAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateCard, cardId);
    },
    removeAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateCard, cardId);
    },
    onAutoUpdateCards: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateCards, result),

    addAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateExtensions, cardId);
    },
    removeAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateExtensions, cardId);
    },
    onAutoUpdateExtensions: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateExtensions, result),

    pinnedCards: (opt: StorageOperation, id: string, pinnedCards?: string[]): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pinned_cards', {opt, id, pinnedCards});
      return ipc.invoke(storageUtilsChannels.pinnedCards, opt, id, pinnedCards);
    },
    onPinnedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onPinnedCardsChange, result),

    preCommands: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pre_commands', {opt, data});
      return ipc.invoke(storageUtilsChannels.preCommands, opt, data);
    },
    onPreCommands: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onPreCommands, result),
    offPreCommands: (): void => ipc.removeAllListeners(storageUtilsChannels.onPreCommands),

    customRun: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_custom_run', {opt, data});
      return ipc.invoke(storageUtilsChannels.customRun, opt, data);
    },
    onCustomRun: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onCustomRun, result),
    offCustomRun: (): void => ipc.removeAllListeners(storageUtilsChannels.onCustomRun),

    updateCustomRunBehavior: (data: CustomRunBehaviorData) => {
      extensionRendererApi.events_ipc.emit('storage_utils_update_custom_run_behavior', {data});
      ipc.send(storageUtilsChannels.customRunBehavior, data);
    },

    preOpen: (opt: StorageOperation, open: PreOpen): Promise<PreOpenData | undefined> => {
      extensionRendererApi.events_ipc.emit('storage_utils_pre_open', {opt, open});
      return ipc.invoke(storageUtilsChannels.preOpen, opt, open);
    },

    getCardArguments: (cardId: string): Promise<ChosenArgumentsData> => {
      extensionRendererApi.events_ipc.emit('storage_utils_get_card_arguments', {cardId});
      return ipc.invoke(storageUtilsChannels.getCardArguments, cardId);
    },
    setCardArguments: (cardId: string, args: ChosenArgumentsData): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_card_arguments', {cardId, args});
      return ipc.invoke(storageUtilsChannels.setCardArguments, cardId, args);
    },

    recentlyUsedCards: (opt: RecentlyOperation, id: string): Promise<string[]> => {
      extensionRendererApi.events_ipc.emit('storage_utils_recently_used_cards', {opt, id});
      return ipc.invoke(storageUtilsChannels.recentlyUsedCards, opt, id);
    },
    onRecentlyUsedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onRecentlyUsedCardsChange, result),

    homeCategory: (opt: StorageOperation, data: HomeCategory): Promise<HomeCategory> => {
      extensionRendererApi.events_ipc.emit('storage_utils_home_category', {opt, data});
      return ipc.invoke(storageUtilsChannels.homeCategory, opt, data);
    },
    onHomeCategory: (result: (event: IpcRendererEvent, data: HomeCategory) => void) =>
      ipc.on(storageUtilsChannels.onHomeCategory, result),
    setSystemStartup: (startup: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_system_startup', {startup});
      ipc.send(storageUtilsChannels.setSystemStartup, startup);
    },

    updateZoomFactor: (zoomFactor: number) => {
      extensionRendererApi.events_ipc.emit('storage_utils_update_zoom_factor', {zoomFactor});
      ipc.send(storageUtilsChannels.updateZoomFactor, zoomFactor);
    },

    addBrowserRecent: (recentEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_recent', {recentEntry});
      ipc.send(storageUtilsChannels.addBrowserRecent, recentEntry);
    },
    addBrowserFavorite: (favoriteEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_favorite', {favoriteEntry});
      ipc.send(storageUtilsChannels.addBrowserFavorite, favoriteEntry);
    },
    addBrowserHistory: (historyEntry: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_history', {historyEntry});
      ipc.send(storageUtilsChannels.addBrowserHistory, historyEntry);
    },
    addBrowserRecentFavIcon: (url: string, favIcon: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_browser_recent_favicon', {url, favIcon});
      ipc.send(storageUtilsChannels.addBrowserRecentFavIcon, url, favIcon);
    },
    removeBrowserRecent: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_recent', {url});
      ipc.send(storageUtilsChannels.removeBrowserRecent, url);
    },
    removeBrowserFavorite: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_favorite', {url});
      ipc.send(storageUtilsChannels.removeBrowserFavorite, url);
    },
    removeBrowserHistory: (url: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_remove_browser_history', {url});
      ipc.send(storageUtilsChannels.removeBrowserHistory, url);
    },

    setShowConfirm: (type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_set_show_confirm', {type, enable});
      ipc.send(storageUtilsChannels.setShowConfirm, type, enable);
    },

    onConfirmChange: (
      result: (
        event: IpcRendererEvent,
        type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm',
        enable: boolean,
      ) => void,
    ) => ipc.on(storageUtilsChannels.onConfirmChange, result),

    addReadNotif: (id: string) => {
      extensionRendererApi.events_ipc.emit('storage_utils_add_read_notif', {id});
      ipc.send(storageUtilsChannels.addReadNotif, id);
    },

    setCardTerminalPreCommands: (id: string, commands: string[]) => {
      extensionRendererApi.events_ipc.emit('storage_utils_setCardTerminalPreCommands', {id, commands});
      ipc.send(storageUtilsChannels.setCardTerminalPreCommands, id, commands);
    },

    unassignCard: (id: string, clearConfigs: boolean) => {
      extensionRendererApi.events_ipc.emit('storage_utils_unassignCard', {id, clearConfigs});
      return ipc.invoke(storageUtilsChannels.unassignCard, id, clearConfigs);
    },

    getBrowserHistoryData: (): Promise<BrowserHistoryData> => ipc.invoke(storageUtilsChannels.getBrowserHistoryData),
  },

  /** Utilities methods */
  utils: {
    updateAllExtensions: (data: {id: string; dir: string}): void => {
      extensionRendererApi.events_ipc.emit('utils_update_all_extensions', {data});
      ipc.send(utilsChannels.updateAllExtensions, data);
    },
    onUpdateAllExtensions: (result: (event: IpcRendererEvent, updateInfo: OnUpdatingExtensions) => void) =>
      ipc.on(utilsChannels.onUpdateAllExtensions, result),

    offUpdateAllExtensions: () => ipc.removeAllListeners(utilsChannels.onUpdateAllExtensions),

    getExtensionsDetails: (dir: string): Promise<ExtensionsData> => {
      extensionRendererApi.events_ipc.emit('utils_get_extensions_details', {dir});
      return ipc.invoke(utilsChannels.extensionsDetails, dir);
    },

    getExtensionsUpdateStatus: (dir: string): Promise<ExtensionsUpdateStatus> => {
      extensionRendererApi.events_ipc.emit('utils_get_extensions_update_status', {dir});
      return ipc.invoke(utilsChannels.updateStatus, dir);
    },

    disableExtension: (disable: boolean, dir: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('utils_disable_extension', {disable, dir});
      return ipc.invoke(utilsChannels.disableExtension, disable, dir);
    },

    cancelExtensionsData: (): void => {
      extensionRendererApi.events_ipc.emit('utils_cancel_extensions_data', {});
      ipc.send(utilsChannels.cancelExtensionsData);
    },

    downloadFile: (url: string): void => {
      extensionRendererApi.events_ipc.emit('utils_download_file', {url});
      ipc.send(utilsChannels.downloadFile, url);
    },
    cancelDownload: (): void => {
      extensionRendererApi.events_ipc.emit('utils_cancel_download', {});
      ipc.send(utilsChannels.cancelDownload);
    },
    onDownloadFile: (result: (event: IpcRendererEvent, progress: DownloadProgress) => void) =>
      ipc.on(utilsChannels.onDownloadFile, result),
    offDownloadFile: (): void => ipc.removeAllListeners(utilsChannels.onDownloadFile),

    decompressFile: (filePath: string): Promise<string> => {
      extensionRendererApi.events_ipc.emit('utils_decompress_file', {filePath});
      return ipc.invoke(utilsChannels.decompressFile, filePath);
    },

    isResponseValid: (url: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('utils_is_response_valid', {url});
      return ipc.invoke(utilsChannels.isResponseValid, url);
    },
    getImageAsDataURL: (url: string): Promise<string | null> => {
      extensionRendererApi.events_ipc.emit('utils_get_image_as_data_url', {url});
      return ipc.invoke(utilsChannels.getImageAsDataURL, url);
    },
  },

  /** Managing and using node_pty(Pseudo Terminal ) */
  pty: {
    process: (id: string, opt: PtyProcessOpt, cardId: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process', {id, opt, cardId});
      ipc.send(ptyChannels.process, id, opt, cardId);
    },
    customProcess: (id: string, opt: PtyProcessOpt, dir?: string, file?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom', {id, opt, dir, file});
      ipc.send(ptyChannels.customProcess, id, opt, dir, file);
    },
    emptyProcess: (id: string, opt: PtyProcessOpt, dir?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_empty', {id, opt, dir});
      ipc.send(ptyChannels.emptyProcess, id, opt, dir);
    },
    customCommands: (id: string, opt: PtyProcessOpt, commands?: string | string[], dir?: string) => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom_command', {id, opt, commands, dir});
      ipc.send(ptyChannels.customCommands, id, opt, commands, dir);
    },

    write: (id: string, data: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_write', {id, data});
      ipc.send(ptyChannels.write, id, data);
    },

    clear: (id: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_clear', {id});
      ipc.send(ptyChannels.clear, id);
    },

    resize: (id: string, cols: number, rows: number): void => {
      extensionRendererApi.events_ipc.emit('terminal_resize', {id, cols, rows});
      ipc.send(ptyChannels.resize, id, cols, rows);
    },

    onData: (result: (event: IpcRendererEvent, id: string, data: string) => void) => ipc.on(ptyChannels.onData, result),
    onTitle: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(ptyChannels.onTitle, result),
    onExit: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(ptyChannels.onExit, result),

    offData: (): void => ipc.removeAllListeners(ptyChannels.onData),
    offTitle: (): void => ipc.removeAllListeners(ptyChannels.onTitle),
    offExit: (): void => ipc.removeAllListeners(ptyChannels.onExit),
  },

  /** Managing app automatic updates */
  appUpdate: {
    statusError: (result: (event: IpcRendererEvent) => void) => ipc.on(appUpdateChannels.statusError, result),
    offStatusError: (): void => ipc.removeAllListeners(appUpdateChannels.statusError),

    status: (result: (event: IpcRendererEvent, type: AppUpdateEventTypes, status: AppUpdateStatus) => void) =>
      ipc.on(appUpdateChannels.status, result),

    offStatus: (): void => ipc.removeAllListeners(appUpdateChannels.status),

    download: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_download', {});
      ipc.send(appUpdateChannels.download);
    },

    cancel: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_cancel', {});
      ipc.send(appUpdateChannels.cancel);
    },

    install: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_install', {});
      ipc.send(appUpdateChannels.install);
    },
  },

  /** Managing app data directories */
  appData: {
    getCurrentPath: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_get_current_path', {});
      return ipc.invoke(appDataChannels.getCurrentPath);
    },

    selectAnother: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_select_another', {});
      return ipc.invoke(appDataChannels.selectAnother);
    },

    isAppDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('app_data_is_app_dir', {dir});
      return ipc.invoke(appDataChannels.isAppDir, dir);
    },
  },

  /** Managing app storage data */
  storage: {
    getCustom: (key: string): Promise<any> => {
      extensionRendererApi.events_ipc.emit('storage_get_custom', {key});
      return ipc.invoke(storageChannels.getCustom, key);
    },
    setCustom: (key: string, data: any): void => {
      extensionRendererApi.events_ipc.emit('storage_set_custom', {key, data});
      ipc.send(storageChannels.setCustom, key, data);
    },

    get: <K extends keyof StorageTypes>(key: K): Promise<StorageTypes[K]> => {
      extensionRendererApi.events_ipc.emit('storage_get', {key});
      return ipc.invoke(storageChannels.get, key);
    },

    getAll: (): Promise<StorageTypes> => {
      extensionRendererApi.events_ipc.emit('storage_get_all', {});
      return ipc.invoke(storageChannels.getAll);
    },

    update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_update', {key, updateData});
      return ipc.invoke(storageChannels.update, key, updateData);
    },

    clear: (): Promise<void> => {
      extensionRendererApi.events_ipc.emit('storage_clear', {});
      return ipc.invoke(storageChannels.clear);
    },
  },

  appWindow: {
    onHotkeysChange: (result: (event: IpcRendererEvent, input: LynxInput) => void) =>
      ipc.on(appWindowChannels.hotkeysChange, result),
    offHotkeysChange: () => ipc.removeAllListeners(appWindowChannels.hotkeysChange),

    onShowToast: (result: (event: IpcRendererEvent, message: string, type: ShowToastTypes) => void) =>
      ipc.on(appWindowChannels.showToast, result),
    offShowToast: () => ipc.removeAllListeners(appWindowChannels.showToast),
  },

  contextMenu: {
    resizeWindow: (dimensions: {width: number; height: number}) => {
      extensionRendererApi.events_ipc.emit('context_menu_resize_window', {dimensions});
      ipc.send(contextMenuChannels.resizeWindow, dimensions);
    },
    showWindow: () => {
      extensionRendererApi.events_ipc.emit('context_menu_show_window', {});
      ipc.send(contextMenuChannels.showWindow);
    },
    hideWindow: () => {
      extensionRendererApi.events_ipc.emit('context_menu_hide_window', {});
      ipc.send(contextMenuChannels.hideWindow);
    },

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
    offInitView: () => ipc.removeAllListeners(contextMenuChannels.onInitView),

    openTerminateAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_open_terminate_ai', {id});
      ipc.send(contextMenuChannels.openTerminateAI, id);
    },
    openTerminateTab: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events_ipc.emit('context_menu_open_terminate_tab', {id, customPosition});
      ipc.send(contextMenuChannels.openTerminateTab, id, customPosition);
    },
    openCloseApp: () => {
      extensionRendererApi.events_ipc.emit('context_menu_open_close_app', {});
      ipc.send(contextMenuChannels.openCloseApp);
    },

    onFind: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onFind, result),
    offFind: () => ipc.removeAllListeners(contextMenuChannels.onFind),

    onTerminateAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onTerminateAI, result),
    offTerminateAI: () => ipc.removeAllListeners(contextMenuChannels.onTerminateAI),

    onTerminateTab: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onTerminateTab, result),
    offTerminateTab: () => ipc.removeAllListeners(contextMenuChannels.onTerminateTab),

    onCloseApp: (result: (event: IpcRendererEvent) => void) => ipc.on(contextMenuChannels.onCloseApp, result),
    offCloseApp: () => ipc.removeAllListeners(contextMenuChannels.onCloseApp),

    onZoom: (result: (event: IpcRendererEvent, id: string, zoomFactor: number) => void) =>
      ipc.on(contextMenuChannels.onZoom, result),
    offZoom: () => ipc.removeAllListeners(contextMenuChannels.onZoom),

    relaunchAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_relaunch_ai', {id});
      ipc.send(contextMenuChannels.relaunchAI, id);
    },
    onRelaunchAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onRelaunchAI, result),
    offRelaunchAI: () => ipc.removeAllListeners(contextMenuChannels.onRelaunchAI),

    stopAI: (id: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_stop_ai', {id});
      ipc.send(contextMenuChannels.stopAI, id);
    },
    onStopAI: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onStopAI, result),
    offStopAI: () => ipc.removeAllListeners(contextMenuChannels.onStopAI),

    removeTab: (tabID: string) => {
      extensionRendererApi.events_ipc.emit('context_menu_remove_tab', {tabID});
      ipc.send(contextMenuChannels.removeTab, tabID);
    },
    onRemoveTab: (result: (event: IpcRendererEvent, tabID: string) => void) =>
      ipc.on(contextMenuChannels.onRemoveTab, result),
    offRemoveTab: () => ipc.removeAllListeners(contextMenuChannels.onRemoveTab),
  },

  tab: {
    onNewTab: (result: (event: IpcRendererEvent, url: string) => void) => ipc.on(tabsChannels.onNewTab, result),

    offNewTab: () => ipc.removeAllListeners(tabsChannels.onNewTab),
  },

  contextItems: {
    copy: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_copy', {id});
      ipc.send(contextMenuChannels.copy, id);
    },
    paste: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_paste', {id});
      ipc.send(contextMenuChannels.paste, id);
    },
    replaceMisspelling: (id: number, text: string) => {
      extensionRendererApi.events_ipc.emit('context_items_replace_misspelling', {id, text});
      ipc.send(contextMenuChannels.replaceMisspelling, id, text);
    },
    selectAll: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_select_all', {id});
      ipc.send(contextMenuChannels.selectAll, id);
    },

    undo: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_undo', {id});
      ipc.send(contextMenuChannels.undo, id);
    },
    redo: (id: number) => {
      extensionRendererApi.events_ipc.emit('context_items_redo', {id});
      ipc.send(contextMenuChannels.redo, id);
    },

    newTab: (url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_new_tab', {url});
      ipc.send(contextMenuChannels.newTab, url);
    },
    openExternal: (url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_open_external', {url});
      ipc.send(contextMenuChannels.openExternal, url);
    },

    downloadImage: (id: number, url: string) => {
      extensionRendererApi.events_ipc.emit('context_items_download_image', {id, url});
      ipc.send(contextMenuChannels.downloadImage, id, url);
    },

    navigate: (id: number, action: 'back' | 'forward' | 'refresh') => {
      extensionRendererApi.events_ipc.emit('context_items_navigate', {id, action});
      ipc.send(contextMenuChannels.navigate, id, action);
    },
  },

  browser: {
    createBrowser: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_create', {id});
      ipc.send(browserChannels.createBrowser, id);
    },
    removeBrowser: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_remove', {id});
      ipc.send(browserChannels.removeBrowser, id);
    },
    loadURL: (id: string, url: string) => {
      extensionRendererApi.events_ipc.emit('browser_load_url', {id, url});
      ipc.send(browserChannels.loadURL, id, url);
    },
    setVisible: (id: string, visible: boolean) => {
      extensionRendererApi.events_ipc.emit('browser_set_visible', {id, visible});
      ipc.send(browserChannels.setVisible, id, visible);
    },

    openFindInPage: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events_ipc.emit('browser_open_find_in_page', {id, customPosition});
      ipc.send(browserChannels.openFindInPage, id, customPosition);
    },
    openZoom: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_open_zoom', {id});
      ipc.send(browserChannels.openZoom, id);
    },

    findInPage: (id: string, value: string, options: FindInPageOptions) => {
      extensionRendererApi.events_ipc.emit('browser_find_in_page', {id, value, options});
      ipc.send(browserChannels.findInPage, id, value, options);
    },
    stopFindInPage: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') => {
      extensionRendererApi.events_ipc.emit('browser_stop_find_in_page', {id, action});
      ipc.send(browserChannels.stopFindInPage, id, action);
    },

    focusWebView: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_focus_web_view', {id});
      ipc.send(browserChannels.focusWebView, id);
    },

    clearCache: () => {
      extensionRendererApi.events_ipc.emit('browser_clear_cache', {});
      ipc.send(browserChannels.clearCache);
    },
    clearCookies: () => {
      extensionRendererApi.events_ipc.emit('browser_clear_cookies', {});
      ipc.send(browserChannels.clearCookies);
    },

    setZoomFactor: (id: string, factor: number) => {
      extensionRendererApi.events_ipc.emit('browser_set_zoom_factor', {id, factor});
      ipc.send(browserChannels.setZoomFactor, id, factor);
    },
    reload: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_reload', {id});
      ipc.send(browserChannels.reload, id);
    },
    goBack: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_go_back', {id});
      ipc.send(browserChannels.goBack, id);
    },
    goForward: (id: string) => {
      extensionRendererApi.events_ipc.emit('browser_go_forward', {id});
      ipc.send(browserChannels.goForward, id);
    },

    onCanGo: (result: (event: IpcRendererEvent, id: string, canGo: CanGoType) => void) =>
      ipc.on(browserChannels.onCanGo, result),
    offCanGo: () => ipc.removeAllListeners(browserChannels.onCanGo),

    onIsLoading: (result: (event: IpcRendererEvent, id: string, isLoading: boolean) => void) =>
      ipc.on(browserChannels.isLoading, result),
    offIsLoading: () => ipc.removeAllListeners(browserChannels.isLoading),

    onTitleChange: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(browserChannels.onTitleChange, result),
    offTitleChange: () => ipc.removeAllListeners(browserChannels.onTitleChange),

    onFavIconChange: (result: (event: IpcRendererEvent, id: string, faviconUrl: string) => void) =>
      ipc.on(browserChannels.onFavIconChange, result),
    offFavIconChange: () => ipc.removeAllListeners(browserChannels.onFavIconChange),

    onUrlChange: (result: (event: IpcRendererEvent, id: string, url: string) => void) =>
      ipc.on(browserChannels.onUrlChange, result),
    offUrlChange: () => ipc.removeAllListeners(browserChannels.onUrlChange),

    onDomReady: (result: (event: IpcRendererEvent, id: string, isReady: boolean) => void) =>
      ipc.on(browserChannels.onDomReady, result),
    offDomReady: () => ipc.removeAllListeners(browserChannels.onDomReady),

    getUserAgent: (type?: AgentTypes): Promise<string> => {
      extensionRendererApi.events_ipc.emit('browser_get_user_agent', {type});
      return ipc.invoke(browserChannels.getUserAgent, type);
    },
    updateUserAgent: () => {
      extensionRendererApi.events_ipc.emit('browser_update_user_agent', {});
      ipc.send(browserChannels.updateUserAgent);
    },

    addOffset: (id: string, offset: WHType) => {
      extensionRendererApi.events_ipc.emit('browser_add_offset', {id, offset});
      ipc.send(browserChannels.addOffset, id, offset);
    },

    clearHistory: (selected: string[]) => ipc.send(browserChannels.clearHistory, selected),
  },

  statics: {
    pull: (): Promise<void> => {
      extensionRendererApi.events_ipc.emit('statics_pull', {});
      return ipc.invoke(staticsChannels.pull);
    },
    getReleases: (): Promise<AppUpdateData> => {
      extensionRendererApi.events_ipc.emit('statics_get_releases', {});
      return ipc.invoke(staticsChannels.getReleases);
    },
    getInsider: (): Promise<AppUpdateInsiderData> => {
      extensionRendererApi.events_ipc.emit('statics_get_insider', {});
      return ipc.invoke(staticsChannels.getInsider);
    },
    getNotification: (): Promise<Notification_Data[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_notification', {});
      return ipc.invoke(staticsChannels.getNotification);
    },
    getModules: (): Promise<ModulesInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_modules', {});
      return ipc.invoke(staticsChannels.getModules);
    },
    getExtensions: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions', {});
      return ipc.invoke(staticsChannels.getExtensions);
    },
    getExtensionsEA: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions_ea', {});
      return ipc.invoke(staticsChannels.getExtensionsEA);
    },
    getPatrons: (): Promise<PatreonSupporter[]> => {
      extensionRendererApi.events_ipc.emit('statics_get_patrons', {});
      return ipc.invoke(staticsChannels.getPatrons);
    },
  },

  events: {
    card_PreCommandUninstall: (preCommands: string[]) => ipc.send(eventsChannels.card_PreCommandUninstall, preCommands),
  },

  downloadManager: {
    onDownloadCount: (result: (event: IpcRendererEvent, count: number) => void) =>
      ipc.on(browserDownloadChannels.mainDownloadCount, result),
    offDownloadCount: () => ipc.removeAllListeners(browserDownloadChannels.mainDownloadCount),

    onDlStart: (result: (event: IpcRendererEvent, info: DownloadStartInfo) => void) =>
      ipc.on(browserDownloadChannels.onDlStart, result),
    offDlStart: () => ipc.removeAllListeners(browserDownloadChannels.onDlStart),

    onProgress: (result: (event: IpcRendererEvent, info: DownloadManagerProgress) => void) =>
      ipc.on(browserDownloadChannels.onProgress, result),
    offProgress: () => ipc.removeAllListeners(browserDownloadChannels.onProgress),

    onDone: (result: (event: IpcRendererEvent, info: DownloadDoneInfo) => void) =>
      ipc.on(browserDownloadChannels.onDone, result),
    offDone: () => ipc.removeAllListeners(browserDownloadChannels.onDone),

    openMenu: () => ipc.send(browserDownloadChannels.openDownloadsMenu),
    openItem: (name: string, action: 'open' | 'openFolder') => ipc.send(browserDownloadChannels.openItem, name, action),
    cancel: (name: string) => ipc.send(browserDownloadChannels.cancel, name),
    pause: (name: string) => ipc.send(browserDownloadChannels.pause, name),
    resume: (name: string) => ipc.send(browserDownloadChannels.resume, name),
    clear: (name: string) => ipc.send(browserDownloadChannels.clear, name),
  },

  customNotification: {
    onOpen: (result: (event: IpcRendererEvent, info: CustomNotificationInfo) => void) =>
      ipc.on(customNotifChannels.onOpen, result),
    onClose: (result: (event: IpcRendererEvent, key: string) => void) => ipc.on(customNotifChannels.onClose, result),

    btnPress: (btnId: string, notifKey: string) => ipc.send(customNotifChannels.onBtnPress, btnId, notifKey),

    offOpen: () => ipc.removeAllListeners(customNotifChannels.onOpen),
    offClose: () => ipc.removeAllListeners(customNotifChannels.onClose),
  },

  init: {
    checkGitInstalled: (): Promise<string | undefined> => ipc.invoke(initChannels.checkGitInstalled),
    checkPwsh7Installed: (): Promise<string | undefined> => ipc.invoke(initChannels.checkPwsh7Installed),
  },

  patreon: {
    getInfo: (): Promise<PatreonUserData> => ipc.invoke(patreonChannels.getInfo),
    login: (): Promise<PatreonUserData> => ipc.invoke(patreonChannels.login),
    logout: (): Promise<void> => ipc.invoke(patreonChannels.logout),
    updateChannel: (channel: SubscribeStages | 'get'): void => ipc.send(patreonChannels.updateChannel, channel),

    onReleaseChannel: (result: (event: IpcRendererEvent, stage: SubscribeStages) => void) =>
      ipc.on(patreonChannels.onReleaseChannel, result),
  },
};

export default rendererIpc;
