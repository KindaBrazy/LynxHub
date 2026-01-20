export const otherChannels = {
  disableLoadingAnimations: 'others:disableLoadingAnimations',
  onOnline: 'others:onOnline',
} as const;

export const imageCacheChannels = {
  getStats: 'imageCache:getStats',
  clearCache: 'imageCache:clearCache',
  triggerCleanup: 'imageCache:triggerCleanup',
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

export const appWindowChannels = {
  hotkeysChange: 'window:hotkeys-change',
  showToast: 'window:show-toast',
  toastBtnPress: 'window-toast-btn-press',
} as const;

export const tabsChannels = {
  onNewTab: 'tabs:new-tab',
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
