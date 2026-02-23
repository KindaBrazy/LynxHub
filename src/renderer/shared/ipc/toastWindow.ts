import { toastWindowChannels } from '@lynx_common/consts/ipcChannels/toastWindow';
import type {ToastWindowMessageType} from '@lynx_common/types';

import lynxIpc from './lynxIpc';

const toastWindowIpc = {
  onShowMessage: (callback: (data: ToastWindowMessageType) => void) =>
    lynxIpc.on(toastWindowChannels.onShowMessage, callback),
  closeToast: () => lynxIpc.send(toastWindowChannels.closeToast),
  exitApp: () => lynxIpc.send(toastWindowChannels.exitApp),
  restartApp: () => lynxIpc.send(toastWindowChannels.restartApp),
  customBtnPressed: (id: string) => lynxIpc.send(toastWindowChannels.customBtnPressed, id),
};

export default toastWindowIpc;
