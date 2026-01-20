// Sends IPC messages from main process to renderer process (one-way communication)
import appChannels from '@lynx_cross/consts/ipc_channels/application';
import {ipcMain, IpcMainEvent} from 'electron';

import {CustomNotificationInfo} from '../../../cross/types';
import classHolder from '../../core/class_holder';

const sendIt = (channel: string, data: any) => {
  const {appManager} = classHolder;
  const webContent = appManager?.getWebContent();
  if (webContent && !webContent.isDestroyed()) {
    webContent.send(channel, data);
  } else {
    console.error('Failed to send IPC message: ', 'webContent is undefined!');
  }
};

export const ipcMainSender = {
  customNotification: {
    open: (data: CustomNotificationInfo) => sendIt(appChannels.onCustomNotifOpen, data),
    close: (key: string) => sendIt(appChannels.onCustomNotifClose, key),
    onBtnPress: (result: (event: IpcMainEvent, btnId: string, notifKey: string) => void) =>
      ipcMain.on(appChannels.onCustomNotifBtnPress, result),
  },
};
