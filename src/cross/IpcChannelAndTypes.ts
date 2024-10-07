import {IpcRendererEvent} from 'electron';
import {PullResult, SimpleGitProgressEvent} from 'simple-git';

import {UpdateDownloadProgress} from './CrossTypes';

//#region Ipc Types

export type WinStateChange = {name: 'focus' | 'maximize' | 'full-screen'; value: boolean};
export type ChangeWindowState = 'minimize' | 'maximize' | 'close' | 'fullscreen' | 'restart';
export type OpenDialogOptions = 'openDirectory' | 'openFile';
export type DarkModeTypes = 'dark' | 'light' | 'system';
export type TaskbarStatus = 'taskbar-tray' | 'taskbar' | 'tray' | 'tray-minimized';
export type TooltipStatus = 'essential' | 'full' | 'none';

export type GitProgressState = 'Progress' | 'Failed' | 'Completed';
export type GitProgressResult<T extends GitProgressState> = T extends 'Progress'
  ? SimpleGitProgressEvent
  : T extends 'Completed'
    ? PullResult | undefined
    : T extends 'Failed'
      ? string
      : never;
export type GitProgressCallback = <T extends GitProgressState>(
  event: IpcRendererEvent,
  id: string,
  state: T,
  result: GitProgressResult<T>,
) => void;

export type CloneDirTypes = string | 'moduleDir';

export type StorageOperation = 'add' | 'remove' | 'get' | 'set';
export type RecentlyOperation = 'update' | 'get';
export type StoragePreOpenData = {cardId: string; data: PreOpenData}[];
export type CustomRunBehaviorData = {
  cardID: string;
  terminal: 'runScript' | 'empty' | string;
  browser: 'appBrowser' | 'defaultBrowser' | 'doNothing' | string;
};
export type CustomRunBehaviorStore = CustomRunBehaviorData[];

export type ExtensionsData = {name: string; remoteUrl: string; size: string}[] | 'empty';
export type ExtensionsUpdateStatus = {id: string; updateAvailable: boolean}[];

export type PreCommands = {id: string; command?: string | string[] | number};
export type PreOpen = {id: string; open?: {type: 'folder' | 'file'; path: string} | number};
export type PreOpenData = {type: 'folder' | 'file'; path: string}[];
export type OnPreCommands = {id: string; commands: string[]};

export type CardInfo = {
  id: string;
  type: 'repo' | 'disk';
  data: {installDate: string; lastUpdate: string; releaseTag: string} | {totalSize: string; extensionsSize: string};
};

export type PtyProcessOpt = 'start' | 'stop';

export type HomeCategory = ('Pin' | 'Recently' | 'All' | string)[];
export type DiscordRunningAI = {running: boolean; name?: string; type?: 'image' | 'audio' | 'text' | 'unknown'};
export type SystemInfo = {os: NodeJS.Platform; buildNumber: string | number};
export type LynxHotkeys = {isEnabled: boolean; FULLSCREEN: string; TOGGLE_NAV: string; TOGGLE_AI_VIEW: string};

export type AppUpdateStatus = 'update-available' | 'update-downloaded' | string | UpdateDownloadProgress;
export type OnUpdatingExtensions = {id: string; step: string | 'done'};

export type DownloadProgress = {
  stage: 'done' | 'progress' | 'failed';
  finalPath: string;
  percentage: number;
  fileName: string;
  downloaded: number;
  total: number;
};
//#endregion

//#region Ipc Channels Names

export const winChannels = {
  changeState: 'win:state-change',
  onChangeState: 'win:on-state-change',

  setDarkMode: 'win:set-darkMode',
  getSystemDarkMode: 'win:get-system-darkMode',
  onDarkMode: 'win:on-darkMode',

  setTaskBarStatus: 'win:set-taskbar-status',

  setDiscordRP: 'win:set-discord-rp',

  setDiscordRpAiRunning: 'win:set-discord-rp-ai-running',

  getSystemInfo: 'win:get-system-info',
};

export const fileChannels = {
  getAppDirectories: 'app:getAppDirectories',
  dialog: 'app:openDialog',
  extensionsNames: 'app:extensionsFolder',
  openPath: 'app:openPath',
  removeDir: 'app:removeDir',
  trashDir: 'app:trashDir',
  listDir: 'app:listDir',
  checkFilesExist: 'app:checkFilesExist',
};

