import {screenShareChannels} from '@lynx_cross/consts/ipc_channels/share_screen';
import {MainHT} from '@lynx_cross/types/ipc';
import {ScreenShareSources, ScreenShareStart} from '@lynx_cross/types/share_screen';

import lynxIpc from './lynxIpc';

export const shareScreenIpc = {
  once: {
    startShare: (callback: (data: ScreenShareStart) => void) => lynxIpc.once(screenShareChannels.startShare, callback),
    cancel: (callback: () => void) => lynxIpc.once(screenShareChannels.cancel, callback),
  },
  handle: {
    getScreenSources: (callback: () => MainHT<ScreenShareSources[]>) =>
      lynxIpc.handle(screenShareChannels.getScreenSources, callback),
    getWindowSources: (callback: () => MainHT<ScreenShareSources[]>) =>
      lynxIpc.handle(screenShareChannels.getWindowSources, callback),
  },
  removeHandler: {
    getScreenSources: () => lynxIpc.removeHandler(screenShareChannels.getScreenSources),
    getWindowSources: () => lynxIpc.removeHandler(screenShareChannels.getWindowSources),
  },
};
