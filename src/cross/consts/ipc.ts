export const otherChannels = {
  disableLoadingAnimations: 'others:disableLoadingAnimations',
  onOnline: 'others:onOnline',
} as const;

export const imageCacheChannels = {
  getStats: 'imageCache:getStats',
  clearCache: 'imageCache:clearCache',
  triggerCleanup: 'imageCache:triggerCleanup',
} as const;

export const browserChannels = {
  createBrowser: 'browser:create-browser',
  removeBrowser: 'browser:remove-browser',
  loadURL: 'browser:load-url',
  setVisible: 'browser:set-visible',

  openFindInPage: 'browser:openFindInPage',
  openZoom: 'browser:openZoom',
  openVolume: 'browser:openVolume',

  onLinkHover: 'browser:on-link-hover',
  resizeLinkPreview: 'browser:resize-link-preview',

  findInPage: 'browser:findInPage',
  stopFindInPage: 'browser:stopFindInPage',
  setZoomFactor: 'browser:setZoomFactor',

  focusWebView: 'browser:focus-webview',

  clearCache: 'browser:clear-cache',
  clearCookies: 'browser:clear-cookies',

  reload: 'browser:reload',
  stop: 'browser:stop',
  goBack: 'browser:goBack',
  goForward: 'browser:goForward',

  toggleDevTools: 'browser:toggle-devtools',

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

  onFailedLoadUrl: 'browser:on-failed-load-url',
  onClearFailed: 'browser:on-clear-failed',
} as const;

export const staticsChannels = {
  pull: 'statics:pull',
  getReleases: 'statics:getReleases',
  getInsider: 'statics:getInsider',
  getNotification: 'statics:getNotification',
  getModules: 'statics:getModules',
  getExtensions: 'statics:getExtensions',
  getExtensionsEA: 'statics:getExtensionsEA',
  getPatrons: 'statics:getPatrons',
} as const;

export const initChannels = {
  checkGitInstalled: 'init:checkGitInstalled',
  checkPwsh7Installed: 'init:checkPwsh7Installed',
} as const;

export const eventsChannels = {
  card_PreCommandUninstall: 'events:card_PreCommandUninstall',
} as const;

export const patreonChannels = {
  getInfo: 'patreon:getInfo',
  login: 'patreon:login',
  logout: 'patreon:logout',
  updateChannel: 'patreon:updateChannel',

  onReleaseChannel: 'patreon:onReleaseChannel',
} as const;

export const volumeChannels = {
  // Renderer -> Main
  setVolume: 'volume:set',
  setMuted: 'volume:setMuted',
  getState: 'volume:getState',

  // Context menu -> Main -> Main renderer (for Redux sync)
  updateTabVolume: 'volume:updateTabVolume',
  updateTabMuted: 'volume:updateTabMuted',
  onTabVolumeUpdate: 'volume:onTabVolumeUpdate',
  onTabMutedUpdate: 'volume:onTabMutedUpdate',

  // Main -> Renderer
  onAudioStateChange: 'volume:onAudioStateChange',
} as const;

export const appUpdateChannels = {
  statusError: 'appUpdate:statusError',
  status: 'appUpdate:status',
  download: 'appUpdate:download',
  cancel: 'appUpdate:cancel',
  install: 'appUpdate:install',
  installLater: 'appUpdate:install-later',
} as const;

export const appDataChannels = {
  getCurrentPath: 'appData:get-current-path',
  selectAnother: 'appData:select-another',
  isAppDir: 'appData:is-app-dir',
} as const;

export const storageChannels = {
  get: 'storage:getData',

  getCustom: 'storage:get-custom',
  setCustom: 'storage:set-custom',

  getAll: 'storage:getAllData',
  update: 'storage:updateData',
  updateNested: 'storage:updateNested',
  clear: 'storage:clearStorage',
} as const;

export const moduleApiChannels = {
  getFolderCreationTime: 'module_api_getFolderCreationTime',
  getLastPulledDate: 'module_api_getLastPulledDate',
  getCurrentReleaseTag: 'module_api_getCurrentReleaseTag',
} as const;

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
} as const;

export const appWindowChannels = {
  hotkeysChange: 'window:hotkeys-change',
  showToast: 'window:show-toast',
  toastBtnPress: 'window-toast-btn-press',
} as const;

