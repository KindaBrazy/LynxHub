import { staticsChannels } from '@lynx_common/consts/ipcChannels/statics';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionsInfo,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
} from '@lynx_common/types';

import lynxIpc from './lynxIpc';

const staticsIpc = {
  // Pulls latest static data from server
  pull: () => lynxIpc.invoke<void>(staticsChannels.pull),

  // Gets app release information
  getReleases: () => lynxIpc.invoke<AppUpdateData | undefined>(staticsChannels.getReleases),

  // Gets insider build information
  getInsider: () => lynxIpc.invoke<AppUpdateInsiderData | undefined>(staticsChannels.getInsider),

  // Gets notification data
  getNotification: () => lynxIpc.invoke<Notification_Data[] | undefined>(staticsChannels.getNotification),

  // Gets available modules list
  getModules: () => lynxIpc.invoke<ModulesInfo[] | undefined>(staticsChannels.getModules),

  // Gets available extensions list
  getExtensions: () => lynxIpc.invoke<ExtensionsInfo[] | undefined>(staticsChannels.getExtensions),

  // Gets early access extensions list
  getExtensionsEA: () => lynxIpc.invoke<ExtensionsInfo[] | undefined>(staticsChannels.getExtensionsEA),

  // Gets Patreon supporters list
  getPatrons: () => lynxIpc.invoke<PatreonSupporter[] | undefined>(staticsChannels.getPatrons),
};

export default staticsIpc;
