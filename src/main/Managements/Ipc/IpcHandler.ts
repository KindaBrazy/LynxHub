import {app, ipcMain, nativeTheme, shell} from 'electron';

import {ChosenArgumentsData, DiscordRPC, FolderNames} from '../../../cross/CrossTypes';
import {
  appDataChannels,
  ChangeWindowState,
  CloneDirTypes,
  DarkModeTypes,
  DiscordRunningAI,
  extensionsChannels,
  fileChannels,
  gitChannels,
  modulesChannels,
  OpenDialogOptions,
  PreCommands,
  PreOpen,
  ptyChannels,
  PtyProcessOpt,
  RecentlyOperation,
  storageChannels,
  StorageOperation,
  storageUtilsChannels,
  TaskbarStatus,
  utilsChannels,
  winChannels,
} from '../../../cross/IpcChannelAndTypes';
import StorageTypes, {InstalledCard} from '../../../cross/StorageTypes';
import {appManager, discordRpcManager, extensionManager, moduleManager, storageManager} from '../../index';
import {getSystemDarkMode, openDialog} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {
  changeWindowState,
  checkFilesExist,
  decompressFile,
  getRelativeList,
  removeDir,
  setDarkMode,
  setDiscordRP,
  setTaskbarStatus,
  trashDir,
} from './Methods/IpcMethods';
import {
  disableLoadingExtensions,
  getExtensionsDetails,
  getExtensionsUpdate,
  updateAllExtensions,
} from './Methods/IpcMethods-CardExtensions';
import {cancelDownload, downloadFile} from './Methods/IpcMethods-Downloader';
import {getSystemInfo} from './Methods/IpcMethods-Platform';
import {customPtyCommands, customPtyProcess, ptyProcess, ptyResize, ptyWrite} from './Methods/IpcMethods-Pty';
import {
  abortGitOperation,
  clonePromise,
  cloneRepo,
  getRepoInfo,
  pullRepo,
  validateGitDir,
} from './Methods/IpcMethods-Repository';

function win() {
  ipcMain.on(winChannels.changeState, (_, state: ChangeWindowState) => changeWindowState(state));
  ipcMain.handle(winChannels.getSystemDarkMode, () => getSystemDarkMode());
  ipcMain.on(winChannels.setDarkMode, (_, darkMode: DarkModeTypes) => setDarkMode(darkMode));

  nativeTheme.on('updated', () => {
    if (storageManager.getData('app').darkMode === 'system') {
      appManager.getWebContent()?.send(winChannels.onDarkMode, getSystemDarkMode());
    }
  });

  ipcMain.on(winChannels.setTaskBarStatus, (_, status: TaskbarStatus) => setTaskbarStatus(status));

  ipcMain.on(winChannels.setDiscordRP, (_, discordRp: DiscordRPC) => setDiscordRP(discordRp));

  ipcMain.on(winChannels.setDiscordRpAiRunning, (_, status: DiscordRunningAI) => discordRpcManager.runningAI(status));

  ipcMain.handle(winChannels.getSystemInfo, () => getSystemInfo());
}

function file() {
  ipcMain.handle(fileChannels.getAppDirectories, (_, name: FolderNames) => getAppDirectory(name));

  ipcMain.handle(fileChannels.dialog, (_, option: OpenDialogOptions) => openDialog(option));

  ipcMain.on(fileChannels.openPath, (_, dir: string) => shell.openPath(dir));

  ipcMain.handle(fileChannels.removeDir, (_, dir: string) => removeDir(dir));
  ipcMain.handle(fileChannels.trashDir, (_, dir: string) => trashDir(dir));

  ipcMain.handle(fileChannels.listDir, async (_e, dirPath: string, relatives: string[]) =>
    getRelativeList(dirPath, relatives),
  );

  ipcMain.handle(fileChannels.checkFilesExist, (_, dir: string, fileNames: string[]) =>
    checkFilesExist(dir, fileNames),
  );
}

function git() {
  ipcMain.handle(gitChannels.locate, (_, url: string) => GitManager.locateCard(url));
  ipcMain.handle(gitChannels.validateGitDir, (_, dir: string, url: string) => validateGitDir(dir, url));

  ipcMain.on(gitChannels.cloneRepo, (_, url: string, dir: CloneDirTypes) => cloneRepo(url, dir));
  ipcMain.handle(gitChannels.clonePromise, (_, url: string, dir: CloneDirTypes) => clonePromise(url, dir));

  ipcMain.on(gitChannels.abortClone, () => abortGitOperation());

  ipcMain.handle(gitChannels.updateAvailable, (_, dir: string) => GitManager.isUpdateAvailable(dir));

  ipcMain.on(gitChannels.pull, (_, dir: string, id: string) => pullRepo(dir, id));
}