export const contextMenuChannels = {
  onInitView: 'context:init-view',
  onFind: 'context:find-in-page',
  onTerminateAI: 'context:on-terminate-ai',
  onTerminateTab: 'context:on-terminate-tab',
  onCloseApp: 'context:on-close-app',
  onZoom: 'context:zoom-page',
  onVolume: 'context:volume-control',
  onDownloads: 'context:downloads',

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
  cut: 'context:cut',
  paste: 'context:paste',
  replaceMisspelling: 'context:replaceMisspelling',
  selectAll: 'context:selectAll',
  undo: 'context:undo',
  redo: 'context:redo',

  newTab: 'context:newTab',
  openExternal: 'context:openExternal',

  downloadImage: 'context:download-image',
  copyImage: 'context:copy-image',
  searchWithGoogle: 'context:search-google',
  inspectElement: 'context:inspect-element',
  navigate: 'context:navigate',

  openTerminateAI: 'context:open-terminate-ai',
  openTerminateTab: 'context:open-terminate-tab',
  openCloseApp: 'context:open-close-app',
} as const;

export const tabsChannels = {
  onNewTab: 'tabs:new-tab',
} as const;

export const winChannels = {
  changeState: 'win:state-change',
  onChangeState: 'win:on-state-change',

  setDarkMode: 'win:set-darkMode',
  getSystemDarkMode: 'win:get-system-darkMode',
  onDarkMode: 'win:on-darkMode',
  isDarkMode: 'win:isDarkMode',

  setTaskBarStatus: 'win:set-taskbar-status',

  getSystemInfo: 'win:get-system-info',
  openUrlDefaultBrowser: 'win:open-url-default-browser',

  // Window progress bar (taskbar/dock)
  setProgressBar: 'win:set-progress-bar',
} as const;

export const fileChannels = {
  getAppDirectories: 'app:getAppDirectories',
  dialog: 'app:openDialog',
  extensionsNames: 'app:extensionsFolder',
  openPath: 'app:openPath',
  saveToFile: 'app:saveToFile',
  removeDir: 'app:removeDir',
  trashDir: 'app:trashDir',
  listDir: 'app:listDir',
  checkFilesExist: 'app:checkFilesExist',
  calcFolderSize: 'app:calcFolderSize',
  getRelativePath: 'app:getRelativePath',
  getAbsolutePath: 'app:getAbsolutePath',

  isEmptyDir: 'app:isEmptyDir',
} as const;

export const gitChannels = {
  shallowClone: 'git:clone-shallow',
  shallowClonePromise: 'git:clone-shallow-promise',

  stashDrop: 'git:stash-drop',

  validateGitDir: 'git:validateGitDir',

  getRepoInfo: 'git:get-repo-info',
  changeBranch: 'git:changeBranch',
  unShallow: 'git:unShallow',
  resetHard: 'git:resetHard',

  pull: 'git:pull',

  onProgress: 'git:on-progress',
} as const;

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
} as const;

export const modulesChannels = {
  cardUpdateAvailable: 'modules:card-update-available',
  uninstallCardByID: 'modules:uninstall-card-by-id',
  checkCardsUpdateInterval: 'modules:cards_update_interval',
  onCardsUpdateAvailable: 'modules:on_cards_update_available',
} as const;

export const pluginChannels = {
  onSyncAvailable: 'plugins:on-sync-available',

  getList: 'plugins:get-list',
  getAddresses: 'plugins:get-addresses',
  getInstalledList: 'plugins:get-installed-list',
  getUnloadedList: 'plugins:get-unloaded-list',

  install: 'plugins:install',
  uninstall: 'plugins:uninstall',
  sync: 'plugins:sync',
  syncAll: 'plugins:sync-all',
  checkForSync: 'plugins:check-for-sync',

  updateSyncList: 'plugins:update-sync-list',
} as const;

export const ptyChannels = {
  process: 'pty-process',
  customProcess: 'pty-custom-process',
  emptyProcess: 'pty-custom-process',
  stopProcess: 'pty-stop-process',
  customCommands: 'pty-custom-commands',
  write: 'pty-write',
  clear: 'pty-clear',
  resize: 'pty-resize',
  onData: 'pty-on-data',
  onTitle: 'pty-on-title',

  onExit: 'pty-on-exit-code',

  // Terminal progress (ConEmu OSC 9;4 sequence)
  onProgress: 'pty-on-progress',
} as const;