export const gitChannels = {
  abortClone: 'git:abortClone',
  cloneRepo: 'git:clone-repo',
  clonePromise: 'git:clone-promise',

  locate: 'git:locate',
  validateGitDir: 'git:validateGitDir',

  pull: 'git:pull',

  updateAvailable: 'git:updateAvailable',

  onProgress: 'git:on-progress',
};

export const utilsChannels = {
  cancelExtensionsData: 'utils:cancel-extensions-data',
  cardInfo: 'utils:card-info',

  updateAllExtensions: 'utils:update-all-extensions',
  onUpdateAllExtensions: 'utils:on-update-all-extensions',

  extensionsDetails: 'utils:extensions-details',
  onCardInfo: 'utils:on-card-info',
  updateStatus: 'utils:extensions-update-status',

  downloadFile: 'utils:download-file',
  cancelDownload: 'utils:cancel-download',
  onDownloadFile: 'utils:on-download-file',

  decompressFile: 'utils:decompress-file',
};

export const modulesChannels = {
  installModule: 'modules:install-module',
  uninstallModule: 'modules:uninstall-module',
  isUpdateAvailable: 'modules:is-update-available',
  anyUpdateAvailable: 'modules:any-update-available',
  updateModule: 'modules:update-module',
  updateAllModules: 'modules:update-all-modules',

  onReload: 'modules:on-reload',
  onUpdatedModules: 'modules:on-updated-modules',

  getModulesData: 'modules:get-modules-data',
  getInstalledModulesInfo: 'modules:get-installed-modules-info',
};

export const ptyChannels = {
  process: 'pty-process',
  customProcess: 'pty-custom-process',
  customCommands: 'pty-custom-commands',
  write: 'pty-write',
  resize: 'pty-resize',
  onData: 'pty-on-data',
};

export const initializerChannels = {
  minimize: 'minimize-initializer',
  close: 'close-initializer',

  gitAvailable: 'git-available-initializer',
  pythonAvailable: 'python-available-initializer',

  installAIModule: 'install-ai-module-initializer',
  onInstallAIModule: 'on-install--ai-module-initializer',

  startApp: 'start-app-initializer',
};

export const appUpdateChannels = {
  status: 'appUpdate:status',
  download: 'appUpdate:download',
  cancel: 'appUpdate:cancel',
  install: 'appUpdate:install',
  installLater: 'appUpdate:install-later',
};

export const appDataChannels = {
  getCurrentPath: 'appData:get-current-path',
  selectAnother: 'appData:select-another',
};

export const storageChannels = {
  get: 'storage:getData',
  getAll: 'storage:getAllData',
  update: 'storage:updateData',
  updateNested: 'storage:updateNested',
  clear: 'storage:clearStorage',
};

export const storageUtilsChannels = {
  setSystemStartup: 'storageUtils:setSystemStartup',

  addInstalledCard: 'storageUtils:add-installed-card',
  removeInstalledCard: 'storageUtils:remove-installed-card',
  onInstalledCards: 'storageUtils:on-installed-cards',

  addAutoUpdateCard: 'storageUtils:add-autoUpdate-card',
  removeAutoUpdateCard: 'storageUtils:remove-autoUpdate-card',
  onAutoUpdateCards: 'storageUtils:on-autoUpdate-cards',

  addAutoUpdateExtensions: 'storageUtils:add-autoUpdate-extensions',
  removeAutoUpdateExtensions: 'storageUtils:remove-autoUpdate-extensions',
  onAutoUpdateExtensions: 'storageUtils:on-autoUpdate-extensions',

  onPinnedCardsChange: 'storageUtils:on-pinned-cards',
  pinnedCards: 'storageUtils:pinned-cards',

  recentlyUsedCards: 'storageUtils:recently-used-cards',
  onRecentlyUsedCardsChange: 'storageUtils:on-recently-used-cards',

  homeCategory: 'storageUtils:home-category',
  onHomeCategory: 'storageUtils:on-home-category',

  preCommands: 'storageUtils:pre-commands',
  onPreCommands: 'storageUtils:on-pre-commands',

  customRun: 'storageUtils:custom-run',
  onCustomRun: 'storageUtils:on-custom-run',

  preOpen: 'storageUtils:pre-open',

  customRunBehavior: 'storageUtils:custom-run-behavior',

  getCardArguments: 'storageUtils:get-card-arguments',
  setCardArguments: 'storageUtils:set-card-arguments',

  updateZoomFactor: 'storageUtils:update-zoom-factor',
};
//#endregion
