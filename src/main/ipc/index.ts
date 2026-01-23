import modulesChannels, {moduleApiChannels} from '@lynx_cross/consts/ipc_channels/module';
import pluginChannels from '@lynx_cross/consts/ipc_channels/plugins';
import {ipcMain} from 'electron';

import {SubscribeStages} from '../../cross/types';
import {InstalledCard} from '../../cross/types/storage';
import classHolder from '../core/class_holder';
import GitManager from '../git';
import {getList} from '../plugins/utils';
import {getDirCreationDate} from '../utils';
import listenApplication from './application';
import listenContextMenu from './context_menu';
import listenFiles from './files';
import listenGit from './git';
import listenPty from './pty';
import listenStatics from './statics';
import listenStorage, {listenStorageUtils} from './storage';
import listenUtils from './utils';

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

export function listenToIpcChannels() {
  listenStorage();
  listenStorageUtils();

  listenApplication();
  listenFiles();

  listenGit();
  listenUtils();
  listenPty();

  modules();
  modulesApi();
  modulesIpc();

  extensionsIpc();

  plugins();

  const {linkPreviewManager} = classHolder;
  listenContextMenu();
  if (linkPreviewManager) linkPreviewManager.listenForChannels();

  listenStatics();
}
