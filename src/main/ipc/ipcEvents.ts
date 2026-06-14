import {
  ExtensionIpcEventsApi,
  IpcHookEvent,
  IpcHookListener,
  IpcHookPhase,
  MainIpcHookMethod,
} from '@lynx_common/types/ipcEvents';

type MainIpcEvent = IpcHookEvent<MainIpcHookMethod>;
type MainIpcListener = IpcHookListener<MainIpcHookMethod>;

const listeners: Record<IpcHookPhase, Set<MainIpcListener>> = {
  before: new Set(),
  after: new Set(),
};

const channelListeners: Record<IpcHookPhase, Map<string, Set<MainIpcListener>>> = {
  before: new Map(),
  after: new Map(),
};

const getOrCreateChannelListeners = (phase: IpcHookPhase, channel: string): Set<MainIpcListener> => {
  const map = channelListeners[phase];
  const existing = map.get(channel);
  if (existing) {
    return existing;
  }
  const created = new Set<MainIpcListener>();
  map.set(channel, created);
  return created;
};

const addListener = (phase: IpcHookPhase, listener: MainIpcListener, channel?: string): (() => void) => {
  const target = channel ? getOrCreateChannelListeners(phase, channel) : listeners[phase];
  target.add(listener);

  return () => {
    target.delete(listener);
    if (channel && target.size === 0) {
      channelListeners[phase].delete(channel);
    }
  };
};

const getListenersForEvent = (event: MainIpcEvent): MainIpcListener[] => {
  const base = [...listeners[event.phase]];
  const perChannel = channelListeners[event.phase].get(event.channel);
  if (perChannel) {
    base.push(...perChannel);
  }
  return base;
};

const logHookError = (error: unknown): void => {
  console.error('Extension main IPC hook failed:', error);
};

const runListenerSync = (listener: MainIpcListener, event: MainIpcEvent): void => {
  try {
    const result = listener(event);
    if (result && typeof (result as Promise<void>).then === 'function') {
      void (result as Promise<void>).catch(logHookError);
    }
  } catch (error) {
    logHookError(error);
  }
};

const runListener = async (listener: MainIpcListener, event: MainIpcEvent): Promise<void> => {
  try {
    await listener(event);
  } catch (error) {
    logHookError(error);
  }
};

export const mainIpcEventsApi: ExtensionIpcEventsApi<MainIpcHookMethod> = {
  on: (phase, listener) => addListener(phase, listener),
  onChannel: (phase, channel, listener) => addListener(phase, listener, channel),
  getListenerCount: (phase, channel) => {
    const globalCount = listeners[phase].size;
    if (!channel) {
      return globalCount;
    }
    return globalCount + (channelListeners[phase].get(channel)?.size || 0);
  },
};

export const emitMainIpcEventSync = (event: MainIpcEvent): void => {
  for (const listener of getListenersForEvent(event)) {
    runListenerSync(listener, event);
  }
};

export const emitMainIpcEvent = async (event: MainIpcEvent): Promise<void> => {
  for (const listener of getListenersForEvent(event)) {
    await runListener(listener, event);
  }
};
