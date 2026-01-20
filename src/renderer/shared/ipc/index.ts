import {extensionRendererApi} from '@lynx/plugins/extensions/loader';
import {customNotifChannels} from '@lynx_cross/consts/donwload_manager';
import {patreonChannels, volumeChannels} from '@lynx_cross/consts/ipc';
import {CustomNotificationInfo, PatreonUserData, SubscribeStages} from '@lynx_cross/types';
import {AudioState} from '@lynx_cross/types/ipc';
import type {IpcRendererEvent} from 'electron';

const ipc = window.electron.ipcRenderer;

const rendererIpc = {
  /** Managing browser volume and audio */
  volume: {
    // Sets volume level for browser webview (0-100)
    setVolume: async (id: string, volume: number): Promise<void> => {
      extensionRendererApi.events_ipc.emit('volume_set_volume', {id, volume});
      try {
        // Add timeout to IPC call (8 seconds - allows main process to handle its own timeout first)
        await Promise.race([
          ipc.invoke(volumeChannels.setVolume, id, volume),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Volume set operation timed out')), 8000)),
        ]);
      } catch {
        // Volume setting can fail during page load - this is expected and handled by main process
      }
    },

    // Sets mute state for browser webview
    setMuted: async (id: string, muted: boolean): Promise<void> => {
      extensionRendererApi.events_ipc.emit('volume_set_muted', {id, muted});
      try {
        // Add timeout to IPC call (8 seconds)
        await Promise.race([
          ipc.invoke(volumeChannels.setMuted, id, muted),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Mute set operation timed out')), 8000)),
        ]);
      } catch {
        // Mute setting can fail during page load - this is expected
      }
    },

    // Gets current audio state (playing, muted) for browser webview
    getState: async (id: string): Promise<AudioState | null> => {
      extensionRendererApi.events_ipc.emit('volume_get_state', {id});
      try {
        // Add timeout to IPC call (3 seconds)
        return await Promise.race([
          ipc.invoke(volumeChannels.getState, id),
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
    onAudioStateChange: (callback: (id: string, state: AudioState) => void) => {
      const handler = (_: IpcRendererEvent, id: string, state: AudioState) => {
        try {
          callback(id, state);
        } catch (error) {
          console.error('Error in audio state change callback:', error);
        }
      };
      return ipc.on(volumeChannels.onAudioStateChange, handler);
    },

    // Updates tab volume from context menu (sends to main window)
    updateTabVolume: (tabId: string, volume: number) => {
      ipc.send(volumeChannels.updateTabVolume, tabId, volume);
    },

    // Updates tab muted state from context menu (sends to main window)
    updateTabMuted: (tabId: string, muted: boolean) => {
      ipc.send(volumeChannels.updateTabMuted, tabId, muted);
    },

    // Listens for tab volume updates from context menu
    onTabVolumeUpdate: (callback: (tabId: string, volume: number) => void) =>
      ipc.on(volumeChannels.onTabVolumeUpdate, (_: IpcRendererEvent, tabId: string, volume: number) =>
        callback(tabId, volume),
      ),

    // Listens for tab muted updates from context menu
    onTabMutedUpdate: (callback: (tabId: string, muted: boolean) => void) =>
      ipc.on(volumeChannels.onTabMutedUpdate, (_: IpcRendererEvent, tabId: string, muted: boolean) =>
        callback(tabId, muted),
      ),
  },

  customNotification: {
    // Listens for custom notification open events
    onOpen: (result: (event: IpcRendererEvent, info: CustomNotificationInfo) => void) =>
      ipc.on(customNotifChannels.onOpen, result),
    // Listens for custom notification close events
    onClose: (result: (event: IpcRendererEvent, key: string) => void) => ipc.on(customNotifChannels.onClose, result),

    // Sends button press event for custom notification
    btnPress: (btnId: string, notifKey: string) => ipc.send(customNotifChannels.onBtnPress, btnId, notifKey),
  },

  patreon: {
    // Gets Patreon user information
    getInfo: (): Promise<PatreonUserData | undefined> => ipc.invoke(patreonChannels.getInfo),
    // Logs in to Patreon
    login: (): Promise<PatreonUserData> => ipc.invoke(patreonChannels.login),
    // Logs out from Patreon
    logout: (): Promise<void> => ipc.invoke(patreonChannels.logout),
    // Updates Patreon subscription channel
    updateChannel: (channel: SubscribeStages | 'get'): void => ipc.send(patreonChannels.updateChannel, channel),

    // Listens for Patreon release channel changes
    onReleaseChannel: (result: (event: IpcRendererEvent, stage: SubscribeStages) => void) =>
      ipc.on(patreonChannels.onReleaseChannel, result),
  },
};

export default rendererIpc;
