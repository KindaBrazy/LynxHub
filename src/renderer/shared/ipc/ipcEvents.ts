import {
  ExtensionIpcEventsApi,
  IpcHookEvent,
  IpcHookListener,
  IpcHookPhase,
  RendererIpcHookMethod,
} from '@lynx_common/types/ipcEvents';

type RendererIpcEvent = IpcHookEvent<RendererIpcHookMethod>;
type RendererIpcListener = IpcHookListener<RendererIpcHookMethod>;

const listeners: Record<IpcHookPhase, Set<RendererIpcListener>> = {
  before: new Set(),
  after: new Set(),
};

const channelListeners: Record<IpcHookPhase, Map<string, Set<RendererIpcListener>>> = {
  before: new Map(),
  after: new Map(),
};

const getOrCreateChannelListeners = (phase: IpcHookPhase, channel: string): Set<RendererIpcListener> => {
  const map = channelListeners[phase];
  const existing = map.get(channel);
  if (existing) {
    return existing;
  }
  const created = new Set<RendererIpcListener>();
  map.set(channel, created);
  return created;
};

const addListener = (phase: IpcHookPhase, listener: RendererIpcListener, channel?: string): (() => void) => {
  const target = channel ? getOrCreateChannelListeners(phase, channel) : listeners[phase];
  target.add(listener);

  return () => {
    target.delete(listener);
    if (channel && target.size === 0) {
      channelListeners[phase].delete(channel);
    }
  };
};

const getListenersForEvent = (event: RendererIpcEvent): RendererIpcListener[] => {
  const base = [...listeners[event.phase]];
  const perChannel = channelListeners[event.phase].get(event.channel);
  if (perChannel) {
    base.push(...perChannel);
  }
  return base;
};

const logHookError = (error: unknown): void => {
  console.error('Extension renderer IPC hook failed:', error);
};

const runListenerSync = (listener: RendererIpcListener, event: RendererIpcEvent): void => {
  try {
    const result = listener(event);
    if (result && typeof (result as Promise<void>).then === 'function') {
      void (result as Promise<void>).catch(logHookError);
    }
  } catch (error) {
    logHookError(error);
  }
};

const runListener = async (listener: RendererIpcListener, event: RendererIpcEvent): Promise<void> => {
  try {
    await listener(event);
  } catch (error) {
    logHookError(error);
  }
};

export const rendererIpcEventsApi: ExtensionIpcEventsApi<RendererIpcHookMethod> = {
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

export const emitRendererIpcEventSync = (event: RendererIpcEvent): void => {
  for (const listener of getListenersForEvent(event)) {
    runListenerSync(listener, event);
  }
};

export const emitRendererIpcEvent = async (event: RendererIpcEvent): Promise<void> => {
  for (const listener of getListenersForEvent(event)) {
    await runListener(listener, event);
  }
};
