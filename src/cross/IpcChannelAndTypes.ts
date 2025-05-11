import {IpcRendererEvent} from 'electron';
import {PullResult, SimpleGitProgressEvent} from 'simple-git';

import {UpdateDownloadProgress} from './CrossTypes';

export type WinStateChange = {name: 'focus' | 'maximize' | 'full-screen'; value: boolean};
export type ChangeWindowState = 'minimize' | 'maximize' | 'close' | 'fullscreen' | 'restart';
export type DarkModeTypes = 'dark' | 'light' | 'system';
export type TaskbarStatus = 'taskbar-tray' | 'taskbar' | 'tray' | 'tray-minimized';
export type TooltipStatus = 'essential' | 'full' | 'none';

// Terminal
export type TerminalUseConpty = 'auto' | 'yes' | 'no';
export type TerminalCursorStyle = 'bar' | 'block' | 'underline';
export type TerminalCursorInactiveStyle = 'bar' | 'block' | 'underline' | 'outline' | 'none';

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

export type StorageOperation = 'add' | 'remove' | 'get' | 'set';
export type RecentlyOperation = 'update' | 'get';
export type StoragePreOpenData = {cardId: string; data: PreOpenData}[];
export type CustomRunBehaviorData = {
  cardID: string;
  terminal: 'runScript' | 'empty' | string;
  browser: 'appBrowser' | 'defaultBrowser' | 'doNothing' | string;
};
export type CustomRunBehaviorStore = CustomRunBehaviorData[];

export type ExtensionsData = {name: string; remoteUrl: string; size: string; isDisabled: boolean}[] | 'empty';
export type ExtensionsUpdateStatus = {id: string; updateAvailable: boolean; isDisabled: boolean}[];

export type PreCommands = {id: string; command?: string | string[] | number};
export type PreOpen = {id: string; open?: {type: 'folder' | 'file'; path: string} | number};
export type PreOpenData = {type: 'folder' | 'file'; path: string}[];
export type OnPreCommands = {id: string; commands: string[]};

export type PtyProcessOpt = 'start' | 'stop';

export type HomeCategory = ('Pin' | 'Recently' | 'All' | string)[];
export type DiscordRunningAI = {running: boolean; name?: string; type?: 'image' | 'audio' | 'text' | 'unknown'};
export type SystemInfo = {os: NodeJS.Platform; buildNumber: string | number};
export type LynxInput = {
  type: 'keyUp' | 'keyDown' | string;
  key: string;
  shift: boolean;
  control: boolean;
  alt: boolean;
  meta: boolean;
};
export type LynxHotkey = Omit<LynxInput, 'type'> & {name: string};

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

export type CanGoType = {back: boolean; forward: boolean};

export type SkippedPlugins = {folderName: string; message: string};

export type BrowserRecent = {url: string; favIcon: string};

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
  calcFolderSize: 'app:calcFolderSize',
  getRelativePath: 'app:getRelativePath',
  getAbsolutePath: 'app:getAbsolutePath',
};

export const gitChannels = {
  cloneShallow: 'git:clone-shallow',
  cloneShallowPromise: 'git:clone-shallow-promise',

  stashDrop: 'git:stash-drop',

  validateGitDir: 'git:validateGitDir',

  getRepoInfo: 'git:get-repo-info',
  changeBranch: 'git:changeBranch',
  unShallow: 'git:unShallow',
  resetHard: 'git:resetHard',

  pull: 'git:pull',

  onProgress: 'git:on-progress',
};

export const utilsChannels = {
  cancelExtensionsData: 'utils:cancel-extensions-data',

  updateAllExtensions: 'utils:update-all-extensions',
  disableExtension: 'utils:disable-extension',
  onUpdateAllExtensions: 'utils:on-update-all-extensions',

  extensionsDetails: 'utils:extensions-details',
  updateStatus: 'utils:extensions-update-status',

  downloadFile: 'utils:download-file',
  cancelDownload: 'utils:cancel-download',
  onDownloadFile: 'utils:on-download-file',

  decompressFile: 'utils:decompress-file',

  isResponseValid: 'utils:is-response-valid',
};

export const modulesChannels = {
  cardUpdateAvailable: 'modules:card-update-available',

  installModule: 'modules:install-module',
  uninstallModule: 'modules:uninstall-module',
  uninstallCardByID: 'modules:uninstall-card-by-id',
  isUpdateAvailable: 'modules:is-update-available',
  updateAvailableList: 'modules:update-available-list',
  updateModule: 'modules:update-module',
  updateAllModules: 'modules:update-all-modules',

  checkEa: 'modules:check-ea',

  checkCardsUpdateInterval: 'modules:cards_update_interval',
  onCardsUpdateAvailable: 'modules:on_cards_update_available',

  onReload: 'modules:on-reload',
  onUpdatedModules: 'modules:on-updated-modules',

  getModulesData: 'modules:get-modules-data',
  getInstalledModulesInfo: 'modules:get-installed-modules-info',

  getSkipped: 'modules:get-skipped',
};

