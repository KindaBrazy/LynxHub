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
