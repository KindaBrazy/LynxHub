import winChannels from '@lynx_cross/consts/ipc_channels/application';
import {ChangeWindowState, DarkModeTypes, SystemInfo, TaskbarStatus, WinStateChange} from '@lynx_cross/types/ipc';

import lynxIpc from './lynxIpc';

const applicationIpc = {
  send: {
    // Changes window state (maximize, minimize, close, fullscreen, restart)
    changeWinState: (state: ChangeWindowState): void => lynxIpc.send(winChannels.changeState, state),

    // Sets app theme (light, dark, or system)
    setDarkMode: (darkMode: DarkModeTypes): void => lynxIpc.send(winChannels.setDarkMode, darkMode),

    // Sets taskbar visibility status (taskbar, tray, taskbar-tray, tray-minimized)
    setTaskBarStatus: (status: TaskbarStatus): void => lynxIpc.send(winChannels.setTaskBarStatus, status),

    // Opens URL in default system browser
    openUrlDefaultBrowser: (url: string): void => lynxIpc.send(winChannels.openUrlDefaultBrowser, url),

    /* Sets window progress bar (taskbar/dock)
       - **progress**: 0-1 for progress, -1 to remove, >1 for indeterminate */
    setProgressBar: (
      progress: number,
      options?: {mode: 'none' | 'normal' | 'indeterminate' | 'error' | 'paused'},
    ): void => lynxIpc.send(winChannels.setProgressBar, progress, options),
  },
  invoke: {
    // Gets system dark mode preference (light/dark)
    getSystemDarkMode: () => lynxIpc.invoke<'light' | 'dark'>(winChannels.getSystemDarkMode),

    // Gets whether current dark mode
    isDarkMode: () => lynxIpc.invoke<boolean>(winChannels.isDarkMode),

    // Gets system information (OS platform and build number)
    getSystemInfo: () => lynxIpc.invoke<SystemInfo>(winChannels.getSystemInfo),
  },
  on: {
    // Listens for window state change events
    windowStateChange: (result: (result: WinStateChange) => void) => lynxIpc.on(winChannels.onChangeState, result),

    // Listens for dark mode change events
    darkMode: (result: (isDark: boolean) => void) => lynxIpc.on(winChannels.onDarkMode, result),
  },
};

export default applicationIpc;
