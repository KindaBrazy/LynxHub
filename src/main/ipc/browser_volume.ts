import browserVolumeChannels from '@lynx_cross/consts/ipc_channels/browser_volume';
import {AudioState} from '@lynx_cross/types/ipc';

import BrowserManager from '../core/browser';
import lynxIpc from './lynxIpc';
import {handleGetAudioState, handleSetMuted, handleSetVolume} from './methods/volume';
import {sendToMain} from './sender';

export function listenBrowserVolume(browserManager: BrowserManager) {
  // Sets volume level for browser webview (0-100) - remove existing handler first to prevent duplicate registration
  browserVolumeIpc.handle.setVolume((id, volume) => handleSetVolume(browserManager, id, volume));

  // Sets mute state for browser webview - remove existing handler first to prevent duplicate registration
  browserVolumeIpc.handle.setMuted((id, muted) => handleSetMuted(browserManager, id, muted));

  // Gets current audio state (playing, muted) for browser webview - remove existing handler first
  browserVolumeIpc.handle.getState(id => handleGetAudioState(browserManager, id));

  // Forward volume updates from context menu to main window
  browserVolumeIpc.on.updateTabVolume((tabId, volume) => browserVolumeIpc.send.onTabVolumeUpdate(tabId, volume));
  browserVolumeIpc.on.updateTabMuted((tabId, muted) => browserVolumeIpc.send.onTabMutedUpdate(tabId, muted));
}

export const browserVolumeIpc = {
  send: {
    onTabVolumeUpdate: (tabId: string, volume: number) =>
      sendToMain(browserVolumeChannels.onTabVolumeUpdate, tabId, volume),
    onTabMutedUpdate: (tabId: string, muted: boolean) =>
      sendToMain(browserVolumeChannels.onTabMutedUpdate, tabId, muted),
    onAudioStateChange: (id: string, state: AudioState) =>
      sendToMain(browserVolumeChannels.onAudioStateChange, id, state),
  },
  on: {
    updateTabVolume: (callback: (tabId: string, volume: number) => void) =>
      lynxIpc.on(browserVolumeChannels.updateTabVolume, callback),
    updateTabMuted: (callback: (tabId: string, muted: boolean) => void) =>
      lynxIpc.on(browserVolumeChannels.updateTabMuted, callback),
  },
  handle: {
    setVolume: (callback: (id: string, volume: number) => Promise<void>) =>
      lynxIpc.handle<void>(browserVolumeChannels.setVolume, callback),
    setMuted: (callback: (id: string, muted: boolean) => void) =>
      lynxIpc.handle<void>(browserVolumeChannels.setMuted, callback),
    getState: (callback: (id: string) => AudioState | null) =>
      lynxIpc.handle<AudioState | null>(browserVolumeChannels.getState, callback),
  },
};
