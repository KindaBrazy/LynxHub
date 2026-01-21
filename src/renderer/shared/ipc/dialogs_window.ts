import windowDialogsChannels from '@lynx_cross/consts/ipc_channels/window_dialogs';

import lynxIpc from './lynxIpc';

const windowDialogsIpc = {
  promptResult: (value: string | null) => lynxIpc.send(windowDialogsChannels.promptResult, value),
  promptShow: (callback: (message: string, defaultValue?: string) => void) =>
    lynxIpc.on(windowDialogsChannels.promptShow, callback),

  alertShow: (callback: (message: string) => void) => lynxIpc.on(windowDialogsChannels.alertShow, callback),

  confirmResult: (value: boolean) => lynxIpc.send(windowDialogsChannels.confirmResult, value),
  confirmShow: (callback: (message: string) => void) => lynxIpc.on(windowDialogsChannels.confirmShow, callback),
};

export default windowDialogsIpc;
