import browserVolumeChannels from '@lynx_cross/consts/ipc_channels/browser_volume';
import {AudioState} from '@lynx_cross/types/ipc';

import lynxIpc from './lynxIpc';

const browserVolume = {
  // Sets volume level for browser webview (0-100)
  setVolume: async (id: string, volume: number) => {
    try {
      // Add timeout to IPC call (8 seconds - allows main process to handle its own timeout first)
      await Promise.race([
        lynxIpc.invoke<void>(browserVolumeChannels.setVolume, id, volume),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Volume set operation timed out')), 8000)),
      ]);
    } catch {
      // Volume setting can fail during page load - this is expected and handled by main process
    }
  },

  // Sets mute state for browser webview
  setMuted: async (id: string, muted: boolean) => {
    try {
      // Add timeout to IPC call (8 seconds)
      await Promise.race([
        lynxIpc.invoke<void>(browserVolumeChannels.setMuted, id, muted),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Mute set operation timed out')), 8000)),
      ]);
    } catch {
      // Mute setting can fail during page load - this is expected
    }
  },

  // Gets current audio state (playing, muted) for browser webview
  getState: async (id: string) => {
    try {
      // Add timeout to IPC call (3 seconds)
      return await Promise.race([
        lynxIpc.invoke<AudioState | null>(browserVolumeChannels.getState, id),
        new Promise<AudioState | null>((_, reject) =>
          setTimeout(() => reject(new Error('Get audio state operation timed out')), 3000),
        ),
      ]);
    } catch (error) {
      console.error('Failed to get audio state:', error);
      return null;
    }
  },

  // Listens for audio state changes (media started/paused, mute state)
  onAudioStateChange: (callback: (id: string, state: AudioState) => void) =>
    lynxIpc.on(browserVolumeChannels.onAudioStateChange, callback),

  // Updates tab volume from context menu (sends to main window)
  updateTabVolume: (tabId: string, volume: number) =>
    lynxIpc.send(browserVolumeChannels.updateTabVolume, tabId, volume),

  // Updates tab muted state from context menu (sends to main window)
  updateTabMuted: (tabId: string, muted: boolean) => lynxIpc.send(browserVolumeChannels.updateTabMuted, tabId, muted),

  // Listens for tab volume updates from context menu
  onTabVolumeUpdate: (callback: (tabId: string, volume: number) => void) =>
    lynxIpc.on(browserVolumeChannels.onTabVolumeUpdate, callback),

  // Listens for tab muted updates from context menu
  onTabMutedUpdate: (callback: (tabId: string, muted: boolean) => void) =>
    lynxIpc.on(browserVolumeChannels.onTabMutedUpdate, callback),
};

export default browserVolume;
