import promptChannels from '@lynx_cross/consts/ipc_channels/prompt_window';

import lynxIpc from './lynxIpc';

const promptIpc = {
  result: (value: string | null) => lynxIpc.send(promptChannels.result, value),
  cancel: () => lynxIpc.send(promptChannels.cancel),
  onShow: (callback: (message: string, defaultValue?: string) => void) => lynxIpc.on(promptChannels.onShow, callback),
};

export default promptIpc;
