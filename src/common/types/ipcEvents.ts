export type IpcHookPhase = 'before' | 'after';
export type IpcHookStatus = 'success' | 'error';

export type MainIpcHookMethod = 'send' | 'on' | 'once' | 'handle';
export type RendererIpcHookMethod = 'send' | 'sendSync' | 'invoke' | 'on' | 'once';

export type IpcHookContext = Record<string, unknown>;

type IpcHookBaseEvent<Method extends string> = {
  method: Method;
  channel: string;
  args: unknown[];
  timestamp: number;
  context?: IpcHookContext;
};

export type IpcHookBeforeEvent<Method extends string> = IpcHookBaseEvent<Method> & {
  phase: 'before';
};

export type IpcHookAfterEvent<Method extends string> = IpcHookBaseEvent<Method> & {
  phase: 'after';
  status: IpcHookStatus;
  durationMs: number;
  result?: unknown;
  error?: unknown;
};

export type IpcHookEvent<Method extends string> = IpcHookBeforeEvent<Method> | IpcHookAfterEvent<Method>;

export type IpcHookListener<Method extends string> = (event: IpcHookEvent<Method>) => void | Promise<void>;

export type ExtensionIpcEventsApi<Method extends string> = {
  on: (phase: IpcHookPhase, listener: IpcHookListener<Method>) => () => void;
  onChannel: (phase: IpcHookPhase, channel: string, listener: IpcHookListener<Method>) => () => void;
  getListenerCount: (phase: IpcHookPhase, channel?: string) => number;
};
