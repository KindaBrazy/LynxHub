import appChannels from '@lynx_common/consts/ipc_channels/application';
import {CustomNotificationInfo, HeroToastPlacement} from '@lynx_common/types';
import {
  AppUpdateEventTypes,
  AppUpdateStatus,
  ChangeWindowState,
  DarkModeTypes,
  LynxInput,
  ShowToastTypes,
  SystemInfo,
  TaskbarStatus,
  WinStateChange,
} from '@lynx_common/types/ipc';

import lynxIpc from './lynxIpc';

const applicationIpc = {
  send: {
    // Changes window state (maximize, minimize, close, fullscreen, restart)
    changeWinState: (state: ChangeWindowState) => lynxIpc.send(appChannels.changeState, state),

    // Sets app theme (light, dark, or system)
    setDarkMode: (darkMode: DarkModeTypes) => lynxIpc.send(appChannels.setDarkMode, darkMode),

    // Sets taskbar visibility status (taskbar, tray, taskbar-tray, tray-minimized)
    setTaskBarStatus: (status: TaskbarStatus) => lynxIpc.send(appChannels.setTaskBarStatus, status),

    // Opens URL in default system browser
    openUrlDefaultBrowser: (url: string) => lynxIpc.send(appChannels.openUrlDefaultBrowser, url),

    /* Sets window progress bar (taskbar/dock)
       - **progress**: 0-1 for progress, -1 to remove, >1 for indeterminate */
    setProgressBar: (progress: number, options?: {mode: 'none' | 'normal' | 'indeterminate' | 'error' | 'paused'}) =>
      lynxIpc.send(appChannels.setProgressBar, progress, options),

    // Downloads app update
    updateDownload: () => lynxIpc.send(appChannels.updateDownload),

    // Cancels app update download
    updateCancel: () => lynxIpc.send(appChannels.updateCancel),

    // Installs downloaded app update
    updateInstall: () => lynxIpc.send(appChannels.updateInstall),

    // Sends button press event for custom notification
    onCustomNotifBtnPress: (btnId: string, notifKey: string) =>
      lynxIpc.send(appChannels.onCustomNotifBtnPress, btnId, notifKey),
  },
  invoke: {
    // Gets system dark mode preference (light/dark)
    getSystemDarkMode: () => lynxIpc.invoke<'light' | 'dark'>(appChannels.getSystemDarkMode),

    // Gets whether current dark mode
    isDarkMode: () => lynxIpc.invoke<boolean>(appChannels.isDarkMode),

    // Gets system information (OS platform and build number)
    getSystemInfo: () => lynxIpc.invoke<SystemInfo>(appChannels.getSystemInfo),

    // Gets current app data directory path
    getCurrentDataPath: () => lynxIpc.invoke<string>(appChannels.getCurrentDataPath),

    // Opens dialog to select new app data folder
    selectAnotherDataPath: () => lynxIpc.invoke<string>(appChannels.selectAnotherDataPath),

    // Checks if directory is valid app data directory
    isValidDataPath: (dir: string) => lynxIpc.invoke<boolean>(appChannels.isValidDataPath, dir),

    // Checks if Git is installed and returns version
    checkGitInstalled: () => lynxIpc.invoke<string | undefined>(appChannels.checkGitInstalled),

    // Checks if PowerShell 7 is installed and returns version
    checkPwsh7Installed: () => lynxIpc.invoke<string | undefined>(appChannels.checkPwsh7Installed),

    disableLoadingAnimations: () => lynxIpc.invoke<boolean>(appChannels.disableLoadingAnimations),
  },
  on: {
    // Listens for window state change events
    windowStateChange: (result: (result: WinStateChange) => void) => lynxIpc.on(appChannels.onChangeState, result),

    // Listens for dark mode change events
    darkMode: (result: (isDark: boolean) => void) => lynxIpc.on(appChannels.onDarkMode, result),

    // Listens for hotkey change events
    onHotkeysChange: (result: (input: LynxInput) => void) => lynxIpc.on(appChannels.hotkeysChange, result),

    // Listens for toast notification events
    onShowToast: (result: (message: string, type: ShowToastTypes, placement?: HeroToastPlacement) => void) =>
      lynxIpc.on(appChannels.showToast, result),

    // Listens for new tab events
    onNewTab: (result: (url: string, background?: boolean) => void) => lynxIpc.on(appChannels.onNewTab, result),

    // Listens for app update error events
    updateError: (result: () => void) => lynxIpc.on(appChannels.updateError, result),
    updateChannelChange: (result: (channel: string) => void) => lynxIpc.on(appChannels.updateChannelChange, result),

    // Listens for app update status events
    updateStatus: (result: (type: AppUpdateEventTypes, status: AppUpdateStatus) => void) =>
      lynxIpc.on(appChannels.updateStatus, result),

    onOnline: (result: (isOnline: boolean) => void) => lynxIpc.on(appChannels.onOnline, result),

    // Listens for custom notification open events
    onCustomNotifOpen: (result: (info: CustomNotificationInfo) => void) =>
      lynxIpc.on(appChannels.onCustomNotifOpen, result),

    // Listens for custom notification close events
    onCustomNotifClose: (result: (key: string) => void) => lynxIpc.on(appChannels.onCustomNotifClose, result),
  },
};

export default applicationIpc;
