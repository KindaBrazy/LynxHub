import userChannels from '@lynx_common/consts/ipcChannels/user';
import {PatreonUserData, SubscribeStages} from '@lynx_common/types';

import lynxIpc from './lynxIpc';

const userIpc = {
  patreon: {
    // Gets Patreon user information
    getInfo: (): Promise<PatreonUserData | undefined> => lynxIpc.invoke(userChannels.patreon.getInfo),
    // Logs in to Patreon
    login: (): Promise<PatreonUserData> => lynxIpc.invoke(userChannels.patreon.login),
    // Logs out from Patreon
    logout: (): Promise<void> => lynxIpc.invoke(userChannels.patreon.logout),
    // Updates Patreon subscription channel
    updateChannel: (channel: SubscribeStages | 'get'): void =>
      lynxIpc.send(userChannels.patreon.updateChannel, channel),

    // Listens for Patreon release channel changes
    onReleaseChannel: (result: (stage: SubscribeStages) => void) =>
      lynxIpc.on(userChannels.patreon.onReleaseChannel, result),
  },
};

export default userIpc;
