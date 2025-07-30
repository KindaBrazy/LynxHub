import path from 'node:path';

import {app, FindInPageOptions, ipcMain, nativeTheme, OpenDialogOptions, shell} from 'electron';

import {ChosenArgumentsData, DiscordRPC, FolderNames} from '../../../cross/CrossTypes';
import {toMs} from '../../../cross/CrossUtils';
import {
  AgentTypes,
  appDataChannels,
  browserChannels,
  ChangeWindowState,
  contextMenuChannels,
  DarkModeTypes,
  DiscordRunningAI,
  extensionsChannels,
  fileChannels,
  gitChannels,
  moduleApiChannels,
  modulesChannels,
  PreCommands,
  PreOpen,
  ptyChannels,
  PtyProcessOpt,
  RecentlyOperation,
  staticsChannels,
  storageChannels,
  StorageOperation,
  storageUtilsChannels,
  TaskbarStatus,
  utilsChannels,
  WHType,
  winChannels,
} from '../../../cross/IpcChannelAndTypes';
import StorageTypes, {InstalledCard} from '../../../cross/StorageTypes';
import {appManager, discordRpcManager, extensionManager, moduleManager, storageManager} from '../../index';
import calcFolderSize from '../../Utilities/CalculateFolderSize/CalculateFolderSize';
import {
  getAbsolutePath,
  getDirCreationDate,
  getRelativePath,
  getSystemDarkMode,
  getUserAgent,
  openDialog,
} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, isAppDir, selectNewAppDataFolder} from '../AppDataManager';
import BrowserDownloadManager from '../BrowserDownloadManager';
import BrowserManager from '../BrowserManager';
import {listenForContextChannels} from '../ContextMenuManager';
import GitManager from '../GitManager';
import StaticsManager from '../StaticsManager';
import {
  changeWindowState,
  checkFilesExist,
  decompressFile,
  getImageAsDataURL,
  getRelativeList,
  isEmptyDir,
  isResponseValid,
  removeDir,
  setDarkMode,
  setDiscordRP,
  setTaskbarStatus,
  trashDir,
} from './Methods/IpcMethods';
import {
  disableExtension,
  disableLoadingExtensions,
  getExtensionsDetails,
  getExtensionsUpdate,
  updateAllExtensions,
} from './Methods/IpcMethods-CardExtensions';
import {cancelDownload, downloadFile} from './Methods/IpcMethods-Downloader';
import {getSystemInfo} from './Methods/IpcMethods-Platform';
import {
  customPtyCommands,
  customPtyProcess,
  emptyPtyProcess,
  ptyClear,
  ptyProcess,
  ptyResize,
  ptyWrite,
} from './Methods/IpcMethods-Pty';
import {
  changeBranch,
  cloneShallow,
  cloneShallowPromise,
  getRepositoryInfo,
  pullRepo,
  resetHard,
  stashDrop,
  unShallow,
  validateGitDir,
} from './Methods/IpcMethods-Repository';

function win() {
  ipcMain.on(winChannels.changeState, (_, state: ChangeWindowState) => changeWindowState(state));
  ipcMain.handle(winChannels.getSystemDarkMode, () => getSystemDarkMode());
  ipcMain.on(winChannels.setDarkMode, (_, darkMode: DarkModeTypes) => setDarkMode(darkMode));

  nativeTheme.on('updated', () => {
    if (storageManager.getData('app').darkMode === 'system') {
      appManager?.getWebContent()?.send(winChannels.onDarkMode, getSystemDarkMode());
      appManager?.getContextMenuWindow()?.webContents.send(winChannels.onDarkMode, getSystemDarkMode());
    }
  });

  ipcMain.on(winChannels.setTaskBarStatus, (_, status: TaskbarStatus) => setTaskbarStatus(status));

  ipcMain.on(winChannels.setDiscordRP, (_, discordRp: DiscordRPC) => setDiscordRP(discordRp));

  ipcMain.on(winChannels.setDiscordRpAiRunning, (_, status: DiscordRunningAI) => discordRpcManager?.runningAI(status));

  ipcMain.handle(winChannels.getSystemInfo, () => getSystemInfo());

  ipcMain.on(winChannels.openUrlDefaultBrowser, (_, url: string) => shell.openExternal(url));
}

