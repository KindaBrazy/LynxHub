import {screenShareChannels} from '@lynx_common/consts/ipc_channels/share_screen';
import {ScreenShareSources, ScreenShareStart} from '@lynx_common/types/share_screen';

import lynxIpc from './lynxIpc';

const shareScreenIpc = {
  getScreenSources: () => lynxIpc.invoke<ScreenShareSources[]>(screenShareChannels.getScreenSources),
  getWindowSources: () => lynxIpc.invoke<ScreenShareSources[]>(screenShareChannels.getWindowSources),

  cancel: () => lynxIpc.send(screenShareChannels.cancel),
  startShare: (config: ScreenShareStart) => lynxIpc.send(screenShareChannels.startShare, config),
};

export default shareScreenIpc;