export const extensionsChannels = {
  installExtension: 'extensions:install-extensions',
  uninstallExtension: 'extensions:uninstall-extensions',
  isUpdateAvailable: 'extensions:is-update-available',
  updateAvailableList: 'extensions:any-update-available',
  updateExtension: 'extensions:update-extensions',
  updateAllExtensions: 'extensions:update-all-extensions',

  checkEa: 'extensions:check-ea',

  onReload: 'extensions:on-reload',
  onUpdatedExtensions: 'extensions:on-updated-extensions',

  getExtensionsData: 'extensions:get-extensions-data',
  getInstalledExtensionsInfo: 'extensions:get-installed-extensions-info',

  getSkipped: 'extensions:get-skipped',
};

export const ptyChannels = {
  process: 'pty-process',
  customProcess: 'pty-custom-process',
  emptyProcess: 'pty-custom-process',
  customCommands: 'pty-custom-commands',
  write: 'pty-write',
  resize: 'pty-resize',
  onData: 'pty-on-data',
  onTitle: 'pty-on-title',
};

export const initializerChannels = {
  minimize: 'minimize-initializer',
  close: 'close-initializer',

  gitAvailable: 'git-available-initializer',

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
  isAppDir: 'appData:is-app-dir',
};

export const storageChannels = {
  get: 'storage:getData',

  getCustom: 'storage:get-custom',
  setCustom: 'storage:set-custom',

  getAll: 'storage:getAllData',
  update: 'storage:updateData',
  updateNested: 'storage:updateNested',
  clear: 'storage:clearStorage',
};

export const moduleApiChannels = {
  getFolderCreationTime: 'module_api_getFolderCreationTime',
  getLastPulledDate: 'module_api_getLastPulledDate',
  getCurrentReleaseTag: 'module_api_getCurrentReleaseTag',
};

export const storageUtilsChannels = {
  setSystemStartup: 'storageUtils:setSystemStartup',

  addInstalledCard: 'storageUtils:add-installed-card',
  removeInstalledCard: 'storageUtils:remove-installed-card',
  onInstalledCards: 'storageUtils:on-installed-cards',

  addAutoUpdateCard: 'storageUtils:add-autoUpdate-card',
  removeAutoUpdateCard: 'storageUtils:remove-autoUpdate-card',

  addAutoUpdateExtensions: 'storageUtils:add-autoUpdate-extensions',
  removeAutoUpdateExtensions: 'storageUtils:remove-autoUpdate-extensions',

  onAutoUpdateCards: 'storageUtils:on-autoUpdate-cards',
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

  customRunBehavior: 'storageUtils:custom-run-behavior',

  preOpen: 'storageUtils:pre-open',

  getCardArguments: 'storageUtils:get-card-arguments',
  setCardArguments: 'storageUtils:set-card-arguments',

  updateZoomFactor: 'storageUtils:update-zoom-factor',

  addBrowserRecent: 'storageUtils:add-browser-recent',
  addBrowserRecentFavIcon: 'storageUtils:add-browser-recent-favicon',
  removeBrowserRecent: 'storageUtils:remove-browser-recent',
  getBrowserRecent: 'storageUtils:get-browser-recent',

  onConfirmChange: 'storage:on-confirm-change',
};

export const appWindowChannels = {
  hotkeysChange: 'window:hotkeys-change',
};

export const contextMenuChannels = {
  onInitView: 'context:init-view',
  onFind: 'context:find-in-page',
  onZoom: 'context:zoom-page',
  resizeWindow: 'context:resize-window',
  showWindow: 'context:show-window',
  hideWindow: 'context:hide-window',
  copy: 'context:copy',
  paste: 'context:paste',
  replaceMisspelling: 'context:replaceMisspelling',
  selectAll: 'context:selectAll',
  undo: 'context:undo',
  redo: 'context:redo',

  newTab: 'context:newTab',
  openExternal: 'context:openExternal',

  downloadImage: 'context:download-image',
  navigate: 'context:navigate',
};

export const tabsChannels = {
  onNewTab: 'tabs:new-tab',
};

export const browserChannels = {
  createBrowser: 'browser:create-browser',
  removeBrowser: 'browser:remove-browser',
  loadURL: 'browser:load-url',
  setVisible: 'browser:set-visible',

  openFindInPage: 'browser:openFindInPage',
  openZoom: 'browser:openZoom',
  findInPage: 'browser:findInPage',
  stopFindInPage: 'browser:stopFindInPage',
  setZoomFactor: 'browser:setZoomFactor',

  reload: 'browser:reload',
  goBack: 'browser:goBack',
  goForward: 'browser:goForward',

  onCanGo: 'browser:on-can-go',
  isLoading: 'browser:is-loading',
  onTitleChange: 'browser:on-title-change',
  onFavIconChange: 'browser:on-favicon-change',
  onUrlChange: 'browser:on-url-change',
};
