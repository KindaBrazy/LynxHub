import {ipcMain, WebContents} from 'electron';

const send = (webContents: WebContents, channel: string, ...args: any[]) => webContents.send(channel, ...args);
const on = (channel: string, callback: (...args: any[]) => void) => {
  ipcMain.on(channel, (_, ...args: any[]) => callback(...args));
  return () => {
    ipcMain.removeListener(channel, callback);
  };
};
const once = (channel: string, callback: (...args: any[]) => void) => {
  ipcMain.once(channel, (_, ...args: any[]) => callback(...args));
  return () => {
    ipcMain.removeListener(channel, callback);
  };
};
const handle = <T>(channel: string, callback: (...args: any[]) => Promise<T> | T) => {
  ipcMain.handle(channel, (_, ...args: any[]) => callback(...args));
  return () => {
    ipcMain.removeHandler(channel);
  };
};
const removeHandler = (channel: string) => ipcMain.removeHandler(channel);

const lynxIpc = {send, on, once, handle, removeHandler};

export default lynxIpc;
