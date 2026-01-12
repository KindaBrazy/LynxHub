// Sends IPC messages from main process to renderer process (one-way communication)
import {ipcMain, IpcMainEvent} from 'electron';

import {CustomNotificationInfo} from '../../../cross/CrossTypes';
import {customNotifChannels} from '../../../cross/DownloadManagerTypes';
import classHolder from '../ClassHolder';

const sendIt = (channel: string, data: any) => {
  const {appManager} = classHolder;
  const webContent = appManager?.getWebContent();
  if (webContent) {
    webContent.send(channel, data);
  } else {
    console.error('Failed to send IPC message: ', 'webContent is undefined!');
  }
};

export const ipcMainSender = {
  customNotification: {
    open: (data: CustomNotificationInfo) => sendIt(customNotifChannels.onOpen, data),
    close: (key: string) => sendIt(customNotifChannels.onClose, key),
    onBtnPress: (result: (event: IpcMainEvent, btnId: string, notifKey: string) => void) =>
      ipcMain.on(customNotifChannels.onBtnPress, result),
  },
};
