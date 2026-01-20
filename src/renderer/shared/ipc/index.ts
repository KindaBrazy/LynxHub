import {extensionRendererApi} from '@lynx/plugins/extensions/loader';
import {customNotifChannels} from '@lynx_cross/consts/donwload_manager';
import {
  appDataChannels,
  appUpdateChannels,
  appWindowChannels,
  eventsChannels,
  imageCacheChannels,
  initChannels,
  patreonChannels,
  ptyChannels,
  staticsChannels,
  tabsChannels,
  volumeChannels,
} from '@lynx_cross/consts/ipc';
import {otherChannels} from '@lynx_cross/consts/ipc';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  CustomNotificationInfo,
  ExtensionsInfo,
  HeroToastPlacement,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
  PatreonUserData,
  SubscribeStages,
} from '@lynx_cross/types';
import {AppUpdateEventTypes, AppUpdateStatus, AudioState, LynxInput, ShowToastTypes} from '@lynx_cross/types/ipc';
import type {IpcRendererEvent} from 'electron';

const ipc = window.electron.ipcRenderer;

const rendererIpc = {
  /** Managing and using node_pty(Pseudo Terminal ) */
  pty: {
    // Starts PTY process for card with pre-commands and run commands
    process: (id: string, cardId: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process', {id, cardId});
      ipc.send(ptyChannels.process, id, cardId);
    },
    // Starts custom PTY process with specific file to execute
    customProcess: (id: string, dir?: string, file?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom', {id, dir, file});
      ipc.send(ptyChannels.customProcess, id, dir, file);
    },
    // Starts empty PTY process (no commands executed)
    emptyProcess: (id: string, dir?: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_process_empty', {id, dir});
      ipc.send(ptyChannels.emptyProcess, id, dir);
    },
    // Executes custom commands in PTY
    customCommands: (id: string, commands?: string | string[], dir?: string) => {
      extensionRendererApi.events_ipc.emit('terminal_process_custom_command', {id, commands, dir});
      ipc.send(ptyChannels.customCommands, id, commands, dir);
    },

    // Stops PTY process by ID
    stop: (id: string) => {
      extensionRendererApi.events_ipc.emit('terminal_process_stop', {id});
      ipc.send(ptyChannels.stopProcess, id);
    },

    // Writes data to PTY input
    write: (id: string, data: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_write', {id, data});
      ipc.send(ptyChannels.write, id, data);
    },

    // Clears PTY terminal screen
    clear: (id: string): void => {
      extensionRendererApi.events_ipc.emit('terminal_clear', {id});
      ipc.send(ptyChannels.clear, id);
    },

    // Resizes PTY terminal dimensions
    resize: (id: string, cols: number, rows: number): void => {
      extensionRendererApi.events_ipc.emit('terminal_resize', {id, cols, rows});
      ipc.send(ptyChannels.resize, id, cols, rows);
    },

    // Listens for PTY output data
    onData: (result: (event: IpcRendererEvent, id: string, data: string) => void) => ipc.on(ptyChannels.onData, result),
    // Listens for PTY title changes
    onTitle: (result: (event: IpcRendererEvent, id: string, title: string) => void) =>
      ipc.on(ptyChannels.onTitle, result),
    // Listens for PTY process exit
    onExit: (result: (event: IpcRendererEvent, id: string) => void) => ipc.on(ptyChannels.onExit, result),
  },

  /** Managing app automatic updates */
  appUpdate: {
    // Listens for app update error events
    statusError: (result: (event: IpcRendererEvent) => void) => ipc.on(appUpdateChannels.statusError, result),

    // Listens for app update status events
    status: (result: (event: IpcRendererEvent, type: AppUpdateEventTypes, status: AppUpdateStatus) => void) =>
      ipc.on(appUpdateChannels.status, result),

    // Downloads app update
    download: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_download', {});
      ipc.send(appUpdateChannels.download);
    },

    // Cancels app update download
    cancel: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_cancel', {});
      ipc.send(appUpdateChannels.cancel);
    },

    // Installs downloaded app update
    install: (): void => {
      extensionRendererApi.events_ipc.emit('app_update_install', {});
      ipc.send(appUpdateChannels.install);
    },
  },

  /** Managing app data directories */
  appData: {
    // Gets current app data directory path
    getCurrentPath: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_get_current_path', {});
      return ipc.invoke(appDataChannels.getCurrentPath);
    },

    // Opens dialog to select new app data folder
    selectAnother: (): Promise<string> => {
      extensionRendererApi.events_ipc.emit('app_data_select_another', {});
      return ipc.invoke(appDataChannels.selectAnother);
    },

    // Checks if directory is valid app data directory
    isAppDir: (dir: string): Promise<boolean> => {
      extensionRendererApi.events_ipc.emit('app_data_is_app_dir', {dir});
      return ipc.invoke(appDataChannels.isAppDir, dir);
    },
  },

  appWindow: {
    // Listens for hotkey change events
    onHotkeysChange: (result: (event: IpcRendererEvent, input: LynxInput) => void) =>
      ipc.on(appWindowChannels.hotkeysChange, result),

    // Listens for toast notification events
    onShowToast: (
      result: (event: IpcRendererEvent, message: string, type: ShowToastTypes, placement?: HeroToastPlacement) => void,
    ) => ipc.on(appWindowChannels.showToast, result),
  },

  tab: {
    // Listens for new tab events
    onNewTab: (result: (event: IpcRendererEvent, url: string, background?: boolean) => void) =>
      ipc.on(tabsChannels.onNewTab, result),
  },

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

  statics: {
    // Pulls latest static data from server
    pull: (): Promise<void> => {
      extensionRendererApi.events_ipc.emit('statics_pull', {});
      return ipc.invoke(staticsChannels.pull);
    },
    // Gets app release information
    getReleases: (): Promise<AppUpdateData | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_releases', {});
      return ipc.invoke(staticsChannels.getReleases);
    },
    // Gets insider build information
    getInsider: (): Promise<AppUpdateInsiderData | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_insider', {});
      return ipc.invoke(staticsChannels.getInsider);
    },
    // Gets notification data
    getNotification: (): Promise<Notification_Data[] | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_notification', {});
      return ipc.invoke(staticsChannels.getNotification);
    },
    // Gets available modules list
    getModules: (): Promise<ModulesInfo[] | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_modules', {});
      return ipc.invoke(staticsChannels.getModules);
    },
    // Gets available extensions list
    getExtensions: (): Promise<ExtensionsInfo[] | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions', {});
      return ipc.invoke(staticsChannels.getExtensions);
    },
    // Gets early access extensions list
    getExtensionsEA: (): Promise<ExtensionsInfo[] | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_extensions_ea', {});
      return ipc.invoke(staticsChannels.getExtensionsEA);
    },
    // Gets Patreon supporters list
    getPatrons: (): Promise<PatreonSupporter[] | undefined> => {
      extensionRendererApi.events_ipc.emit('statics_get_patrons', {});
      return ipc.invoke(staticsChannels.getPatrons);
    },
  },

  events: {
    // Sends event for card pre-command uninstall
    card_PreCommandUninstall: (preCommands: string[]) => ipc.send(eventsChannels.card_PreCommandUninstall, preCommands),
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

  init: {
    // Checks if Git is installed and returns version
    checkGitInstalled: (): Promise<string | undefined> => ipc.invoke(initChannels.checkGitInstalled),
    // Checks if PowerShell 7 is installed and returns version
    checkPwsh7Installed: (): Promise<string | undefined> => ipc.invoke(initChannels.checkPwsh7Installed),
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

  /** Image caching system using lynxcache:// protocol */
  imageCache: {
    // Gets cache statistics (entry count, total size, last cleanup)
    getStats: (): Promise<{
      entryCount: number;
      totalSize: number;
      totalSizeFormatted: string;
      lastCleanup: number;
      lastCleanupFormatted: string;
    }> => ipc.invoke(imageCacheChannels.getStats),

    // Clears all cached images
    clearCache: (): Promise<{success: boolean; clearedEntries: number}> => ipc.invoke(imageCacheChannels.clearCache),

    // Triggers manual cache cleanup (removes expired entries)
    triggerCleanup: (): Promise<{success: boolean}> => ipc.invoke(imageCacheChannels.triggerCleanup),
  },

  others: {
    disableLoadingAnimations: (): Promise<boolean> => ipc.invoke(otherChannels.disableLoadingAnimations),
    onOnline: (result: (event: IpcRendererEvent, isOnline: boolean) => void) => ipc.on(otherChannels.onOnline, result),
  },
};

export default rendererIpc;
