import {screenShareChannels} from '@lynx_common/consts/ipcChannels/shareScreen';
import {MainHT} from '@lynx_common/types/ipc';
import {ScreenShareSources, ScreenShareStart} from '@lynx_common/types/shareScreen';

import lynxIpc from './ipcWrapper';

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
