import pluginChannels from '@lynx_common/consts/ipcChannels/plugins';
import {SubscribeStages} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';
import {
  PluginAddresses,
  PluginInstalledItem,
  PluginItem,
  PluginSyncItem,
  UnloadedPlugins,
} from '@lynx_common/types/plugins';
import classHolder from '@lynx_main/managers/classHolder';
import {getList} from '@lynx_main/plugins/utils';

import lynxIpc from '../lynxIpc';
import {sendToMain} from '../sender';

export default async function listenPlugins() {
  const pluginManager = await classHolder.waitForClass('pluginManager');

  // Gets plugin server addresses
  pluginsIpc.handle.getAddresses(() => pluginManager.getAddresses());

  // Gets list of installed plugins
  pluginsIpc.handle.getInstalledList(() => pluginManager.getInstalledList());

  // Gets list of unloaded plugins
  pluginsIpc.handle.getUnloadedList(() => pluginManager.getUnloadedList());

  // Installs plugin from URL
  pluginsIpc.handle.install((url, commitHash) => pluginManager.install(url, commitHash));

  // Uninstalls plugin by ID
  pluginsIpc.handle.uninstall(id => pluginManager.uninstall(id));

  // Syncs plugin to specific commit
  pluginsIpc.handle.sync((id, commit) => pluginManager.syncItem(id, commit));

  // Syncs multiple plugins to their commits
  pluginsIpc.handle.syncAll(items => pluginManager.syncAll(items));

  // Checks for available sync updates based on subscription stage
  pluginsIpc.handle.checkForSync(stage => pluginManager.checkForSync(stage));

  // Gets list of available plugins for subscription stage
  pluginsIpc.handle.getList(stage => getList(stage));

  // Updates sync list entry for plugin
  pluginsIpc.handle.updateSyncList((id, commit) => pluginManager.updateSyncItem(id, commit));
}

export const pluginsIpc = {
  send: {
    onSyncAvailable: (cards: PluginSyncItem[]) => sendToMain(pluginChannels.onSyncAvailable, cards),
  },
  handle: {
    getList: (callback: (stage: SubscribeStages) => MainHT<PluginItem[]>) =>
      lynxIpc.handle(pluginChannels.getList, callback),
    getAddresses: (callback: () => MainHT<PluginAddresses>) => lynxIpc.handle(pluginChannels.getAddresses, callback),
    getInstalledList: (callback: () => MainHT<PluginInstalledItem[]>) =>
      lynxIpc.handle(pluginChannels.getInstalledList, callback),
    getUnloadedList: (callback: () => MainHT<UnloadedPlugins[]>) =>
      lynxIpc.handle(pluginChannels.getUnloadedList, callback),
    install: (callback: (url: string, commitHash?: string) => MainHT<boolean>) =>
      lynxIpc.handle(pluginChannels.install, callback),
    uninstall: (callback: (id: string) => MainHT<boolean>) => lynxIpc.handle(pluginChannels.uninstall, callback),
    sync: (callback: (id: string, commit: string) => MainHT<boolean>) => lynxIpc.handle(pluginChannels.sync, callback),
    syncAll: (callback: (items: {id: string; commit: string}[]) => MainHT<string[]>) =>
      lynxIpc.handle(pluginChannels.syncAll, callback),
    checkForSync: (callback: (stage: SubscribeStages) => MainHT<void>) =>
      lynxIpc.handle(pluginChannels.checkForSync, callback),
    updateSyncList: (callback: (id: string, commit: string) => MainHT<void>) =>
      lynxIpc.handle(pluginChannels.updateSyncList, callback),
  },
};
