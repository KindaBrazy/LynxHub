import {userChannels} from '@lynx_common/consts/ipcChannels/user';
import type {SubscribeStages, UserAccountData} from '@lynx_common/types';

import lynxIpc from './lynxIpc';

const userIpc = {
  account: {
    // Gets user account information
    getInfo: (): Promise<UserAccountData | null> => lynxIpc.invoke(userChannels.account.getInfo),
    // Logs in to website account
    login: (): Promise<UserAccountData> => lynxIpc.invoke(userChannels.account.login),
    // Logs out from website account
    logout: (): Promise<void> => lynxIpc.invoke(userChannels.account.logout),
    // Updates subscription channel
    updateChannel: (channel: SubscribeStages | 'get'): void =>
      lynxIpc.send(userChannels.account.updateChannel, channel),

    // Listens for release channel changes
    onReleaseChannel: (result: (stage: SubscribeStages) => void) =>
      lynxIpc.on(userChannels.account.onReleaseChannel, result),
  },
};

export default userIpc;
