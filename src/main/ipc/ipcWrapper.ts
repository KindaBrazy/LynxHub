import {ipcMain, WebContents} from 'electron';

/**
 * Sends a message to the specified WebContents.
 * @param webContents - The target WebContents.
 * @param channel - The channel name.
 * @param args - Arguments to send.
 */
const send = (webContents: WebContents, channel: string, ...args: any[]) => webContents.send(channel, ...args);

/**
 * Listens for a message on the specified channel.
 * @param channel - The channel name.
 * @param callback - The callback function.
 * @returns A function to remove the listener.
 */
const on = (channel: string, callback: (...args: any[]) => void) => {
  const subscription = (_: any, ...args: any[]) => callback(...args);
  ipcMain.on(channel, subscription);
  return () => {
    ipcMain.removeListener(channel, subscription);
  };
};

/**
 * Listens for a message on the specified channel once.
 * @param channel - The channel name.
 * @param callback - The callback function.
 * @returns A function to remove the listener.
 */
const once = (channel: string, callback: (...args: any[]) => void) => {
  const subscription = (_: any, ...args: any[]) => callback(...args);
  ipcMain.once(channel, subscription);
  return () => {
    ipcMain.removeListener(channel, subscription);
  };
};

/**
 * Handles a message on the specified channel.
 * @param channel - The channel name.
 * @param callback - The callback function.
 * @returns A function to remove the handler.
 */
const handle = <T>(channel: string, callback: (...args: any[]) => Promise<T> | T) => {
  ipcMain.handle(channel, (_, ...args: any[]) => callback(...args));
  return () => {
    ipcMain.removeHandler(channel);
  };
};

/**
 * Removes a handler for the specified channel.
 * @param channel - The channel name.
 */
const removeHandler = (channel: string) => ipcMain.removeHandler(channel);

const lynxIpc = {send, on, once, handle, removeHandler};

export default lynxIpc;
