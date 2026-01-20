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