function file() {
  ipcMain.handle(fileChannels.getAppDirectories, (_, name: FolderNames) => getAppDirectory(name));

  ipcMain.handle(fileChannels.dialog, (_, option: OpenDialogOptions) => openDialog(option));

  ipcMain.on(fileChannels.openPath, (_, dir: string) => shell.openPath(path.resolve(dir)));

  ipcMain.handle(fileChannels.removeDir, (_, dir: string) => removeDir(dir));
  ipcMain.handle(fileChannels.trashDir, (_, dir: string) => trashDir(dir));
  ipcMain.handle(fileChannels.isEmptyDir, (_, dir: string) => isEmptyDir(dir));

  ipcMain.handle(fileChannels.listDir, async (_e, dirPath: string, relatives: string[]) =>
    getRelativeList(dirPath, relatives),
  );

  ipcMain.handle(fileChannels.checkFilesExist, (_, dir: string, fileNames: string[]) =>
    checkFilesExist(dir, fileNames),
  );

  ipcMain.handle(fileChannels.calcFolderSize, (_, dir) => calcFolderSize(dir));
  ipcMain.handle(fileChannels.getRelativePath, (_, basePath: string, targetPath: string) =>
    getRelativePath(basePath, targetPath),
  );
  ipcMain.handle(fileChannels.getAbsolutePath, (_, basePath: string, targetPath: string) =>
    getAbsolutePath(basePath, targetPath),
  );
}

function git() {
  ipcMain.handle(gitChannels.validateGitDir, (_, dir: string, url: string) => validateGitDir(dir, url));

  ipcMain.on(
    gitChannels.cloneShallow,
    (_, url: string, directory: string, singleBranch: boolean, depth?: number, branch?: string) =>
      cloneShallow(url, directory, singleBranch, depth, branch),
  );
  ipcMain.handle(
    gitChannels.cloneShallowPromise,
    (_, url: string, directory: string, singleBranch: boolean, depth?: number, branch?: string) =>
      cloneShallowPromise(url, directory, singleBranch, depth, branch),
  );

  ipcMain.handle(gitChannels.stashDrop, (_, dir: string) => stashDrop(dir));
  ipcMain.handle(gitChannels.getRepoInfo, (_, dir: string) => getRepositoryInfo(dir));
  ipcMain.handle(gitChannels.changeBranch, (_, dir: string, branchName: string) => changeBranch(dir, branchName));
  ipcMain.handle(gitChannels.unShallow, (_, dir: string) => unShallow(dir));
  ipcMain.handle(gitChannels.resetHard, (_, dir: string) => resetHard(dir));

  ipcMain.on(gitChannels.pull, (_, dir: string, id: string) => pullRepo(dir, id));
}

function utils() {
  ipcMain.handle(utilsChannels.extensionsDetails, (_, dir: string) => getExtensionsDetails(dir));
  ipcMain.handle(utilsChannels.updateStatus, (_, dir: string) => getExtensionsUpdate(dir));

  ipcMain.on(utilsChannels.updateAllExtensions, (_, data: {id: string; dir: string}) => updateAllExtensions(data));
  ipcMain.handle(utilsChannels.disableExtension, (_, disable: boolean, dir: string) => disableExtension(disable, dir));

  ipcMain.on(utilsChannels.cancelExtensionsData, () => disableLoadingExtensions());

  ipcMain.on(utilsChannels.downloadFile, (_, url: string) => downloadFile(url));
  ipcMain.on(utilsChannels.cancelDownload, () => cancelDownload());

  ipcMain.handle(utilsChannels.decompressFile, (_, filePath: string) => decompressFile(filePath));

  ipcMain.handle(utilsChannels.isResponseValid, (_, url: string) => isResponseValid(url));
  ipcMain.handle(utilsChannels.getImageAsDataURL, (_, url: string) => getImageAsDataURL(url));
}

