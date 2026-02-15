import windowDialogsChannels from '@lynx_common/consts/ipcChannels/dialogsWindow';
import classHolder from '@lynx_main/core/classHolder';
import {IpcMainEvent} from 'electron';

import lynxIpc from './lynxIpc';
import {sendToCM} from './sender';

let dialogEvent: IpcMainEvent | undefined = undefined;
let dialogDefaultResult: boolean | null | string = null;

export const dialogBlured = () => {
  if (dialogEvent) {
    dialogEvent.returnValue = dialogDefaultResult;
    dialogEvent = undefined;
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

    dialogEvent = event;
    dialogDefaultResult = null;
  });

  dialogsWindowIpc.on.onConfirm((event, message) => {
    setCenterPosition();

    dialogsWindowIpc.send.confirmShow(message);

    dialogEvent = event;
    dialogDefaultResult = false;
  });

  dialogsWindowIpc.on.onAlert((event, message) => {
    setCenterPosition();

    dialogsWindowIpc.send.alertShow(message);

    dialogEvent = event;
    dialogDefaultResult = null;
  });

  dialogsWindowIpc.on.promptResult(result => {
    if (dialogEvent) {
      dialogEvent.returnValue = result;
      dialogEvent = undefined;
    }
  });

  dialogsWindowIpc.on.confirmResult(result => {
    if (dialogEvent) {
      dialogEvent.returnValue = result;
      dialogEvent = undefined;
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
      sendToCM(windowDialogsChannels.promptShow, message, defaultValue),
    confirmShow: (message: string) => sendToCM(windowDialogsChannels.confirmShow, message),
    alertShow: (message: string) => sendToCM(windowDialogsChannels.alertShow, message),
  },
};
