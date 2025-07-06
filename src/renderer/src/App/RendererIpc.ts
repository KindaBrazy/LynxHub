// RendererIpc.ts
import {ContextMenuParams, FindInPageOptions, IpcRendererEvent, OpenDialogOptions} from 'electron';

import {
  AppUpdateData,
  AppUpdateInsiderData,
  ChosenArgumentsData,
  DiscordRPC,
  ExtensionsInfo,
  FolderListData,
  FolderNames,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
  RepositoryInfo,
} from '../../../cross/CrossTypes';
import {
  AgentTypes,
  appDataChannels,
  appUpdateChannels,
  AppUpdateStatus,
  appWindowChannels,
  browserChannels,
  CanGoType,
  ChangeWindowState,
  contextMenuChannels,
  CustomRunBehaviorData,
  DarkModeTypes,
  DiscordRunningAI,
  DownloadProgress,
  extensionsChannels,
  ExtensionsData,
  ExtensionsUpdateStatus,
  fileChannels,
  gitChannels,
  GitProgressCallback,
  HomeCategory,
  LynxInput,
  moduleApiChannels,
  modulesChannels,
  OnPreCommands,
  OnUpdatingExtensions,
  PreCommands,
  PreOpen,
  PreOpenData,
  ptyChannels,
  PtyProcessOpt,
  RecentlyOperation,
  SkippedPlugins,
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
import StorageTypes, {InstalledCard, InstalledCards} from '../../../cross/StorageTypes';
import {extensionRendererApi} from './Extensions/ExtensionLoader';

const ipc = window.electron.ipcRenderer;

const rendererIpc = {
  /** Managing app window states */
  win: {
    changeWinState: (state: ChangeWindowState): void => {
      extensionRendererApi.events.emit('ipc:win-change_state', {state});
      ipc.send(winChannels.changeState, state);
    },
    onChangeState: (result: (event: IpcRendererEvent, result: WinStateChange) => void) =>
      ipc.on(winChannels.onChangeState, result),

    setDarkMode: (darkMode: DarkModeTypes): void => {
      extensionRendererApi.events.emit('ipc:win-set_dark_mode', {darkMode});
      ipc.send(winChannels.setDarkMode, darkMode);
    },
    getSystemDarkMode: (): Promise<'light' | 'dark'> => {
      extensionRendererApi.events.emit('ipc:win-get_system_dark_mode', {});
      return ipc.invoke(winChannels.getSystemDarkMode);
    },
    onDarkMode: (result: (event: IpcRendererEvent, darkMode: DarkModeTypes) => void) =>
      ipc.on(winChannels.onDarkMode, result),

    setTaskBarStatus: (status: TaskbarStatus): void => {
      extensionRendererApi.events.emit('ipc:win-set_taskbar_status', {status});
      ipc.send(winChannels.setTaskBarStatus, status);
    },

    setDiscordRP: (discordRp: DiscordRPC): void => {
      extensionRendererApi.events.emit('ipc:win-set_discord_rp', {discordRp});
      ipc.send(winChannels.setDiscordRP, discordRp);
    },

    setDiscordRpAiRunning: (status: DiscordRunningAI): void => {
      extensionRendererApi.events.emit('ipc:win-set_discord_rp_ai_running', {status});
      ipc.send(winChannels.setDiscordRpAiRunning, status);
    },

    getSystemInfo: (): Promise<SystemInfo> => {
      extensionRendererApi.events.emit('ipc:win-get_system_info', {});
      return ipc.invoke(winChannels.getSystemInfo);
    },

    openUrlDefaultBrowser: (url: string): void => {
      extensionRendererApi.events.emit('ipc:win-open_url_default_browser', {url});
      ipc.send(winChannels.openUrlDefaultBrowser, url);
    },
  },

  /** Managing files and directories */
  file: {
    openDlg: (option: OpenDialogOptions): Promise<string | undefined> => {
      extensionRendererApi.events.emit('ipc:file-open_dialog', {option});
      return ipc.invoke(fileChannels.dialog, option);
    },

    openPath: (dir: string): void => {
      extensionRendererApi.events.emit('ipc:file-open_path', {dir});
      ipc.send(fileChannels.openPath, dir);
    },

    getAppDirectories: (name: FolderNames): Promise<string> => {
      extensionRendererApi.events.emit('ipc:file-get_app_directories', {name});
      return ipc.invoke(fileChannels.getAppDirectories, name);
    },

    removeDir: (dir: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:file-remove_dir', {dir});
      return ipc.invoke(fileChannels.removeDir, dir);
    },

    trashDir: (dir: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:file-trash_dir', {dir});
      return ipc.invoke(fileChannels.trashDir, dir);
    },

    listDir: (dirPath: string, relatives: string[]): Promise<FolderListData[]> => {
      extensionRendererApi.events.emit('ipc:file-list_dir', {dirPath, relatives});
      return ipc.invoke(fileChannels.listDir, dirPath, relatives);
    },

    checkFilesExist: (dir: string, fileNames: string[]) => {
      extensionRendererApi.events.emit('ipc:file-check_files_exist', {dir, fileNames});
      return ipc.invoke(fileChannels.checkFilesExist, dir, fileNames);
    },

    calcFolderSize: (dir: string) => {
      extensionRendererApi.events.emit('ipc:file-calc_folder_size', {dir});
      return ipc.invoke(fileChannels.calcFolderSize, dir);
    },
    getRelativePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:file-get_relative_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getRelativePath, basePath, targetPath);
    },
    getAbsolutePath: (basePath: string, targetPath: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:file-get_absolute_path', {basePath, targetPath});
      return ipc.invoke(fileChannels.getAbsolutePath, basePath, targetPath);
    },

    isEmptyDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:file-is_empty_dir', {dir});
      return ipc.invoke(fileChannels.isEmptyDir, dir);
    },
  },

  /** Git operations */
  git: {
    cloneShallow: (url: string, directory: string, singleBranch: boolean, depth?: number, branch?: string): void => {
      extensionRendererApi.events.emit('ipc:git-clone_shallow', {url, directory, singleBranch, depth, branch});
      ipc.send(gitChannels.cloneShallow, url, directory, singleBranch, depth, branch);
    },
    cloneShallowPromise: (
      url: string,
      directory: string,
      singleBranch: boolean,
      depth?: number,
      branch?: string,
    ): Promise<void> => {
      extensionRendererApi.events.emit('ipc:git-clone_shallow_promise', {url, directory, singleBranch, depth, branch});
      return ipc.invoke(gitChannels.cloneShallowPromise, url, directory, singleBranch, depth, branch);
    },
    getRepoInfo: (dir: string): Promise<RepositoryInfo> => {
      extensionRendererApi.events.emit('ipc:git-get_repo_info', {dir});
      return ipc.invoke(gitChannels.getRepoInfo, dir);
    },
    changeBranch: (dir: string, branchName: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:git-change_branch', {dir, branchName});
      return ipc.invoke(gitChannels.changeBranch, dir, branchName);
    },
    unShallow: (dir: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:git-unshallow', {dir});
      return ipc.invoke(gitChannels.unShallow, dir);
    },
    resetHard: (dir: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:git-reset_hard', {dir});
      return ipc.invoke(gitChannels.resetHard, dir);
    },

    validateGitDir: (dir: string, url: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:git-validate_git_dir', {dir, url});
      return ipc.invoke(gitChannels.validateGitDir, dir, url);
    },

    onProgress: (callback: GitProgressCallback) => ipc.on(gitChannels.onProgress, callback),
    offProgress: () => ipc.removeAllListeners(gitChannels.onProgress),

    pull: (repoDir: string, id: string): void => {
      extensionRendererApi.events.emit('ipc:git-pull', {repoDir, id});
      ipc.send(gitChannels.pull, repoDir, id);
    },
    stashDrop: (
      dir: string,
    ): Promise<{
      message: string;
      type: 'error' | 'success' | 'info';
    }> => {
      extensionRendererApi.events.emit('ipc:git-stash_drop', {dir});
      return ipc.invoke(gitChannels.stashDrop, dir);
    },
  },

  /** Managing app modules */
  module: {
    cardUpdateAvailable: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-card_update_available', {card, updateType});
      return ipc.invoke(modulesChannels.cardUpdateAvailable, card, updateType);
    },

    getModulesData: (): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:module-get_modules_data', {});
      return ipc.invoke(modulesChannels.getModulesData);
    },

    getInstalledModulesInfo: (): Promise<{dir: string; info: ModulesInfo}[]> => {
      extensionRendererApi.events.emit('ipc:module-get_installed_modules_info', {});
      return ipc.invoke(modulesChannels.getInstalledModulesInfo);
    },

    getSkipped: (): Promise<SkippedPlugins[]> => {
      extensionRendererApi.events.emit('ipc:module-get_skipped', {});
      return ipc.invoke(modulesChannels.getSkipped);
    },
    checkEa: (isEA: boolean, isInsider: boolean): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-check_ea', {isEA, isInsider});
      return ipc.invoke(modulesChannels.checkEa, isEA, isInsider);
    },

    installModule: (url: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-install_module', {url});
      return ipc.invoke(modulesChannels.installModule, url);
    },

    uninstallModule: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-uninstall_module', {id});
      return ipc.invoke(modulesChannels.uninstallModule, id);
    },

    uninstallCardByID: (id: string): Promise<void> => {
      extensionRendererApi.events.emit('ipc:module-uninstall_card_by_id', {id});
      return ipc.invoke(modulesChannels.uninstallCardByID, id);
    },

    isUpdateAvailable: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-is_update_available', {id});
      return ipc.invoke(modulesChannels.isUpdateAvailable, id);
    },
    updateAvailableList: (): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:module-update_available_list', {});
      return ipc.invoke(modulesChannels.updateAvailableList);
    },

    updateModule: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:module-update_module', {id});
      return ipc.invoke(modulesChannels.updateModule, id);
    },

    updateAllModules: (): Promise<void> => {
      extensionRendererApi.events.emit('ipc:module-update_all_modules', {});
      return ipc.invoke(modulesChannels.updateAllModules);
    },

    onReload: (result: (event: IpcRendererEvent) => void) => ipc.on(modulesChannels.onReload, result),

    onUpdatedModules: (result: (event: IpcRendererEvent, updated: string | string[]) => void) =>
      ipc.on(modulesChannels.onUpdatedModules, result),

    checkCardsUpdateInterval: (updateType: {id: string; type: 'git' | 'stepper'}[]) => {
      extensionRendererApi.events.emit('ipc:module-check_cards_update_interval', {updateType});
      ipc.send(modulesChannels.checkCardsUpdateInterval, updateType);
    },

    onCardsUpdateAvailable: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(modulesChannels.onCardsUpdateAvailable, result),
  },

  moduleApi: {
    getFolderCreationTime: (dir: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:module_api-get_folder_creation_time', {dir});
      return ipc.invoke(moduleApiChannels.getFolderCreationTime, dir);
    },
    getLastPulledDate: (dir: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:module_api-get_last_pulled_date', {dir});
      return ipc.invoke(moduleApiChannels.getLastPulledDate, dir);
    },
    getCurrentReleaseTag: (dir: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:module_api-get_current_release_tag', {dir});
      return ipc.invoke(moduleApiChannels.getCurrentReleaseTag, dir);
    },
  },

  /** Managing app extensions */
  extension: {
    getExtensionsData: (): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:extension-get_extensions_data', {});
      return ipc.invoke(extensionsChannels.getExtensionsData);
    },

    getInstalledExtensionsInfo: (): Promise<{dir: string; info: ExtensionsInfo}[]> => {
      extensionRendererApi.events.emit('ipc:extension-get_installed_extensions_info', {});
      return ipc.invoke(extensionsChannels.getInstalledExtensionsInfo);
    },
    getSkipped: (): Promise<SkippedPlugins[]> => {
      extensionRendererApi.events.emit('ipc:extension-get_skipped', {});
      return ipc.invoke(extensionsChannels.getSkipped);
    },

    installExtension: (url: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:extension-install_extension', {url});
      return ipc.invoke(extensionsChannels.installExtension, url);
    },

    uninstallExtension: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:extension-uninstall_extension', {id});
      return ipc.invoke(extensionsChannels.uninstallExtension, id);
    },

    isUpdateAvailable: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:extension-is_update_available', {id});
      return ipc.invoke(extensionsChannels.isUpdateAvailable, id);
    },
    updateAvailableList: (): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:extension-update_available_list', {});
      return ipc.invoke(extensionsChannels.updateAvailableList);
    },

    updateExtension: (id: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:extension-update_extension', {id});
      return ipc.invoke(extensionsChannels.updateExtension, id);
    },

    checkEa: (isEA: boolean, isInsider: boolean): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:extension-check_ea', {isEA, isInsider});
      return ipc.invoke(extensionsChannels.checkEa, isEA, isInsider);
    },

    updateAllExtensions: (): Promise<void> => {
      extensionRendererApi.events.emit('ipc:extension-update_all_extensions', {});
      return ipc.invoke(extensionsChannels.updateAllExtensions);
    },

    onReload: (result: (event: IpcRendererEvent) => void) => ipc.on(extensionsChannels.onReload, result),

    onUpdatedExtensions: (result: (event: IpcRendererEvent, updated: string | string[]) => void) =>
      ipc.on(extensionsChannels.onUpdatedExtensions, result),
  },

  /** Utilities methods for working with app storage data */
  storageUtils: {
    addInstalledCard: (cardData: InstalledCard): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_installed_card', {cardData});
      ipc.send(storageUtilsChannels.addInstalledCard, cardData);
    },
    removeInstalledCard: (cardId: string): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_installed_card', {cardId});
      ipc.send(storageUtilsChannels.removeInstalledCard, cardId);
    },
    onInstalledCards: (result: (event: IpcRendererEvent, cards: InstalledCards) => void) =>
      ipc.on(storageUtilsChannels.onInstalledCards, result),

    addAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateCard, cardId);
    },
    removeAutoUpdateCard: (cardId: string): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_auto_update_card', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateCard, cardId);
    },
    onAutoUpdateCards: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateCards, result),

    addAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.addAutoUpdateExtensions, cardId);
    },
    removeAutoUpdateExtensions: (cardId: string): void => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_auto_update_extensions', {cardId});
      ipc.send(storageUtilsChannels.removeAutoUpdateExtensions, cardId);
    },
    onAutoUpdateExtensions: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateExtensions, result),

    pinnedCards: (opt: StorageOperation, id: string, pinnedCards?: string[]): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:storage_utils-pinned_cards', {opt, id, pinnedCards});
      return ipc.invoke(storageUtilsChannels.pinnedCards, opt, id, pinnedCards);
    },
    onPinnedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onPinnedCardsChange, result),

    preCommands: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:storage_utils-pre_commands', {opt, data});
      return ipc.invoke(storageUtilsChannels.preCommands, opt, data);
    },
    onPreCommands: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onPreCommands, result),
    offPreCommands: (): void => ipc.removeAllListeners(storageUtilsChannels.onPreCommands),

    customRun: (opt: StorageOperation, data: PreCommands): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:storage_utils-custom_run', {opt, data});
      return ipc.invoke(storageUtilsChannels.customRun, opt, data);
    },
    onCustomRun: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onCustomRun, result),
    offCustomRun: (): void => ipc.removeAllListeners(storageUtilsChannels.onCustomRun),

    updateCustomRunBehavior: (data: CustomRunBehaviorData) => {
      extensionRendererApi.events.emit('ipc:storage_utils-update_custom_run_behavior', {data});
      ipc.send(storageUtilsChannels.customRunBehavior, data);
    },

    preOpen: (opt: StorageOperation, open: PreOpen): Promise<PreOpenData | undefined> => {
      extensionRendererApi.events.emit('ipc:storage_utils-pre_open', {opt, open});
      return ipc.invoke(storageUtilsChannels.preOpen, opt, open);
    },

    getCardArguments: (cardId: string): Promise<ChosenArgumentsData> => {
      extensionRendererApi.events.emit('ipc:storage_utils-get_card_arguments', {cardId});
      return ipc.invoke(storageUtilsChannels.getCardArguments, cardId);
    },
    setCardArguments: (cardId: string, args: ChosenArgumentsData): Promise<void> => {
      extensionRendererApi.events.emit('ipc:storage_utils-set_card_arguments', {cardId, args});
      return ipc.invoke(storageUtilsChannels.setCardArguments, cardId, args);
    },

    recentlyUsedCards: (opt: RecentlyOperation, id: string): Promise<string[]> => {
      extensionRendererApi.events.emit('ipc:storage_utils-recently_used_cards', {opt, id});
      return ipc.invoke(storageUtilsChannels.recentlyUsedCards, opt, id);
    },
    onRecentlyUsedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onRecentlyUsedCardsChange, result),

    homeCategory: (opt: StorageOperation, data: HomeCategory): Promise<HomeCategory> => {
      extensionRendererApi.events.emit('ipc:storage_utils-home_category', {opt, data});
      return ipc.invoke(storageUtilsChannels.homeCategory, opt, data);
    },
    onHomeCategory: (result: (event: IpcRendererEvent, data: HomeCategory) => void) =>
      ipc.on(storageUtilsChannels.onHomeCategory, result),
    setSystemStartup: (startup: boolean) => {
      extensionRendererApi.events.emit('ipc:storage_utils-set_system_startup', {startup});
      ipc.send(storageUtilsChannels.setSystemStartup, startup);
    },

    updateZoomFactor: (zoomFactor: number) => {
      extensionRendererApi.events.emit('ipc:storage_utils-update_zoom_factor', {zoomFactor});
      ipc.send(storageUtilsChannels.updateZoomFactor, zoomFactor);
    },

    addBrowserRecent: (recentEntry: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_browser_recent', {recentEntry});
      ipc.send(storageUtilsChannels.addBrowserRecent, recentEntry);
    },
    addBrowserFavorite: (favoriteEntry: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_browser_favorite', {favoriteEntry});
      ipc.send(storageUtilsChannels.addBrowserFavorite, favoriteEntry);
    },
    addBrowserHistory: (historyEntry: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_browser_history', {historyEntry});
      ipc.send(storageUtilsChannels.addBrowserHistory, historyEntry);
    },
    addBrowserRecentFavIcon: (url: string, favIcon: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-add_browser_recent_favicon', {url, favIcon});
      ipc.send(storageUtilsChannels.addBrowserRecentFavIcon, url, favIcon);
    },
    removeBrowserRecent: (url: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_browser_recent', {url});
      ipc.send(storageUtilsChannels.removeBrowserRecent, url);
    },
    removeBrowserFavorite: (url: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_browser_favorite', {url});
      ipc.send(storageUtilsChannels.removeBrowserFavorite, url);
    },
    removeBrowserHistory: (url: string) => {
      extensionRendererApi.events.emit('ipc:storage_utils-remove_browser_history', {url});
      ipc.send(storageUtilsChannels.removeBrowserHistory, url);
    },

    setShowConfirm: (type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) => {
      extensionRendererApi.events.emit('ipc:storage_utils-set_show_confirm', {type, enable});
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
      extensionRendererApi.events.emit('ipc:storage_utils-add_read_notif', {id});
      ipc.send(storageUtilsChannels.addReadNotif, id);
    },
  },

  /** Utilities methods */
  utils: {
    updateAllExtensions: (data: {id: string; dir: string}): void => {
      extensionRendererApi.events.emit('ipc:utils-update_all_extensions', {data});
      ipc.send(utilsChannels.updateAllExtensions, data);
    },
    onUpdateAllExtensions: (result: (event: IpcRendererEvent, updateInfo: OnUpdatingExtensions) => void) =>
      ipc.on(utilsChannels.onUpdateAllExtensions, result),

    offUpdateAllExtensions: () => ipc.removeAllListeners(utilsChannels.onUpdateAllExtensions),

    getExtensionsDetails: (dir: string): Promise<ExtensionsData> => {
      extensionRendererApi.events.emit('ipc:utils-get_extensions_details', {dir});
      return ipc.invoke(utilsChannels.extensionsDetails, dir);
    },

    getExtensionsUpdateStatus: (dir: string): Promise<ExtensionsUpdateStatus> => {
      extensionRendererApi.events.emit('ipc:utils-get_extensions_update_status', {dir});
      return ipc.invoke(utilsChannels.updateStatus, dir);
    },

    disableExtension: (disable: boolean, dir: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:utils-disable_extension', {disable, dir});
      return ipc.invoke(utilsChannels.disableExtension, disable, dir);
    },

    cancelExtensionsData: (): void => {
      extensionRendererApi.events.emit('ipc:utils-cancel_extensions_data', {});
      ipc.send(utilsChannels.cancelExtensionsData);
    },

    downloadFile: (url: string): void => {
      extensionRendererApi.events.emit('ipc:utils-download_file', {url});
      ipc.send(utilsChannels.downloadFile, url);
    },
    cancelDownload: (): void => {
      extensionRendererApi.events.emit('ipc:utils-cancel_download', {});
      ipc.send(utilsChannels.cancelDownload);
    },
    onDownloadFile: (result: (event: IpcRendererEvent, progress: DownloadProgress) => void) =>
      ipc.on(utilsChannels.onDownloadFile, result),
    offDownloadFile: (): void => ipc.removeAllListeners(utilsChannels.onDownloadFile),

    decompressFile: (filePath: string): Promise<string> => {
      extensionRendererApi.events.emit('ipc:utils-decompress_file', {filePath});
      return ipc.invoke(utilsChannels.decompressFile, filePath);
    },

    isResponseValid: (url: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:utils-is_response_valid', {url});
      return ipc.invoke(utilsChannels.isResponseValid, url);
    },
    getImageAsDataURL: (url: string): Promise<string | null> => {
      extensionRendererApi.events.emit('ipc:utils-get_image_as_data_url', {url});
      return ipc.invoke(utilsChannels.getImageAsDataURL, url);
    },
  },

  /** Managing and using node-pty(Pseudo Terminal ) */
  pty: {
    process: (id: string, opt: PtyProcessOpt, cardId: string): void => {
      extensionRendererApi.events.emit('ipc:terminal-process', {id, opt, cardId});
      ipc.send(ptyChannels.process, id, opt, cardId);
    },
    customProcess: (id: string, opt: PtyProcessOpt, dir?: string, file?: string): void => {
      extensionRendererApi.events.emit('ipc:terminal-process_custom', {id, opt, dir, file});
      ipc.send(ptyChannels.customProcess, id, opt, dir, file);
    },
    emptyProcess: (id: string, opt: PtyProcessOpt, dir?: string): void => {
      extensionRendererApi.events.emit('ipc:terminal-process_empty', {id, opt, dir});
      ipc.send(ptyChannels.emptyProcess, id, opt, dir);
    },
    customCommands: (id: string, opt: PtyProcessOpt, commands?: string | string[], dir?: string) => {
      extensionRendererApi.events.emit('ipc:terminal-process_custom-command', {id, opt, commands, dir});
      ipc.send(ptyChannels.customCommands, id, opt, commands, dir);
    },

    write: (id: string, data: string): void => {
      extensionRendererApi.events.emit('ipc:terminal-write', {id, data});
      ipc.send(ptyChannels.write, id, data);
    },

    resize: (id: string, cols: number, rows: number): void => {
      extensionRendererApi.events.emit('ipc:terminal-resize', {id, cols, rows});
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
    status: (result: (event: IpcRendererEvent, status: AppUpdateStatus) => void) =>
      ipc.on(appUpdateChannels.status, result),

    offStatus: (): void => ipc.removeAllListeners(appUpdateChannels.status),

    download: (): void => {
      extensionRendererApi.events.emit('ipc:app_update-download', {});
      ipc.send(appUpdateChannels.download);
    },

    cancel: (): void => {
      extensionRendererApi.events.emit('ipc:app_update-cancel', {});
      ipc.send(appUpdateChannels.cancel);
    },

    install: (): void => {
      extensionRendererApi.events.emit('ipc:app_update-install', {});
      ipc.send(appUpdateChannels.install);
    },
  },

  /** Managing app data directories */
  appData: {
    getCurrentPath: (): Promise<string> => {
      extensionRendererApi.events.emit('ipc:app_data-get_current_path', {});
      return ipc.invoke(appDataChannels.getCurrentPath);
    },

    selectAnother: (): Promise<any> => {
      extensionRendererApi.events.emit('ipc:app_data-select_another', {});
      return ipc.invoke(appDataChannels.selectAnother);
    },

    isAppDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events.emit('ipc:app_data-is_app_dir', {dir});
      return ipc.invoke(appDataChannels.isAppDir, dir);
    },
  },

  /** Managing app storage data */
  storage: {
    getCustom: (key: string): Promise<any> => {
      extensionRendererApi.events.emit('ipc:storage-get_custom', {key});
      return ipc.invoke(storageChannels.getCustom, key);
    },
    setCustom: (key: string, data: any): void => {
      extensionRendererApi.events.emit('ipc:storage-set_custom', {key, data});
      ipc.send(storageChannels.setCustom, key, data);
    },

    get: <K extends keyof StorageTypes>(key: K): Promise<StorageTypes[K]> => {
      extensionRendererApi.events.emit('ipc:storage-get', {key});
      return ipc.invoke(storageChannels.get, key);
    },

    getAll: (): Promise<StorageTypes> => {
      extensionRendererApi.events.emit('ipc:storage-get_all', {});
      return ipc.invoke(storageChannels.getAll);
    },

    update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>): Promise<void> => {
      extensionRendererApi.events.emit('ipc:storage-update', {key, updateData});
      return ipc.invoke(storageChannels.update, key, updateData);
    },

    clear: (): Promise<void> => {
      extensionRendererApi.events.emit('ipc:storage-clear', {});
      return ipc.invoke(storageChannels.clear);
    },
  },

  appWindow: {
    onHotkeysChange: (result: (event: IpcRendererEvent, input: LynxInput) => void) =>
      ipc.on(appWindowChannels.hotkeysChange, result),
    offHotkeysChange: () => ipc.removeAllListeners(appWindowChannels.hotkeysChange),
  },

  contextMenu: {
    resizeWindow: (dimensions: {width: number; height: number}) => {
      extensionRendererApi.events.emit('ipc:context_menu-resize_window', {dimensions});
      ipc.send(contextMenuChannels.resizeWindow, dimensions);
    },
    showWindow: () => {
      extensionRendererApi.events.emit('ipc:context_menu-show_window', {});
      ipc.send(contextMenuChannels.showWindow);
    },
    hideWindow: () => {
      extensionRendererApi.events.emit('ipc:context_menu-hide_window', {});
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
      extensionRendererApi.events.emit('ipc:context_menu-open_terminate_ai', {id});
      ipc.send(contextMenuChannels.openTerminateAI, id);
    },
    openTerminateTab: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events.emit('ipc:context_menu-open_terminate_tab', {id, customPosition});
      ipc.send(contextMenuChannels.openTerminateTab, id, customPosition);
    },
    openCloseApp: () => {
      extensionRendererApi.events.emit('ipc:context_menu-open_close_app', {});
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
      extensionRendererApi.events.emit('ipc:context_menu-relaunch_ai', {id});
      ipc.send(contextMenuChannels.relaunchAI, id);
    },
    onRelaunchAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onRelaunchAI, result),
    offRelaunchAI: () => ipc.removeAllListeners(contextMenuChannels.onRelaunchAI),

    stopAI: (id: string) => {
      extensionRendererApi.events.emit('ipc:context_menu-stop_ai', {id});
      ipc.send(contextMenuChannels.stopAI, id);
    },
    onStopAI: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onStopAI, result),
    offStopAI: () => ipc.removeAllListeners(contextMenuChannels.onStopAI),

    removeTab: (tabID: string) => {
      extensionRendererApi.events.emit('ipc:context_menu-remove_tab', {tabID});
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
      extensionRendererApi.events.emit('ipc:context_items-copy', {id});
      ipc.send(contextMenuChannels.copy, id);
    },
    paste: (id: number) => {
      extensionRendererApi.events.emit('ipc:context_items-paste', {id});
      ipc.send(contextMenuChannels.paste, id);
    },
    replaceMisspelling: (id: number, text: string) => {
      extensionRendererApi.events.emit('ipc:context_items-replace_misspelling', {id, text});
      ipc.send(contextMenuChannels.replaceMisspelling, id, text);
    },
    selectAll: (id: number) => {
      extensionRendererApi.events.emit('ipc:context_items-select_all', {id});
      ipc.send(contextMenuChannels.selectAll, id);
    },

    undo: (id: number) => {
      extensionRendererApi.events.emit('ipc:context_items-undo', {id});
      ipc.send(contextMenuChannels.undo, id);
    },
    redo: (id: number) => {
      extensionRendererApi.events.emit('ipc:context_items-redo', {id});
      ipc.send(contextMenuChannels.redo, id);
    },

    newTab: (url: string) => {
      extensionRendererApi.events.emit('ipc:context_items-new_tab', {url});
      ipc.send(contextMenuChannels.newTab, url);
    },
    openExternal: (url: string) => {
      extensionRendererApi.events.emit('ipc:context_items-open_external', {url});
      ipc.send(contextMenuChannels.openExternal, url);
    },

    downloadImage: (id: number, url: string) => {
      extensionRendererApi.events.emit('ipc:context_items-download_image', {id, url});
      ipc.send(contextMenuChannels.downloadImage, id, url);
    },

    navigate: (id: number, action: 'back' | 'forward' | 'refresh') => {
      extensionRendererApi.events.emit('ipc:context_items-navigate', {id, action});
      ipc.send(contextMenuChannels.navigate, id, action);
    },
  },

  browser: {
    createBrowser: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-create', {id});
      ipc.send(browserChannels.createBrowser, id);
    },
    removeBrowser: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-remove', {id});
      ipc.send(browserChannels.removeBrowser, id);
    },
    loadURL: (id: string, url: string) => {
      extensionRendererApi.events.emit('ipc:browser-load_url', {id, url});
      ipc.send(browserChannels.loadURL, id, url);
    },
    setVisible: (id: string, visible: boolean) => {
      extensionRendererApi.events.emit('ipc:browser-set_visible', {id, visible});
      ipc.send(browserChannels.setVisible, id, visible);
    },

    openFindInPage: (id: string, customPosition?: {x: number; y: number}) => {
      extensionRendererApi.events.emit('ipc:browser-open_find_in_page', {id, customPosition});
      ipc.send(browserChannels.openFindInPage, id, customPosition);
    },
    openZoom: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-open_zoom', {id});
      ipc.send(browserChannels.openZoom, id);
    },

    findInPage: (id: string, value: string, options: FindInPageOptions) => {
      extensionRendererApi.events.emit('ipc:browser-find_in_page', {id, value, options});
      ipc.send(browserChannels.findInPage, id, value, options);
    },
    stopFindInPage: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') => {
      extensionRendererApi.events.emit('ipc:browser-stop_find_in_page', {id, action});
      ipc.send(browserChannels.stopFindInPage, id, action);
    },

    focusWebView: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-focus_web_view', {id});
      ipc.send(browserChannels.focusWebView, id);
    },

    clearCache: () => {
      extensionRendererApi.events.emit('ipc:browser-clear_cache', {});
      ipc.send(browserChannels.clearCache);
    },
    clearCookies: () => {
      extensionRendererApi.events.emit('ipc:browser-clear_cookies', {});
      ipc.send(browserChannels.clearCookies);
    },

    setZoomFactor: (id: string, factor: number) => {
      extensionRendererApi.events.emit('ipc:browser-set_zoom_factor', {id, factor});
      ipc.send(browserChannels.setZoomFactor, id, factor);
    },
    reload: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-reload', {id});
      ipc.send(browserChannels.reload, id);
    },
    goBack: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-go_back', {id});
      ipc.send(browserChannels.goBack, id);
    },
    goForward: (id: string) => {
      extensionRendererApi.events.emit('ipc:browser-go_forward', {id});
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
      extensionRendererApi.events.emit('ipc:browser-get_user_agent', {type});
      return ipc.invoke(browserChannels.getUserAgent, type);
    },
    updateUserAgent: () => {
      extensionRendererApi.events.emit('ipc:browser-update_user_agent', {});
      ipc.send(browserChannels.updateUserAgent);
    },

    addOffset: (id: string, offset: WHType) => {
      extensionRendererApi.events.emit('ipc:browser-add_offset', {id, offset});
      ipc.send(browserChannels.addOffset, id, offset);
    },
  },

  statics: {
    pull: (): Promise<void> => {
      extensionRendererApi.events.emit('ipc:statics-pull', {});
      return ipc.invoke(staticsChannels.pull);
    },
    getReleases: (): Promise<AppUpdateData> => {
      extensionRendererApi.events.emit('ipc:statics-get_releases', {});
      return ipc.invoke(staticsChannels.getReleases);
    },
    getInsider: (): Promise<AppUpdateInsiderData> => {
      extensionRendererApi.events.emit('ipc:statics-get_insider', {});
      return ipc.invoke(staticsChannels.getInsider);
    },
    getNotification: (): Promise<Notification_Data[]> => {
      extensionRendererApi.events.emit('ipc:statics-get_notification', {});
      return ipc.invoke(staticsChannels.getNotification);
    },
    getModules: (): Promise<ModulesInfo[]> => {
      extensionRendererApi.events.emit('ipc:statics-get_modules', {});
      return ipc.invoke(staticsChannels.getModules);
    },
    getExtensions: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events.emit('ipc:statics-get_extensions', {});
      return ipc.invoke(staticsChannels.getExtensions);
    },
    getExtensionsEA: (): Promise<ExtensionsInfo[]> => {
      extensionRendererApi.events.emit('ipc:statics-get_extensions_ea', {});
      return ipc.invoke(staticsChannels.getExtensionsEA);
    },
    getPatrons: (): Promise<PatreonSupporter[]> => {
      extensionRendererApi.events.emit('ipc:statics-get_patrons', {});
      return ipc.invoke(staticsChannels.getPatrons);
    },
  },
};

export default rendererIpc;