function utils() {
  ipcMain.on(utilsChannels.cardInfo, (_, id: string, repoDir: string, extensionsDir?: string) =>
    getRepoInfo(id, repoDir, extensionsDir),
  );

  ipcMain.handle(utilsChannels.extensionsDetails, (_, dir: string) => getExtensionsDetails(dir));
  ipcMain.handle(utilsChannels.updateStatus, (_, dir: string) => getExtensionsUpdate(dir));

  ipcMain.on(utilsChannels.updateAllExtensions, (_, data: {id: string; dir: string}) => updateAllExtensions(data));

  ipcMain.on(utilsChannels.cancelExtensionsData, () => disableLoadingExtensions());

  ipcMain.on(utilsChannels.downloadFile, (_, url: string) => downloadFile(url));
  ipcMain.on(utilsChannels.cancelDownload, () => cancelDownload());

  ipcMain.handle(utilsChannels.decompressFile, (_, filePath: string) => decompressFile(filePath));
}

function modules() {
  ipcMain.handle(modulesChannels.getModulesData, () => moduleManager.getPluginData());
  ipcMain.handle(modulesChannels.getInstalledModulesInfo, () => moduleManager.getInstalledPluginInfo());

  ipcMain.handle(modulesChannels.installModule, (_, url: string) => moduleManager.installPlugin(url));
  ipcMain.handle(modulesChannels.uninstallModule, (_, id: string) => moduleManager.uninstallPlugin(id));
  ipcMain.handle(modulesChannels.isUpdateAvailable, (_, id: string) => moduleManager.isUpdateAvailable(id));
  ipcMain.handle(modulesChannels.anyUpdateAvailable, () => moduleManager.anyUpdateAvailable());
  ipcMain.handle(modulesChannels.updateModule, (_, id: string) => moduleManager.updatePlugin(id));
  ipcMain.handle(modulesChannels.updateAllModules, () => moduleManager.updateAllPlugins());
}

function extensions() {
  ipcMain.handle(extensionsChannels.getExtensionsData, () => extensionManager.getPluginData());
  ipcMain.handle(extensionsChannels.getInstalledExtensionsInfo, () => extensionManager.getInstalledPluginInfo());

  ipcMain.handle(extensionsChannels.installExtension, (_, url: string) => extensionManager.installPlugin(url));
  ipcMain.handle(extensionsChannels.uninstallExtension, (_, id: string) => extensionManager.uninstallPlugin(id));
  ipcMain.handle(extensionsChannels.isUpdateAvailable, (_, id: string) => extensionManager.isUpdateAvailable(id));
  ipcMain.handle(extensionsChannels.anyUpdateAvailable, () => extensionManager.anyUpdateAvailable());
  ipcMain.handle(extensionsChannels.updateExtension, (_, id: string) => extensionManager.updatePlugin(id));
  ipcMain.handle(extensionsChannels.updateAllExtensions, () => extensionManager.updateAllPlugins());
}

function pty() {
  ipcMain.on(ptyChannels.process, (_, opt: PtyProcessOpt, cardId: string) => ptyProcess(opt, cardId));
  ipcMain.on(ptyChannels.customProcess, (_, opt: PtyProcessOpt, dir?: string, file?: string) =>
    customPtyProcess(opt, dir, file),
  );
  ipcMain.on(ptyChannels.customCommands, (_, opt: PtyProcessOpt, commands?: string | string[], dir?: string) =>
    customPtyCommands(opt, commands, dir),
  );
  ipcMain.on(ptyChannels.write, (_, data: string) => ptyWrite(data));
  ipcMain.on(ptyChannels.resize, (_, cols: number, rows: number) => ptyResize(cols, rows));
}

function appData() {
  ipcMain.handle(appDataChannels.getCurrentPath, () => getAppDataPath());
  ipcMain.handle(appDataChannels.selectAnother, () => selectNewAppDataFolder());
}

function storage() {
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

  ipcMain.handle(storageUtilsChannels.pinnedCards, (_, opt: StorageOperation, id: string) =>
    storageManager.pinnedCardsOpt(opt, id),
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

  ipcMain.on(storageUtilsChannels.updateZoomFactor, (_, data) => storageManager.updateZoomFactor(data));
}

function modulesIpc() {
  moduleManager.listenForChannels();
}

function extensionsIpc() {
  extensionManager.listenForChannels();
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
  modulesIpc();

  extensions();
  extensionsIpc();
}
