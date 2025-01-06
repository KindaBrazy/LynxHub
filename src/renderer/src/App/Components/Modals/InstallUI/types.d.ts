export type BodyState =
  | 'starter'
  | 'clone'
  | 'terminal'
  | 'progress'
  | 'progress-bar'
  | 'user-input'
  | 'install-extensions'
  | 'done'
  | '';

export type InstallState = {
  body: BodyState;
  cloneUrl: string;
  doneAll: {type: 'success' | 'error'; title: string; description?: string};
  startClone: boolean;
  disableSelectDir: boolean;
};
