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

export type AppUpdateStatus = string | UpdateDownloadProgress | undefined;
export type AppUpdateEventTypes = 'update-available' | 'download-progress' | 'update-downloaded' | 'error';

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

export type FavIcons = {url: string; favIcon: string};
export type BrowserHistoryData = {
  recentAddress: string[];
  favoriteAddress: string[];
  historyAddress: string[];
  favIcons: FavIcons[];
};
export type AgentTypes = 'lynxhub' | 'electron' | 'chrome' | 'custom';
export type XYType = {x: number; y: number};
export type WHType = {width: number; height: number};
export type ShowToastTypes = 'success' | 'error' | 'warning' | 'info';

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
  openUrlDefaultBrowser: 'win:open-url-default-browser',
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

  isEmptyDir: 'app:isEmptyDir',
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
  getImageAsDataURL: 'utils:get-image-as-data-url',
};

export const modulesChannels = {
  cardUpdateAvailable: 'modules:card-update-available',
  uninstallCardByID: 'modules:uninstall-card-by-id',
  checkCardsUpdateInterval: 'modules:cards_update_interval',
  onCardsUpdateAvailable: 'modules:on_cards_update_available',
};

export const pluginChannels = {
  onUpdateAvailableList: 'plugins:on-update-available-list',
  onAppNeedRestart: 'plugins:app-need-restart',

  checkStage: 'plugins:check-stage',
  getPluginsData: 'plugins:get-plugins-data',
  getInstalledPlugins: 'plugins:get-installed-plugins',
  getSkippedPlugins: 'plugins:get-skipped-plugins',

  installPlugin: 'plugins:install-plugin',
  uninstallPlugin: 'plugins:uninstall-plugin',
  isUpdateAvailable: 'plugins:is-update-available',
  updatePlugin: 'plugins:update-plugin',
  updatePlugins: 'plugins:update-plugins',
  checkForUpdates: 'plugins:check-for-updates',
};

export const ptyChannels = {
  process: 'pty-process',
  customProcess: 'pty-custom-process',
  emptyProcess: 'pty-custom-process',
  customCommands: 'pty-custom-commands',
  write: 'pty-write',
  clear: 'pty-clear',
  resize: 'pty-resize',
  onData: 'pty-on-data',
  onTitle: 'pty-on-title',

  onExit: 'pty-on-exit-code',
};

export const appUpdateChannels = {
  statusError: 'appUpdate:statusError',
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
  addBrowserFavorite: 'storageUtils:add-browser-favorite',
  addBrowserHistory: 'storageUtils:add-browser-history',
  addBrowserRecentFavIcon: 'storageUtils:add-browser-recent-favicon',
  removeBrowserRecent: 'storageUtils:remove-browser-recent',
  removeBrowserFavorite: 'storageUtils:remove-browser-favorite',
  removeBrowserHistory: 'storageUtils:remove-browser-favorite',

  setShowConfirm: 'storage:set-show-confirm',
  onConfirmChange: 'storage:on-confirm-change',

  addReadNotif: 'storageUtils:add-read-notif',

  setCardTerminalPreCommands: 'storageUtils:card-terminal-preCommands',

  unassignCard: 'storageUtils:unassign-card',
  getBrowserHistoryData: 'storageUtils:getBrowserHistoryData',
};

export const appWindowChannels = {
  hotkeysChange: 'window:hotkeys-change',
  showToast: 'window:show-toast',
  toastBtnPress: 'window-toast-btn-press',
};

export const contextMenuChannels = {
  onInitView: 'context:init-view',
  onFind: 'context:find-in-page',
  onTerminateAI: 'context:on-terminate-ai',
  onTerminateTab: 'context:on-terminate-tab',
  onCloseApp: 'context:on-close-app',
  onZoom: 'context:zoom-page',

  relaunchAI: 'context:relaunch-ai',
  onRelaunchAI: 'context:on-relaunch-ai',
  stopAI: 'context:stop-ai',
  onStopAI: 'context:on-stop-ai',

  removeTab: 'context:remove-tab',
  onRemoveTab: 'context:on-remove-tab',

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

  openTerminateAI: 'context:open-terminate-ai',
  openTerminateTab: 'context:open-terminate-tab',
  openCloseApp: 'context:open-close-app',
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

  focusWebView: 'browser:focus-webview',

  clearCache: 'browser:clear-cache',
  clearCookies: 'browser:clear-cookies',

  reload: 'browser:reload',
  goBack: 'browser:goBack',
  goForward: 'browser:goForward',

  onCanGo: 'browser:on-can-go',
  isLoading: 'browser:is-loading',
  onTitleChange: 'browser:on-title-change',
  onFavIconChange: 'browser:on-favicon-change',
  onUrlChange: 'browser:on-url-change',
  onDomReady: 'browser:on-dom-ready',

  getUserAgent: 'browser:get-user-agent',
  updateUserAgent: 'browser:update-user-agent',

  addOffset: 'browser:add-offset',
  clearHistory: 'browser:clear-history',
};

export const staticsChannels = {
  pull: 'statics:pull',
  getReleases: 'statics:getReleases',
  getInsider: 'statics:getInsider',
  getNotification: 'statics:getNotification',
  getModules: 'statics:getModules',
  getExtensions: 'statics:getExtensions',
  getExtensionsEA: 'statics:getExtensionsEA',
  getPatrons: 'statics:getPatrons',
  getPluginsList: 'statics:getPluginsList',
};

export const initChannels = {
  checkGitInstalled: 'init:checkGitInstalled',
  checkPwsh7Installed: 'init:checkPwsh7Installed',
};

export const eventsChannels = {
  card_PreCommandUninstall: 'events:card_PreCommandUninstall',
};
