
import { userChannels } from '@lynx_common/consts/ipcChannels/user';
import {PatreonUserData, SubscribeStages} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';

import lynxIpc from './ipcWrapper';
import {sendToMain} from './sender';

/**
 * IPC interface for user-related operations (Patreon).
 * Note: Handlers are registered in src/main/monitoring/patreonAuth.ts
 */
export const userIpc = {
  patreon: {
    send: {
      /** Sends release channel update */
      onReleaseChannel: (channel: SubscribeStages) => sendToMain(userChannels.patreon.onReleaseChannel, channel),
    },
    on: {
      /** Listens for channel update request */
      updateChannel: (callback: (channel: SubscribeStages | 'get') => void) =>
        lynxIpc.on(userChannels.patreon.updateChannel, callback),
    },
    handle: {
      /** Handles get info request */
      getInfo: (callback: () => MainHT<PatreonUserData | null>) =>
        lynxIpc.handle(userChannels.patreon.getInfo, callback),
      /** Handles login request */
      login: (callback: () => MainHT<PatreonUserData>) => lynxIpc.handle(userChannels.patreon.login, callback),
      /** Handles logout request */
      logout: (callback: () => MainHT<void>) => lynxIpc.handle(userChannels.patreon.logout, callback),
    },
  },
};
