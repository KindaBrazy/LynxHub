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
