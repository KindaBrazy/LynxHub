import {app, ipcMain, nativeTheme, shell} from 'electron';

import {ChosenArgumentsData, DiscordRPC, FolderNames} from '../../../cross/CrossTypes';
import {
  appDataChannels,
  ChangeWindowState,
  CloneDirTypes,
  DarkModeTypes,
  DiscordRunningAI,
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
import {appManager, discordRpcManager, moduleManager, storageManager} from '../../index';
import {getSystemDarkMode, openDialog} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {
  changeWindowState,
  removeDir,
  setDarkMode,
  setDiscordRP,
  setTaskbarStatus,
  trashDir,
} from './Methods/IpcMethods';
import {disableLoadingExtensions, getExtensionsDetails, getExtensionsUpdate} from './Methods/IpcMethods-CardExtensions';
import {getSystemInfo} from './Methods/IpcMethods-Platform';
import {ptyProcess, ptyResize, ptyWrite} from './Methods/IpcMethods-Pty';
import {abortGitOperation, cloneRepo, getRepoInfo, pullRepo} from './Methods/IpcMethods-Repository';

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

  ipcMain.on(fileChannels.openPath, (_, path: string) => shell.openPath(path));

  ipcMain.handle(fileChannels.removeDir, (_, dir: string) => removeDir(dir));
  ipcMain.handle(fileChannels.trashDir, (_, dir: string) => trashDir(dir));
}

function git() {
  ipcMain.handle(gitChannels.locate, (_, url: string) => GitManager.locateCard(url));

  ipcMain.on(gitChannels.cloneRepo, (_, url: string, dir: CloneDirTypes) => cloneRepo(url, dir));

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

  ipcMain.on(utilsChannels.cancelExtensionsData, () => disableLoadingExtensions());
}

function modules() {
  ipcMain.handle(modulesChannels.getModulesData, () => moduleManager.getModulesData());
  ipcMain.handle(modulesChannels.getInstalledModulesInfo, () => moduleManager.getInstalledModulesInfo());

  ipcMain.handle(modulesChannels.installModule, (_, url: string) => moduleManager.installModule(url));
  ipcMain.handle(modulesChannels.uninstallModule, (_, id: string) => moduleManager.uninstallModule(id));
  ipcMain.handle(modulesChannels.isUpdateAvailable, (_, id: string) => moduleManager.isUpdateAvailable(id));
  ipcMain.handle(modulesChannels.anyUpdateAvailable, () => moduleManager.anyUpdateAvailable());
  ipcMain.handle(modulesChannels.updateModule, (_, id: string) => moduleManager.updateModule(id));
  ipcMain.handle(modulesChannels.updateAllModules, () => moduleManager.updateAllModules());
}

function pty() {
  ipcMain.on(ptyChannels.process, (_, opt: PtyProcessOpt, cardId: string) => ptyProcess(opt, cardId));
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

  ipcMain.handle(storageUtilsChannels.getCardArguments, (_, cardId: string) =>
    storageManager.getCardArgumentsById(cardId),
  );
  ipcMain.handle(storageUtilsChannels.setCardArguments, (_, cardId: string, args: ChosenArgumentsData) =>
    storageManager.setCardArguments(cardId, args),
  );
}

export function listenToAllChannels() {
  win();
  file();
  git();
  utils();
  modules();
  pty();
  appData();
  storage();
  storageUtilsIpc();
}
