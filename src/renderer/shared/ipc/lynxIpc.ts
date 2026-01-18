const ipc = window.electron.ipcRenderer;

const send = (channel: string, ...args: any[]): void => ipc.send(channel, ...args);
const sendSync = (channel: string, ...args: any[]): void => ipc.sendSync(channel, ...args);
const invoke = <T>(channel: string, ...args: any[]): Promise<T> => ipc.invoke(channel, ...args);
const on = (channel: string, callback: (...args: any[]) => void): (() => void) => {
  return ipc.on(channel, (_, ...args: any[]) => callback(...args));
};

const lynxIpc = {
  send,
  sendSync,
  on,
  invoke,
};

export default lynxIpc;