function modules() {
  ipcMain.handle(
    modulesChannels.cardUpdateAvailable,
    (_, card: InstalledCard, updateType: 'git' | 'stepper' | undefined) =>
      moduleManager?.checkCardUpdate(card, updateType),
  );

  ipcMain.handle(modulesChannels.getModulesData, () => moduleManager?.getPluginData());
  ipcMain.handle(modulesChannels.getInstalledModulesInfo, () => moduleManager?.getInstalledPluginInfo());
  ipcMain.handle(modulesChannels.getSkipped, () => moduleManager?.getSkipped());
  ipcMain.handle(modulesChannels.checkEa, (_, isEA: boolean, isInsider: boolean) =>
    moduleManager?.checkEA(isEA, isInsider),
  );

  ipcMain.handle(modulesChannels.installModule, (_, url: string) => moduleManager?.installPlugin(url));
  ipcMain.handle(modulesChannels.uninstallModule, (_, id: string) => moduleManager?.uninstallPlugin(id));
  ipcMain.handle(modulesChannels.uninstallCardByID, (_, id: string) => moduleManager?.uninstallCardByID(id));
  ipcMain.handle(modulesChannels.isUpdateAvailable, (_, id: string) => moduleManager?.isUpdateAvailable(id));
  ipcMain.handle(modulesChannels.updateAvailableList, () => moduleManager?.updateAvailableList());
  ipcMain.handle(modulesChannels.updateModule, (_, id: string) => moduleManager?.updatePlugin(id));
  ipcMain.handle(modulesChannels.updateAllModules, () => moduleManager?.updateAllPlugins());

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

function extensions() {
  ipcMain.handle(extensionsChannels.getExtensionsData, () => extensionManager.getPluginData());
  ipcMain.handle(extensionsChannels.getInstalledExtensionsInfo, () => extensionManager.getInstalledPluginInfo());
  ipcMain.handle(extensionsChannels.getSkipped, () => extensionManager.getSkipped());
  ipcMain.handle(extensionsChannels.checkEa, (_, isEA: boolean, isInsider: boolean) =>
    extensionManager.checkEA(isEA, isInsider),
  );

  ipcMain.handle(extensionsChannels.installExtension, (_, url: string) => extensionManager.installPlugin(url));
  ipcMain.handle(extensionsChannels.uninstallExtension, (_, id: string) => extensionManager.uninstallPlugin(id));
  ipcMain.handle(extensionsChannels.isUpdateAvailable, (_, id: string) => extensionManager.isUpdateAvailable(id));
  ipcMain.handle(extensionsChannels.updateAvailableList, () => extensionManager.updateAvailableList());
  ipcMain.handle(extensionsChannels.updateExtension, (_, id: string) => extensionManager.updatePlugin(id));
  ipcMain.handle(extensionsChannels.updateAllExtensions, () => extensionManager.updateAllPlugins());
}

function pty() {
  ipcMain.on(ptyChannels.process, (_, id: string, opt: PtyProcessOpt, cardId: string) => ptyProcess(id, opt, cardId));
  ipcMain.on(ptyChannels.customProcess, (_, id: string, opt: PtyProcessOpt, dir?: string, file?: string) =>
    customPtyProcess(id, opt, dir, file),
  );
  ipcMain.on(ptyChannels.emptyProcess, (_, id: string, opt: PtyProcessOpt, dir?: string) =>
    emptyPtyProcess(id, opt, dir),
  );
  ipcMain.on(
    ptyChannels.customCommands,
    (_, id: string, opt: PtyProcessOpt, commands?: string | string[], dir?: string) =>
      customPtyCommands(id, opt, commands, dir),
  );
  ipcMain.on(ptyChannels.write, (_, id: string, data: string) => ptyWrite(id, data));
  ipcMain.on(ptyChannels.clear, (_, id: string) => ptyClear(id));
  ipcMain.on(ptyChannels.resize, (_, id: string, cols: number, rows: number) => ptyResize(id, cols, rows));
}

function appData() {
  ipcMain.handle(appDataChannels.getCurrentPath, () => getAppDataPath());
  ipcMain.handle(appDataChannels.selectAnother, () => selectNewAppDataFolder());
  ipcMain.handle(appDataChannels.isAppDir, (_, dir: string) => isAppDir(dir));
}

function storage() {
  ipcMain.handle(storageChannels.getCustom, (_, key: string) => storageManager.getCustomData(key));
  ipcMain.on(storageChannels.setCustom, (_, key: string, data: any) => storageManager.setCustomData(key, data));

  ipcMain.handle(storageChannels.get, (_, key: keyof StorageTypes) => storageManager.getData(key));
  ipcMain.handle(storageChannels.getAll, () => storageManager.getAll());

  ipcMain.handle(
    storageChannels.update,
    async (_, key: keyof StorageTypes, updateData: Partial<StorageTypes[keyof StorageTypes]>) => {
      return storageManager.updateData(key, updateData);
    },
  );

  ipcMain.handle(storageChannels.clear, () => storageManager.clearStorage());
}

function storageUtilsIpc() {
  ipcMain.on(storageUtilsChannels.setSystemStartup, (_, startup: boolean) => {
    app.setLoginItemSettings({openAtLogin: startup});
    storageManager.updateData('app', {systemStartup: startup});
  });

  ipcMain.on(storageUtilsChannels.addInstalledCard, (_, cardData: InstalledCard) =>
    storageManager.addInstalledCard(cardData),
  );
  ipcMain.on(storageUtilsChannels.removeInstalledCard, (_, cardId: string) =>
    storageManager.removeInstalledCard(cardId),
  );

  ipcMain.on(storageUtilsChannels.addAutoUpdateCard, (_, cardId: string) => storageManager.addAutoUpdateCard(cardId));
  ipcMain.on(storageUtilsChannels.removeAutoUpdateCard, (_, cardId: string) =>
    storageManager.removeAutoUpdateCard(cardId),
  );

  ipcMain.on(storageUtilsChannels.addAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.addAutoUpdateExtensions(cardId),
  );
  ipcMain.on(storageUtilsChannels.removeAutoUpdateExtensions, (_, cardId: string) =>
    storageManager.removeAutoUpdateExtensions(cardId),
  );

  ipcMain.handle(storageUtilsChannels.pinnedCards, (_, opt: StorageOperation, id: string, pinnedCards?: string[]) =>
    storageManager.pinnedCardsOpt(opt, id, pinnedCards),
  );

  ipcMain.handle(storageUtilsChannels.recentlyUsedCards, (_, opt: RecentlyOperation, id: string) =>
    storageManager.recentlyUsedCardsOpt(opt, id),
  );

  ipcMain.handle(storageUtilsChannels.homeCategory, (_, opt: StorageOperation, data: string[]) =>
    storageManager.homeCategoryOpt(opt, data),
  );

  ipcMain.handle(storageUtilsChannels.preCommands, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.preCommandOpt(opt, data),
  );

  ipcMain.handle(storageUtilsChannels.customRun, (_, opt: StorageOperation, data: PreCommands) =>
    storageManager.customRunOpt(opt, data),
  );

  ipcMain.handle(storageUtilsChannels.preOpen, (_, opt: StorageOperation, data: PreOpen) =>
    storageManager.preOpenOpt(opt, data),
  );

  ipcMain.on(storageUtilsChannels.customRunBehavior, (_, data) => storageManager.updateCustomRunBehavior(data));

  ipcMain.handle(storageUtilsChannels.getCardArguments, (_, cardId: string) =>
    storageManager.getCardArgumentsById(cardId),
  );
  ipcMain.handle(storageUtilsChannels.setCardArguments, (_, cardId: string, args: ChosenArgumentsData) =>
    storageManager.setCardArguments(cardId, args),
  );

  ipcMain.on(storageUtilsChannels.updateZoomFactor, (_, zoomFactor: number) =>
    storageManager.updateData('cards', {zoomFactor}),
  );

  ipcMain.on(storageUtilsChannels.addBrowserRecent, (_, recentEntry: string) =>
    storageManager.addBrowserRecent(recentEntry),
  );
  ipcMain.on(storageUtilsChannels.addBrowserFavorite, (_, favoriteEntry: string) =>
    storageManager.addBrowserFavorite(favoriteEntry),
  );
  ipcMain.on(storageUtilsChannels.addBrowserHistory, (_, historyEntry: string) =>
    storageManager.addBrowserHistory(historyEntry),
  );

  ipcMain.on(storageUtilsChannels.addBrowserRecentFavIcon, (_, url: string, favIcon: string) =>
    storageManager.addBrowserFavIcon(url, favIcon),
  );
  ipcMain.on(storageUtilsChannels.removeBrowserRecent, (_, url: string) => storageManager.removeBrowserRecent(url));
  ipcMain.on(storageUtilsChannels.removeBrowserFavorite, (_, url: string) => storageManager.removeBrowserFavorite(url));
  ipcMain.on(storageUtilsChannels.removeBrowserHistory, (_, url: string) => storageManager.removeBrowserHistory(url));

  ipcMain.on(
    storageUtilsChannels.setShowConfirm,
    (_, type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) =>
      storageManager.setShowConfirm(type, enable),
  );

  ipcMain.on(storageUtilsChannels.addReadNotif, (_, id: string) => storageManager.addReadNotif(id));

  ipcMain.on(storageUtilsChannels.setCardTerminalPreCommands, (_, id: string, commands: string[]) =>
    storageManager.setCardTerminalPreCommands(id, commands),
  );
  ipcMain.handle(storageUtilsChannels.unassignCard, (_, id: string, clearConfigs: boolean) =>
    storageManager.unassignCard(id, clearConfigs),
  );
  ipcMain.handle(storageUtilsChannels.getBrowserHistoryData, () => storageManager.getBrowserDataSecurely());
}

function modulesIpc() {
  moduleManager?.listenForChannels();
}

function extensionsIpc() {
  extensionManager.listenForChannels();
}

function modulesApi() {
  ipcMain.handle(moduleApiChannels.getFolderCreationTime, (_, dir: string) => getDirCreationDate(dir));
  ipcMain.handle(moduleApiChannels.getLastPulledDate, (_, dir: string) => GitManager.getLastPulledDate(dir));
  ipcMain.handle(moduleApiChannels.getCurrentReleaseTag, (_, dir: string) => GitManager.getCurrentReleaseTag(dir));
}

export function browserIPC() {
  const mainWindow = appManager?.getMainWindow();

  if (!mainWindow) {
    setTimeout(browserIPC, toMs(1, 'seconds'));
    return;
  }

  const browserManager: BrowserManager = new BrowserManager(mainWindow);
  new BrowserDownloadManager(browserManager.getSession(), mainWindow.webContents);

  ipcMain.on(browserChannels.createBrowser, (_, id: string) => browserManager.createBrowser(id));
  ipcMain.on(browserChannels.removeBrowser, (_, id: string) => browserManager.removeBrowser(id));
  ipcMain.on(browserChannels.loadURL, (_, id: string, url: string) => browserManager.loadURL(id, url));
  ipcMain.on(browserChannels.setVisible, (_, id: string, visible: boolean) => browserManager.setVisible(id, visible));

  ipcMain.on(browserChannels.findInPage, (_, id: string, value: string, options: FindInPageOptions) =>
    browserManager.findInPage(id, value, options),
  );
  ipcMain.on(
    browserChannels.stopFindInPage,
    (_, id: string, action: 'clearSelection' | 'keepSelection' | 'activateSelection') =>
      browserManager.stopFindInPage(id, action),
  );

  ipcMain.on(browserChannels.setZoomFactor, (_, id: string, factor: number) =>
    browserManager.setZoomFactor(id, factor),
  );

  ipcMain.on(browserChannels.openFindInPage, (_, id: string, customPosition?: {x: number; y: number}) => {
    appManager?.setCustomContextPosition(customPosition);
    appManager?.getContextMenuWindow()?.webContents.send(contextMenuChannels.onFind, id);
  });
  ipcMain.on(browserChannels.openZoom, (_, id: string) => {
    appManager?.setCustomContextPosition(undefined);
    appManager
      ?.getContextMenuWindow()
      ?.webContents.send(contextMenuChannels.onZoom, id, browserManager.getCurrentZoom(id));
  });
  ipcMain.on(contextMenuChannels.openTerminateAI, (_, id: string) => {
    appManager?.setCustomContextPosition(undefined);
    appManager?.getContextMenuWindow()?.webContents.send(contextMenuChannels.onTerminateAI, id);
  });
  ipcMain.on(contextMenuChannels.openTerminateTab, (_, id: string, customPosition?: {x: number; y: number}) => {
    appManager?.setCustomContextPosition(customPosition);
    appManager?.getContextMenuWindow()?.webContents.send(contextMenuChannels.onTerminateTab, id);
  });
  ipcMain.on(contextMenuChannels.openCloseApp, () => {
    appManager?.setCustomContextPosition(undefined);
    appManager?.getContextMenuWindow()?.webContents.send(contextMenuChannels.onCloseApp);
  });

  ipcMain.on(browserChannels.reload, (_, id: string) => browserManager.reload(id));
  ipcMain.on(browserChannels.goBack, (_, id: string) => browserManager.goBack(id));
  ipcMain.on(browserChannels.goForward, (_, id: string) => browserManager.goForward(id));

  ipcMain.on(browserChannels.focusWebView, (_, id: string) => browserManager.focusWebView(id));

  ipcMain.on(browserChannels.clearCache, () => browserManager.clearCache());
  ipcMain.on(browserChannels.clearCookies, () => browserManager.clearCookies());

  ipcMain.handle(browserChannels.getUserAgent, (_, type: AgentTypes) => getUserAgent(type));
  ipcMain.on(browserChannels.updateUserAgent, () => {
    browserManager.updateUserAgent();
    appManager?.getMainWindow()?.webContents.setUserAgent(getUserAgent());
  });

  ipcMain.on(browserChannels.addOffset, (_, id: string, offset: WHType) => browserManager.addOffset(id, offset));
}

function statics() {
  const staticManager: StaticsManager = new StaticsManager();
  staticManager.checkRequirements();

  ipcMain.handle(staticsChannels.pull, () => staticManager.pull());
  ipcMain.handle(staticsChannels.getReleases, () => staticManager.getReleases());
  ipcMain.handle(staticsChannels.getInsider, () => staticManager.getInsider());
  ipcMain.handle(staticsChannels.getNotification, () => staticManager.getNotification());
  ipcMain.handle(staticsChannels.getModules, () => staticManager.getModules());
  ipcMain.handle(staticsChannels.getExtensions, () => staticManager.getExtensions());
  ipcMain.handle(staticsChannels.getExtensionsEA, () => staticManager.getExtensionsEA());
  ipcMain.handle(staticsChannels.getPatrons, () => staticManager.getPatrons());
}

export function listenToAllChannels() {
  appData();
  storage();
  storageUtilsIpc();

  win();
  file();

  git();
  utils();
  pty();

  modules();
  modulesApi();
  modulesIpc();

  extensions();
  extensionsIpc();

  listenForContextChannels();

  statics();
}
