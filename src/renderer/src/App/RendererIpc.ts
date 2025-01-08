import {IpcRendererEvent, OpenDialogOptions} from 'electron';

import {
  ChosenArgumentsData,
  DiscordRPC,
  ExtensionsInfo,
  FolderListData,
  FolderNames,
  ModulesInfo,
} from '../../../cross/CrossTypes';
import {
  appDataChannels,
  appUpdateChannels,
  AppUpdateStatus,
  CardInfo,
  ChangeWindowState,
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
  modulesChannels,
  OnPreCommands,
  OnUpdatingExtensions,
  PreCommands,
  PreOpen,
  PreOpenData,
  ptyChannels,
  PtyProcessOpt,
  RecentlyOperation,
  storageChannels,
  StorageOperation,
  storageUtilsChannels,
  SystemInfo,
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
  },

  /** Git operations */
  git: {
    abortClone: (): void => ipc.send(gitChannels.abortClone),

    bCardUpdateAvailable: (repoDir: string): Promise<boolean> => ipc.invoke(gitChannels.updateAvailable, repoDir),

    cloneRepo: (url: string, dir: string): void => ipc.send(gitChannels.cloneRepo, url, dir),
    clonePromise: (url: string, dir: string): Promise<void> => ipc.invoke(gitChannels.clonePromise, url, dir),

    locateCard: (url: string): Promise<string | undefined> => ipc.invoke(gitChannels.locate, url),

    validateGitDir: (dir: string, url: string): Promise<boolean> => ipc.invoke(gitChannels.validateGitDir, dir, url),

    onProgress: (callback: GitProgressCallback) => ipc.on(gitChannels.onProgress, callback),
    offProgress: () => ipc.removeAllListeners(gitChannels.onProgress),

    pull: (repoDir: string, id: string): void => ipc.send(gitChannels.pull, repoDir, id),
  },

  /** Managing app modules */
  module: {
    getModulesData: (): Promise<string[]> => ipc.invoke(modulesChannels.getModulesData),

    getInstalledModulesInfo: (): Promise<ModulesInfo[]> => ipc.invoke(modulesChannels.getInstalledModulesInfo),

    installModule: (url: string): Promise<boolean> => ipc.invoke(modulesChannels.installModule, url),

    uninstallModule: (id: string): Promise<boolean> => ipc.invoke(modulesChannels.uninstallModule, id),

    isUpdateAvailable: (id: string): Promise<boolean> => ipc.invoke(modulesChannels.isUpdateAvailable, id),
    anyUpdateAvailable: (): Promise<boolean> => ipc.invoke(modulesChannels.anyUpdateAvailable),

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

  /** Managing app extensions */
  extension: {
    getExtensionsData: (): Promise<string[]> => ipc.invoke(extensionsChannels.getExtensionsData),

    getInstalledExtensionsInfo: (): Promise<ExtensionsInfo[]> =>
      ipc.invoke(extensionsChannels.getInstalledExtensionsInfo),

    installExtension: (url: string): Promise<boolean> => ipc.invoke(extensionsChannels.installExtension, url),

    uninstallExtension: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.uninstallExtension, id),

    isUpdateAvailable: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.isUpdateAvailable, id),
    updateAvailableList: (): Promise<string[]> => ipc.invoke(extensionsChannels.updateAvailableList),

    updateExtension: (id: string): Promise<boolean> => ipc.invoke(extensionsChannels.updateExtension, id),

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

    pinnedCards: (opt: StorageOperation, id: string): Promise<string[]> =>
      ipc.invoke(storageUtilsChannels.pinnedCards, opt, id),
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

    updateZoomFactor: (data: {id: string; zoom: number}) => ipc.send(storageUtilsChannels.updateZoomFactor, data),
  },

  /** Utilities methods */
  utils: {
    getCardInfo: (id: string, repoDir: string, extensionsDir?: string): void =>
      ipc.send(utilsChannels.cardInfo, id, repoDir, extensionsDir),

    onCardInfo: (result: (event: IpcRendererEvent, cardInfo: CardInfo) => void) =>
      ipc.on(utilsChannels.onCardInfo, result),

    offCardInfo: (): void => ipc.removeAllListeners(utilsChannels.onCardInfo),

    updateAllExtensions: (data: {id: string; dir: string}): void => ipc.send(utilsChannels.updateAllExtensions, data),
    onUpdateAllExtensions: (result: (event: IpcRendererEvent, updateInfo: OnUpdatingExtensions) => void) =>
      ipc.on(utilsChannels.onUpdateAllExtensions, result),

    getExtensionsDetails: (dir: string): Promise<ExtensionsData> => ipc.invoke(utilsChannels.extensionsDetails, dir),

    getExtensionsUpdateStatus: (dir: string): Promise<ExtensionsUpdateStatus> =>
      ipc.invoke(utilsChannels.updateStatus, dir),

    cancelExtensionsData: (): void => ipc.send(utilsChannels.cancelExtensionsData),

    downloadFile: (url: string): void => ipc.send(utilsChannels.downloadFile, url),
    cancelDownload: (): void => ipc.send(utilsChannels.cancelDownload),
    onDownloadFile: (result: (event: IpcRendererEvent, progress: DownloadProgress) => void) =>
      ipc.on(utilsChannels.onDownloadFile, result),
    offDownloadFile: (): void => ipc.removeAllListeners(utilsChannels.onDownloadFile),

    decompressFile: (filePath: string): Promise<string> => ipc.invoke(utilsChannels.decompressFile, filePath),
  },

  /** Managing and using node-pty(Pseudo Terminal ) */
  pty: {
    process: (opt: PtyProcessOpt, cardId: string): void => ipc.send(ptyChannels.process, opt, cardId),
    customProcess: (opt: PtyProcessOpt, dir?: string, file?: string): void =>
      ipc.send(ptyChannels.customProcess, opt, dir, file),
    customCommands: (opt: PtyProcessOpt, commands?: string | string[], dir?: string) =>
      ipc.send(ptyChannels.customCommands, opt, commands, dir),

    write: (data: string): void => ipc.send(ptyChannels.write, data),

    resize: (cols: number, rows: number): void => ipc.send(ptyChannels.resize, cols, rows),

    onData: (result: (event: IpcRendererEvent, data: string, cardId: string) => void) =>
      ipc.on(ptyChannels.onData, result),

    offData: (): void => ipc.removeAllListeners(ptyChannels.onData),
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
  },

  /** Managing app storage data */
  storage: {
    get: <K extends keyof StorageTypes>(key: K): Promise<StorageTypes[K]> => ipc.invoke(storageChannels.get, key),

    getAll: (): Promise<StorageTypes> => ipc.invoke(storageChannels.getAll),

    update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>): Promise<void> =>
      ipc.invoke(storageChannels.update, key, updateData),

    clear: (): Promise<void> => ipc.invoke(storageChannels.clear),
  },
};

export default rendererIpc;
