import staticsChannels from '@lynx_common/consts/ipcChannels/statics';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionsInfo,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';
import classHolder from '@lynx_main/core/classHolder';

import lynxIpc from './lynxIpc';

export default async function listenStatics() {
  const staticManager = await classHolder.waitForClass('staticManager');

  // Pulls latest static data from server
  staticsIpc.handle.pull(() => staticManager.pull());

  // Gets app release information
  staticsIpc.handle.getReleases(() => staticManager.getReleases());

  // Gets insider build information
  staticsIpc.handle.getInsider(() => staticManager.getInsider());

  // Gets notification data
  staticsIpc.handle.getNotification(() => staticManager.getNotification());

  // Gets available modules list
  staticsIpc.handle.getModules(() => staticManager.getModules());

  // Gets available extensions list
  staticsIpc.handle.getExtensions(() => staticManager.getExtensions());

  // Gets early access extensions list
  staticsIpc.handle.getExtensionsEA(() => staticManager.getExtensionsEA());

  // Gets Patreon supporters list
  staticsIpc.handle.getPatrons(() => staticManager.getPatrons());
}

export const staticsIpc = {
  handle: {
    pull: (callback: () => MainHT<void>) => lynxIpc.handle(staticsChannels.pull, callback),
    getReleases: (callback: () => MainHT<AppUpdateData | undefined>) =>
      lynxIpc.handle(staticsChannels.getReleases, callback),
    getInsider: (callback: () => MainHT<AppUpdateInsiderData | undefined>) =>
      lynxIpc.handle(staticsChannels.getInsider, callback),
    getNotification: (callback: () => MainHT<Notification_Data[] | undefined>) =>
      lynxIpc.handle(staticsChannels.getNotification, callback),
    getModules: (callback: () => MainHT<ModulesInfo[] | undefined>) =>
      lynxIpc.handle(staticsChannels.getModules, callback),
    getExtensions: (callback: () => MainHT<ExtensionsInfo[] | undefined>) =>
      lynxIpc.handle(staticsChannels.getExtensions, callback),
    getExtensionsEA: (callback: () => MainHT<ExtensionsInfo[] | undefined>) =>
      lynxIpc.handle(staticsChannels.getExtensionsEA, callback),
    getPatrons: (callback: () => MainHT<PatreonSupporter[] | undefined>) =>
      lynxIpc.handle(staticsChannels.getPatrons, callback),
  },
};
