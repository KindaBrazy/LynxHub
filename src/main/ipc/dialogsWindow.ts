import windowDialogsChannels from '@lynx_common/consts/ipcChannels/dialogsWindow';
import classHolder from '@lynx_main/managers/classHolder';
import {IpcMainEvent} from 'electron';

import lynxIpc from './ipcWrapper';
import {sendToContextMenu} from './sender';

let currentDialogEvent: IpcMainEvent | undefined = undefined;
let currentDialogDefaultResult: boolean | null | string = null;

export const dialogBlured = () => {
  if (currentDialogEvent) {
    currentDialogEvent.returnValue = currentDialogDefaultResult;
    currentDialogEvent = undefined;
  }
};

export default async function listenDialogsWindow() {
  const [contextMenuManager, appManager] = await Promise.all([
    classHolder.waitForClass('contextMenuManager'),
    classHolder.waitForClass('appManager'),
  ]);

  const setCenterPosition = () => {
    const window = appManager.getMainWindow();
    if (window) {
      const {width, height} = window.getBounds();
      contextMenuManager.setCustomContextPosition({x: width / 2 - 150, y: height / 2 - 60});
    }
  };

  dialogsWindowIpc.on.onPrompt((event, message, defaultValue) => {
    setCenterPosition();

    dialogsWindowIpc.send.promptShow(message, defaultValue);

    currentDialogEvent = event;
    currentDialogDefaultResult = null;
  });

  dialogsWindowIpc.on.onConfirm((event, message) => {
    setCenterPosition();

    dialogsWindowIpc.send.confirmShow(message);

    currentDialogEvent = event;
    currentDialogDefaultResult = false;
  });

  dialogsWindowIpc.on.onAlert((event, message) => {
    setCenterPosition();

    dialogsWindowIpc.send.alertShow(message);

    currentDialogEvent = event;
    currentDialogDefaultResult = null;
  });

  dialogsWindowIpc.on.promptResult(result => {
    if (currentDialogEvent) {
      currentDialogEvent.returnValue = result;
      currentDialogEvent = undefined;
    }
  });

  dialogsWindowIpc.on.confirmResult(result => {
    if (currentDialogEvent) {
      currentDialogEvent.returnValue = result;
      currentDialogEvent = undefined;
    }
  });
}

export const dialogsWindowIpc = {
  on: {
    onPrompt: (callback: (event: IpcMainEvent, message: string, defaultValue?: string) => void) =>
      lynxIpc.on(windowDialogsChannels.onPrompt, callback),
    onConfirm: (callback: (event: IpcMainEvent, message: string) => void) =>
      lynxIpc.on(windowDialogsChannels.onConfirm, callback),
    onAlert: (callback: (event: IpcMainEvent, message: string) => void) =>
      lynxIpc.on(windowDialogsChannels.onAlert, callback),
    promptResult: (callback: (result: string | null) => void) =>
      lynxIpc.on(windowDialogsChannels.promptResult, callback),
    confirmResult: (callback: (result: boolean) => void) => lynxIpc.on(windowDialogsChannels.confirmResult, callback),
  },
  send: {
    promptShow: (message: string, defaultValue?: string) =>
      sendToContextMenu(windowDialogsChannels.promptShow, message, defaultValue),
    confirmShow: (message: string) => sendToContextMenu(windowDialogsChannels.confirmShow, message),
    alertShow: (message: string) => sendToContextMenu(windowDialogsChannels.alertShow, message),
  },
};
