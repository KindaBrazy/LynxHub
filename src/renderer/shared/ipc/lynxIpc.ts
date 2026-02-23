const ipc = window.electron.ipcRenderer;

type IpcArgs = unknown[];

const send = (channel: string, ...args: IpcArgs): void => ipc.send(channel, ...args);
const sendSync = <T = unknown>(channel: string, ...args: IpcArgs): T => ipc.sendSync(channel, ...args);
const invoke = <T>(channel: string, ...args: IpcArgs): Promise<T> => ipc.invoke(channel, ...args);
const on = <TArgs extends IpcArgs>(channel: string, callback: (...args: TArgs) => void): (() => void) =>
  ipc.on(channel, (_, ...args: IpcArgs) => callback(...(args as TArgs)));
const once = <TArgs extends IpcArgs>(channel: string, callback: (...args: TArgs) => void): (() => void) =>
  ipc.once(channel, (_, ...args: IpcArgs) => callback(...(args as TArgs)));

const lynxIpc = {
  send,
  sendSync,
  on,
  once,
  invoke,
};

export default lynxIpc;
