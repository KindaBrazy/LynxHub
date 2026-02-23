import {emitRendererIpcEvent, emitRendererIpcEventSync} from './ipcEvents';

const ipc = window.electron.ipcRenderer;

type IpcArgs = unknown[];

const send = (channel: string, ...args: IpcArgs): void => {
  const eventStart = Date.now();
  const beforeEvent = {
    phase: 'before' as const,
    method: 'send' as const,
    channel,
    args: [...args],
    timestamp: eventStart,
  };

  emitRendererIpcEventSync(beforeEvent);

  try {
    ipc.send(channel, ...args);
    emitRendererIpcEventSync({
      ...beforeEvent,
      phase: 'after',
      status: 'success',
      durationMs: Date.now() - eventStart,
    });
  } catch (error) {
    emitRendererIpcEventSync({
      ...beforeEvent,
      phase: 'after',
      status: 'error',
      durationMs: Date.now() - eventStart,
      error,
    });
    throw error;
  }
};

const sendSync = <T = unknown>(channel: string, ...args: IpcArgs): T => {
  const eventStart = Date.now();
  const beforeEvent = {
    phase: 'before' as const,
    method: 'sendSync' as const,
    channel,
    args: [...args],
    timestamp: eventStart,
  };

  emitRendererIpcEventSync(beforeEvent);

  try {
    const result = ipc.sendSync(channel, ...args) as T;
    emitRendererIpcEventSync({
      ...beforeEvent,
      phase: 'after',
      status: 'success',
      durationMs: Date.now() - eventStart,
      result,
    });
    return result;
  } catch (error) {
    emitRendererIpcEventSync({
      ...beforeEvent,
      phase: 'after',
      status: 'error',
      durationMs: Date.now() - eventStart,
      error,
    });
    throw error;
  }
};

const invoke = async <T>(channel: string, ...args: IpcArgs): Promise<T> => {
  const eventStart = Date.now();
  const beforeEvent = {
    phase: 'before' as const,
    method: 'invoke' as const,
    channel,
    args: [...args],
    timestamp: eventStart,
  };

  await emitRendererIpcEvent(beforeEvent);

  try {
    const result = (await ipc.invoke(channel, ...args)) as T;
    await emitRendererIpcEvent({
      ...beforeEvent,
      phase: 'after',
      status: 'success',
      durationMs: Date.now() - eventStart,
      result,
    });
    return result;
  } catch (error) {
    await emitRendererIpcEvent({
      ...beforeEvent,
      phase: 'after',
      status: 'error',
      durationMs: Date.now() - eventStart,
      error,
    });
    throw error;
  }
};

const on = <TArgs extends IpcArgs>(channel: string, callback: (...args: TArgs) => void): (() => void) =>
  ipc.on(channel, (_, ...args: IpcArgs) => {
    const typedArgs = args as TArgs;
    const eventStart = Date.now();
    const beforeEvent = {
      phase: 'before' as const,
      method: 'on' as const,
      channel,
      args: [...typedArgs],
      timestamp: eventStart,
    };

    emitRendererIpcEventSync(beforeEvent);

    try {
      const result = callback(...typedArgs);
      emitRendererIpcEventSync({
        ...beforeEvent,
        phase: 'after',
        status: 'success',
        durationMs: Date.now() - eventStart,
        result,
      });
    } catch (error) {
      emitRendererIpcEventSync({
        ...beforeEvent,
        phase: 'after',
        status: 'error',
        durationMs: Date.now() - eventStart,
        error,
      });
      throw error;
    }
  });

const once = <TArgs extends IpcArgs>(channel: string, callback: (...args: TArgs) => void): (() => void) =>
  ipc.once(channel, (_, ...args: IpcArgs) => {
    const typedArgs = args as TArgs;
    const eventStart = Date.now();
    const beforeEvent = {
      phase: 'before' as const,
      method: 'once' as const,
      channel,
      args: [...typedArgs],
      timestamp: eventStart,
    };

    emitRendererIpcEventSync(beforeEvent);

    try {
      const result = callback(...typedArgs);
      emitRendererIpcEventSync({
        ...beforeEvent,
        phase: 'after',
        status: 'success',
        durationMs: Date.now() - eventStart,
        result,
      });
    } catch (error) {
      emitRendererIpcEventSync({
        ...beforeEvent,
        phase: 'after',
        status: 'error',
        durationMs: Date.now() - eventStart,
        error,
      });
      throw error;
    }
  });

const lynxIpc = {
  send,
  sendSync,
  on,
  once,
  invoke,
};

export default lynxIpc;
