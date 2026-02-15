import userChannels from '@lynx_common/consts/ipcChannels/user';
import {PatreonUserData, SubscribeStages} from '@lynx_common/types';
import {MainHT} from '@lynx_common/types/ipc';

import lynxIpc from './lynxIpc';
import {sendToMain} from './sender';

export const userIpc = {
  patreon: {
    send: {
      onReleaseChannel: (channel: SubscribeStages) => sendToMain(userChannels.patreon.onReleaseChannel, channel),
    },
    on: {
      updateChannel: (callback: (channel: SubscribeStages | 'get') => void) =>
        lynxIpc.on(userChannels.patreon.updateChannel, callback),
    },
    handle: {
      getInfo: (callback: () => MainHT<PatreonUserData | null>) =>
        lynxIpc.handle(userChannels.patreon.getInfo, callback),
      login: (callback: () => MainHT<PatreonUserData>) => lynxIpc.handle(userChannels.patreon.login, callback),
      logout: (callback: () => MainHT<void>) => lynxIpc.handle(userChannels.patreon.logout, callback),
    },
  },
};
