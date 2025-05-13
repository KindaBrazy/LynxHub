import {ContextMenuParams, FindInPageOptions, IpcRendererEvent, OpenDialogOptions} from 'electron';

import {
  ChosenArgumentsData,
  DiscordRPC,
  ExtensionsInfo,
  FolderListData,
  FolderNames,
  ModulesInfo,
  RepositoryInfo,
} from '../../../cross/CrossTypes';
import {
  appDataChannels,
  appUpdateChannels,
  AppUpdateStatus,
  appWindowChannels,
  browserChannels,
  BrowserRecent,
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
  storageChannels,
  StorageOperation,
  storageUtilsChannels,
  SystemInfo,
  tabsChannels,
  TaskbarStatus,
  utilsChannels,
  winChannels,
  WinStateChange,
} from '../../../cross/IpcChannelAndTypes';
import StorageTypes, {InstalledCard, InstalledCards} from '../../../cross/StorageTypes';

const ipc = window.electron.ipcRenderer;

const rendererIpc = {
  /** Managing app window states */
  win: {
    changeWinState: (state: ChangeWindowState): void => ipc.send(winChannels.changeState, state),
    onChangeState: (result: (event: IpcRendererEvent, result: WinStateChange) => void) =>
      ipc.on(winChannels.onChangeState, result),

    setDarkMode: (darkMode: DarkModeTypes): void => ipc.send(winChannels.setDarkMode, darkMode),
    getSystemDarkMode: (): Promise<'light' | 'dark'> => ipc.invoke(winChannels.getSystemDarkMode),
    onDarkMode: (result: (event: IpcRendererEvent, darkMode: DarkModeTypes) => void) =>
      ipc.on(winChannels.onDarkMode, result),

    setTaskBarStatus: (status: TaskbarStatus): void => ipc.send(winChannels.setTaskBarStatus, status),

    setDiscordRP: (discordRp: DiscordRPC): void => ipc.send(winChannels.setDiscordRP, discordRp),

    setDiscordRpAiRunning: (status: DiscordRunningAI): void => ipc.send(winChannels.setDiscordRpAiRunning, status),

    getSystemInfo: (): Promise<SystemInfo> => ipc.invoke(winChannels.getSystemInfo),
  },

  /** Managing files and directories */
  file: {
    openDlg: (option: OpenDialogOptions): Promise<string | undefined> => ipc.invoke(fileChannels.dialog, option),

    openPath: (dir: string): void => ipc.send(fileChannels.openPath, dir),

    getAppDirectories: (name: FolderNames): Promise<string> => ipc.invoke(fileChannels.getAppDirectories, name),

    removeDir: (dir: string): Promise<void> => ipc.invoke(fileChannels.removeDir, dir),

    trashDir: (dir: string): Promise<void> => ipc.invoke(fileChannels.trashDir, dir),

    listDir: (dirPath: string, relatives: string[]): Promise<FolderListData[]> =>
      ipc.invoke(fileChannels.listDir, dirPath, relatives),

    checkFilesExist: (dir: string, fileNames: string[]) => ipc.invoke(fileChannels.checkFilesExist, dir, fileNames),

    calcFolderSize: (dir: string) => ipc.invoke(fileChannels.calcFolderSize, dir),
    getRelativePath: (basePath: string, targetPath: string): Promise<string> =>
      ipc.invoke(fileChannels.getRelativePath, basePath, targetPath),
    getAbsolutePath: (basePath: string, targetPath: string): Promise<string> =>
      ipc.invoke(fileChannels.getAbsolutePath, basePath, targetPath),
  },

  /** Git operations */
  git: {
    cloneShallow: (url: string, directory: string, singleBranch: boolean, depth?: number, branch?: string): void =>
      ipc.send(gitChannels.cloneShallow, url, directory, singleBranch, depth, branch),
    cloneShallowPromise: (
      url: string,
      directory: string,
      singleBranch: boolean,
      depth?: number,
      branch?: string,
    ): Promise<void> => ipc.invoke(gitChannels.cloneShallowPromise, url, directory, singleBranch, depth, branch),
    getRepoInfo: (dir: string): Promise<RepositoryInfo> => ipc.invoke(gitChannels.getRepoInfo, dir),
    changeBranch: (dir: string, branchName: string): Promise<void> =>
      ipc.invoke(gitChannels.changeBranch, dir, branchName),
    unShallow: (dir: string): Promise<void> => ipc.invoke(gitChannels.unShallow, dir),
    resetHard: (dir: string): Promise<void> => ipc.invoke(gitChannels.resetHard, dir),

    validateGitDir: (dir: string, url: string): Promise<boolean> => ipc.invoke(gitChannels.validateGitDir, dir, url),

    onProgress: (callback: GitProgressCallback) => ipc.on(gitChannels.onProgress, callback),
    offProgress: () => ipc.removeAllListeners(gitChannels.onProgress),

    pull: (repoDir: string, id: string): void => ipc.send(gitChannels.pull, repoDir, id),
    stashDrop: (
      dir: string,
    ): Promise<{
      message: string;
      type: 'error' | 'success' | 'info';
    }> => ipc.invoke(gitChannels.stashDrop, dir),
  },

  /** Managing app modules */
  module: {
    cardUpdateAvailable: (card: InstalledCard, updateType: 'git' | 'stepper' | undefined): Promise<boolean> =>
      ipc.invoke(modulesChannels.cardUpdateAvailable, card, updateType),

    getModulesData: (): Promise<string[]> => ipc.invoke(modulesChannels.getModulesData),

    getInstalledModulesInfo: (): Promise<{dir: string; info: ModulesInfo}[]> =>
      ipc.invoke(modulesChannels.getInstalledModulesInfo),

    getSkipped: (): Promise<SkippedPlugins[]> => ipc.invoke(modulesChannels.getSkipped),
    checkEa: (isEA: boolean): Promise<boolean> => ipc.invoke(modulesChannels.checkEa, isEA),

    installModule: (url: string): Promise<boolean> => ipc.invoke(modulesChannels.installModule, url),

    uninstallModule: (id: string): Promise<boolean> => ipc.invoke(modulesChannels.uninstallModule, id),

    uninstallCardByID: (id: string, dir?: string): Promise<void> =>
      ipc.invoke(modulesChannels.uninstallCardByID, id, dir),

    isUpdateAvailable: (id: string): Promise<boolean> => ipc.invoke(modulesChannels.isUpdateAvailable, id),
    updateAvailableList: (): Promise<string[]> => ipc.invoke(modulesChannels.updateAvailableList),

    updateModule: (id: string): Promise<boolean> => ipc.invoke(modulesChannels.updateModule, id),

    updateAllModules: (): Promise<void> => ipc.invoke(modulesChannels.updateAllModules),

    onReload: (result: (event: IpcRendererEvent) => void) => ipc.on(modulesChannels.onReload, result),

    onUpdatedModules: (result: (event: IpcRendererEvent, updated: string | string[]) => void) =>
      ipc.on(modulesChannels.onUpdatedModules, result),

    checkCardsUpdateInterval: (updateType: {id: string; type: 'git' | 'stepper'}[]) =>
      ipc.send(modulesChannels.checkCardsUpdateInterval, updateType),

    onCardsUpdateAvailable: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(modulesChannels.onCardsUpdateAvailable, result),
  },

  moduleApi: {
    getFolderCreationTime: (dir: string): Promise<string> => ipc.invoke(moduleApiChannels.getFolderCreationTime, dir),
    getLastPulledDate: (dir: string): Promise<string> => ipc.invoke(moduleApiChannels.getLastPulledDate, dir),
    getCurrentReleaseTag: (dir: string): Promise<string> => ipc.invoke(moduleApiChannels.getCurrentReleaseTag, dir),
  },

  /** Managing app extensions */
  extension: {
    getExtensionsData: (): Promise<string[]> => ipc.invoke(extensionsChannels.getExtensionsData),

    getInstalledExtensionsInfo: (): Promise<{dir: string; info: ExtensionsInfo}[]> =>
      ipc.invoke(extensionsChannels.getInstalledExtensionsInfo),
    getSkipped: (): Promise<SkippedPlugins[]> => ipc.invoke(extensionsChannels.getSkipped),

    installExtension: (url: string): Promise<boolean> => ipc.invoke(extensionsChannels.installExtension, url),

    uninstallExtension: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.uninstallExtension, id),

    isUpdateAvailable: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.isUpdateAvailable, id),
    updateAvailableList: (): Promise<string[]> => ipc.invoke(extensionsChannels.updateAvailableList),

    updateExtension: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.updateExtension, id),

    checkEa: (isEA: boolean): Promise<boolean> => ipc.invoke(extensionsChannels.checkEa, isEA),

    updateAllExtensions: (): Promise<void> => ipc.invoke(extensionsChannels.updateAllExtensions),

    onReload: (result: (event: IpcRendererEvent) => void) => ipc.on(extensionsChannels.onReload, result),

    onUpdatedExtensions: (result: (event: IpcRendererEvent, updated: string | string[]) => void) =>
      ipc.on(extensionsChannels.onUpdatedExtensions, result),
  },

  /** Utilities methods for working with app storage data */
  storageUtils: {
    addInstalledCard: (cardData: InstalledCard): void => ipc.send(storageUtilsChannels.addInstalledCard, cardData),
    removeInstalledCard: (cardId: string): void => ipc.send(storageUtilsChannels.removeInstalledCard, cardId),
    onInstalledCards: (result: (event: IpcRendererEvent, cards: InstalledCards) => void) =>
      ipc.on(storageUtilsChannels.onInstalledCards, result),

    addAutoUpdateCard: (cardId: string): void => ipc.send(storageUtilsChannels.addAutoUpdateCard, cardId),
    removeAutoUpdateCard: (cardId: string): void => ipc.send(storageUtilsChannels.removeAutoUpdateCard, cardId),
    onAutoUpdateCards: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateCards, result),

    addAutoUpdateExtensions: (cardId: string): void => ipc.send(storageUtilsChannels.addAutoUpdateExtensions, cardId),
    removeAutoUpdateExtensions: (cardId: string): void =>
      ipc.send(storageUtilsChannels.removeAutoUpdateExtensions, cardId),
    onAutoUpdateExtensions: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onAutoUpdateExtensions, result),

    pinnedCards: (opt: StorageOperation, id: string, pinnedCards?: string[]): Promise<string[]> =>
      ipc.invoke(storageUtilsChannels.pinnedCards, opt, id, pinnedCards),
    onPinnedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onPinnedCardsChange, result),

    preCommands: (opt: StorageOperation, data: PreCommands): Promise<string[]> =>
      ipc.invoke(storageUtilsChannels.preCommands, opt, data),
    onPreCommands: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onPreCommands, result),
    offPreCommands: (): void => ipc.removeAllListeners(storageUtilsChannels.onPreCommands),

    customRun: (opt: StorageOperation, data: PreCommands): Promise<string[]> =>
      ipc.invoke(storageUtilsChannels.customRun, opt, data),
    onCustomRun: (result: (event: IpcRendererEvent, preCommands: OnPreCommands) => void) =>
      ipc.on(storageUtilsChannels.onCustomRun, result),
    offCustomRun: (): void => ipc.removeAllListeners(storageUtilsChannels.onCustomRun),

    updateCustomRunBehavior: (data: CustomRunBehaviorData) => ipc.send(storageUtilsChannels.customRunBehavior, data),

    preOpen: (opt: StorageOperation, open: PreOpen): Promise<PreOpenData | undefined> =>
      ipc.invoke(storageUtilsChannels.preOpen, opt, open),

    getCardArguments: (cardId: string): Promise<ChosenArgumentsData> =>
      ipc.invoke(storageUtilsChannels.getCardArguments, cardId),
    setCardArguments: (cardId: string, args: ChosenArgumentsData): Promise<void> =>
      ipc.invoke(storageUtilsChannels.setCardArguments, cardId, args),

    recentlyUsedCards: (opt: RecentlyOperation, id: string): Promise<string[]> =>
      ipc.invoke(storageUtilsChannels.recentlyUsedCards, opt, id),
    onRecentlyUsedCardsChange: (result: (event: IpcRendererEvent, cards: string[]) => void) =>
      ipc.on(storageUtilsChannels.onRecentlyUsedCardsChange, result),

    homeCategory: (opt: StorageOperation, data: HomeCategory): Promise<HomeCategory> =>
      ipc.invoke(storageUtilsChannels.homeCategory, opt, data),
    onHomeCategory: (result: (event: IpcRendererEvent, data: HomeCategory) => void) =>
      ipc.on(storageUtilsChannels.onHomeCategory, result),
    setSystemStartup: (startup: boolean) => ipc.send(storageUtilsChannels.setSystemStartup, startup),

    updateZoomFactor: (zoomFactor: number) => ipc.send(storageUtilsChannels.updateZoomFactor, zoomFactor),

    addBrowserRecent: (recentEntry: BrowserRecent) => ipc.send(storageUtilsChannels.addBrowserRecent, recentEntry),
    addBrowserRecentFavIcon: (url: string, favIcon: string) =>
      ipc.send(storageUtilsChannels.addBrowserRecentFavIcon, url, favIcon),
    removeBrowserRecent: (url: string) => ipc.send(storageUtilsChannels.removeBrowserRecent, url),
    getBrowserRecent: (): Promise<BrowserRecent[]> => ipc.invoke(storageUtilsChannels.getBrowserRecent),

    setShowConfirm: (type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) =>
      ipc.send(storageUtilsChannels.setShowConfirm, type, enable),

    onConfirmChange: (
      result: (
        event: IpcRendererEvent,
        type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm',
        enable: boolean,
      ) => void,
    ) => ipc.on(storageUtilsChannels.onConfirmChange, result),
  },

  /** Utilities methods */
  utils: {
    updateAllExtensions: (data: {id: string; dir: string}): void => ipc.send(utilsChannels.updateAllExtensions, data),
    onUpdateAllExtensions: (result: (event: IpcRendererEvent, updateInfo: OnUpdatingExtensions) => void) =>
      ipc.on(utilsChannels.onUpdateAllExtensions, result),

    getExtensionsDetails: (dir: string): Promise<ExtensionsData> => ipc.invoke(utilsChannels.extensionsDetails, dir),

    getExtensionsUpdateStatus: (dir: string): Promise<ExtensionsUpdateStatus> =>
      ipc.invoke(utilsChannels.updateStatus, dir),

    disableExtension: (disable: boolean, dir: string): Promise<string> =>
      ipc.invoke(utilsChannels.disableExtension, disable, dir),

    cancelExtensionsData: (): void => ipc.send(utilsChannels.cancelExtensionsData),

    downloadFile: (url: string): void => ipc.send(utilsChannels.downloadFile, url),
    cancelDownload: (): void => ipc.send(utilsChannels.cancelDownload),
    onDownloadFile: (result: (event: IpcRendererEvent, progress: DownloadProgress) => void) =>
      ipc.on(utilsChannels.onDownloadFile, result),
    offDownloadFile: (): void => ipc.removeAllListeners(utilsChannels.onDownloadFile),

    decompressFile: (filePath: string): Promise<string> => ipc.invoke(utilsChannels.decompressFile, filePath),

    isResponseValid: (url: string): Promise<boolean> => ipc.invoke(utilsChannels.isResponseValid, url),
  },

  /** Managing and using node-pty(Pseudo Terminal ) */
  pty: {
    process: (id: string, opt: PtyProcessOpt, cardId: string): void => ipc.send(ptyChannels.process, id, opt, cardId),
    customProcess: (id: string, opt: PtyProcessOpt, dir?: string, file?: string): void =>
      ipc.send(ptyChannels.customProcess, id, opt, dir, file),
    emptyProcess: (id: string, opt: PtyProcessOpt, dir?: string): void =>
      ipc.send(ptyChannels.emptyProcess, id, opt, dir),
    customCommands: (id: string, opt: PtyProcessOpt, commands?: string | string[], dir?: string) =>
      ipc.send(ptyChannels.customCommands, id, opt, commands, dir),

    write: (id: string, data: string): void => ipc.send(ptyChannels.write, id, data),

    resize: (id: string, cols: number, rows: number): void => ipc.send(ptyChannels.resize, id, cols, rows),

    onData: (result: (event: IpcRendererEvent, id: string, data: string) => void) => ipc.on(ptyChannels.onData, result),
    onTitle: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(ptyChannels.onTitle, result),

    offData: (): void => ipc.removeAllListeners(ptyChannels.onData),
    offTitle: (): void => ipc.removeAllListeners(ptyChannels.onTitle),
  },

  /** Managing app automatic updates */
  appUpdate: {
    status: (result: (event: IpcRendererEvent, status: AppUpdateStatus) => void) =>
      ipc.on(appUpdateChannels.status, result),

    offStatus: (): void => ipc.removeAllListeners(appUpdateChannels.status),

    download: (): void => ipc.send(appUpdateChannels.download),

    cancel: (): void => ipc.send(appUpdateChannels.cancel),

    install: (): void => ipc.send(appUpdateChannels.install),
  },

  /** Managing app data directories */
  appData: {
    getCurrentPath: (): Promise<string> => ipc.invoke(appDataChannels.getCurrentPath),

    selectAnother: (): Promise<any> => ipc.invoke(appDataChannels.selectAnother),

    isAppDir: (dir: string): Promise<boolean> => ipc.invoke(appDataChannels.isAppDir, dir),
  },

  /** Managing app storage data */
  storage: {
    getCustom: (key: string): Promise<any> => ipc.invoke(storageChannels.getCustom, key),
    setCustom: (key: string, data: any): void => ipc.send(storageChannels.setCustom, key, data),

    get: <K extends keyof StorageTypes>(key: K): Promise<StorageTypes[K]> => ipc.invoke(storageChannels.get, key),

    getAll: (): Promise<StorageTypes> => ipc.invoke(storageChannels.getAll),

    update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>): Promise<void> =>
      ipc.invoke(storageChannels.update, key, updateData),

    clear: (): Promise<void> => ipc.invoke(storageChannels.clear),
  },

  appWindow: {
    onHotkeysChange: (result: (event: IpcRendererEvent, input: LynxInput) => void) =>
      ipc.on(appWindowChannels.hotkeysChange, result),
    offHotkeysChange: () => ipc.removeAllListeners(appWindowChannels.hotkeysChange),
  },

  contextMenu: {
    resizeWindow: (dimensions: {width: number; height: number}) =>
      ipc.send(contextMenuChannels.resizeWindow, dimensions),
    showWindow: () => ipc.send(contextMenuChannels.showWindow),
    hideWindow: () => ipc.send(contextMenuChannels.hideWindow),

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

    openTerminateAI: (id: string) => ipc.send(contextMenuChannels.openTerminateAI, id),
    openTerminateTab: (id: string, customPosition?: {x: number; y: number}) =>
      ipc.send(contextMenuChannels.openTerminateTab, id, customPosition),
    openCloseApp: () => ipc.send(contextMenuChannels.openCloseApp),

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

    relaunchAI: (id: string) => ipc.send(contextMenuChannels.relaunchAI, id),
    onRelaunchAI: (result: (event: IpcRendererEvent, id: string) => void) =>
      ipc.on(contextMenuChannels.onRelaunchAI, result),
    offRelaunchAI: () => ipc.removeAllListeners(contextMenuChannels.onRelaunchAI),

    stopAI: (id: string) => ipc.send(contextMenuChannels.stopAI, id),
    onStopAI: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(contextMenuChannels.onStopAI, result),
    offStopAI: () => ipc.removeAllListeners(contextMenuChannels.onStopAI),

    removeTab: (tabID: string) => ipc.send(contextMenuChannels.removeTab, tabID),
    onRemoveTab: (result: (event: IpcRendererEvent, tabID: string) => void) =>
      ipc.on(contextMenuChannels.onRemoveTab, result),
    offRemoveTab: () => ipc.removeAllListeners(contextMenuChannels.onRemoveTab),
  },

  tab: {
    onNewTab: (result: (event: IpcRendererEvent, url: string) => void) => ipc.on(tabsChannels.onNewTab, result),

    offNewTab: () => ipc.removeAllListeners(tabsChannels.onNewTab),
  },

  contextItems: {
    copy: (id: number) => ipc.send(contextMenuChannels.copy, id),
    paste: (id: number) => ipc.send(contextMenuChannels.paste, id),
    replaceMisspelling: (id: number, text: string) => ipc.send(contextMenuChannels.replaceMisspelling, id, text),
    selectAll: (id: number) => ipc.send(contextMenuChannels.selectAll, id),

    undo: (id: number) => ipc.send(contextMenuChannels.undo, id),
    redo: (id: number) => ipc.send(contextMenuChannels.redo, id),

    newTab: (url: string) => ipc.send(contextMenuChannels.newTab, url),
    openExternal: (url: string) => ipc.send(contextMenuChannels.openExternal, url),

    downloadImage: (id: number, url: string) => ipc.send(contextMenuChannels.downloadImage, id, url),

    navigate: (id: number, action: 'back' | 'forward' | 'refresh') =>
      ipc.send(contextMenuChannels.navigate, id, action),
  },

  browser: {
    createBrowser: (id: string) => ipc.send(browserChannels.createBrowser, id),
    removeBrowser: (id: string) => ipc.send(browserChannels.removeBrowser, id),
    loadURL: (id: string, url: string) => ipc.send(browserChannels.loadURL, id, url),
    setVisible: (id: string, visible: boolean) => ipc.send(browserChannels.setVisible, id, visible),

    openFindInPage: (id: string, customPosition?: {x: number; y: number}) =>
      ipc.send(browserChannels.openFindInPage, id, customPosition),
    openZoom: (id: string) => ipc.send(browserChannels.openZoom, id),

    findInPage: (id: string, value: string, options: FindInPageOptions) =>
      ipc.send(browserChannels.findInPage, id, value, options),
    stopFindInPage: (id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') =>
      ipc.send(browserChannels.stopFindInPage, id, action),

    clearCache: () => ipc.send(browserChannels.clearCache),
    clearCookies: () => ipc.send(browserChannels.clearCookies),

    setZoomFactor: (id: string, factor: number) => ipc.send(browserChannels.setZoomFactor, id, factor),
    reload: (id: string) => ipc.send(browserChannels.reload, id),
    goBack: (id: string) => ipc.send(browserChannels.goBack, id),
    goForward: (id: string) => ipc.send(browserChannels.goForward, id),

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
  },
};

export default rendererIpc;
