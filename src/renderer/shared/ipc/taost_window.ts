import toastWindowChannels from '@lynx_cross/consts/ipc_channels/toast_window';
import {ToastWindow_MessageType} from '@lynx_cross/types';

import lynxIpc from './lynxIpc';

const toastWindowIpc = {
  onShowMessage: (callback: (data: ToastWindow_MessageType) => void) =>
    lynxIpc.on(toastWindowChannels.onShowMessage, callback),
  closeToast: () => lynxIpc.send(toastWindowChannels.closeToast),
  exitApp: () => lynxIpc.send(toastWindowChannels.exitApp),
  restartApp: () => lynxIpc.send(toastWindowChannels.restartApp),
  customBtnPressed: (id: string) => lynxIpc.send(toastWindowChannels.customBtnPressed, id),
};

export default toastWindowIpc;
