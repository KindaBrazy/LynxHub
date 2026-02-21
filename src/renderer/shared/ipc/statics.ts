import { staticsChannels } from '@lynx_common/consts/ipcChannels/statics';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionInfo,
  ModuleInfo,
  NotificationData,
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
  getNotification: () => lynxIpc.invoke<NotificationData[] | undefined>(staticsChannels.getNotification),

  // Gets available modules list
  getModules: () => lynxIpc.invoke<ModuleInfo[] | undefined>(staticsChannels.getModules),

  // Gets available extensions list
  getExtensions: () => lynxIpc.invoke<ExtensionInfo[] | undefined>(staticsChannels.getExtensions),

  // Gets early access extensions list
  getExtensionsEA: () => lynxIpc.invoke<ExtensionInfo[] | undefined>(staticsChannels.getExtensionsEA),

  // Gets Patreon supporters list
  getPatrons: () => lynxIpc.invoke<PatreonSupporter[] | undefined>(staticsChannels.getPatrons),
};

export default staticsIpc;
