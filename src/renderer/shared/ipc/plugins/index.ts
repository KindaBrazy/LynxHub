import pluginChannels from '@lynx_common/consts/ipc_channels/plugins';
import {SubscribeStages} from '@lynx_common/types';
import {
  PluginAddresses,
  PluginInstalledItem,
  PluginItem,
  PluginSyncItem,
  UnloadedPlugins,
} from '@lynx_common/types/plugins';

import lynxIpc from '../lynxIpc';

const pluginsIpc = {
  // Gets list of available plugins for subscription stage
  getList: (stage: SubscribeStages) => lynxIpc.invoke<PluginItem[]>(pluginChannels.getList, stage),

  // Gets plugin server addresses
  getAddresses: () => lynxIpc.invoke<PluginAddresses>(pluginChannels.getAddresses),

  // Gets list of installed plugins
  getInstalledList: () => lynxIpc.invoke<PluginInstalledItem[]>(pluginChannels.getInstalledList),

  // Gets list of unloaded plugins
  getUnloadedList: () => lynxIpc.invoke<UnloadedPlugins[]>(pluginChannels.getUnloadedList),

  // Installs plugin from URL
  install: (url: string, commitHash?: string) => lynxIpc.invoke<boolean>(pluginChannels.install, url, commitHash),

  // Uninstalls plugin by ID
  uninstall: (id: string) => lynxIpc.invoke<boolean>(pluginChannels.uninstall, id),

  // Syncs plugin to specific commit
  sync: (id: string, commit: string) => lynxIpc.invoke<boolean>(pluginChannels.sync, id, commit),

  // Updates sync list entry for plugin
  updateSyncList: (id: string, commit: string) => lynxIpc.invoke<boolean>(pluginChannels.updateSyncList, id, commit),

  // Syncs multiple plugins to their commits
  syncAll: (items: {id: string; commit: string}[]) => lynxIpc.invoke<string[]>(pluginChannels.syncAll, items),

  // Checks for available sync updates based on subscription stage
  checkForSync: (stage: SubscribeStages) => lynxIpc.invoke<void>(pluginChannels.checkForSync, stage),

  // Listens for plugin sync availability events
  onSyncAvailable: (result: (cards: PluginSyncItem[]) => void) => lynxIpc.on(pluginChannels.onSyncAvailable, result),
};

export default pluginsIpc;
