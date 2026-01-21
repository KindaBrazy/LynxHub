import appChannels from '@lynx_cross/consts/ipc_channels/application';
import {CustomNotificationInfo, HeroToastPlacement} from '@lynx_cross/types';
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
} from '@lynx_cross/types/ipc';
import {nativeTheme, shell} from 'electron';

import classHolder from '../core/class_holder';
import {getAppDataPath, isAppDir, selectNewAppDataFolder} from '../core/data_folder';
import {
  getSystemDarkMode,
  getWebContentsIfAvailable,
  isDark,
  isGitInstalled,
  isPwsh7Installed,
  noticeAllWindowsDarkMode,
} from '../utils';
import lynxIpc from './lynxIpc';
import {changeWindowState, setDarkMode, setTaskbarStatus} from './methods';
import {getSystemInfo} from './methods/platform';
import {sendToMain} from './sender';

export default function listenApplication() {
  const {appManager, storageManager} = classHolder;

  // Listens for system theme changes and updates app if set to 'system' mode
  nativeTheme.on('updated', () => {
    if (storageManager.getData('app').darkMode === 'system') noticeAllWindowsDarkMode('system');
  });

  // Changes window state (maximize, minimize, close, fullscreen, restart)
  applicationIpc.on.onChangeState(state => changeWindowState(state));

  // Sets app theme (light, dark, or system)
  applicationIpc.on.setDarkMode(darkMode => setDarkMode(darkMode));

  // Sets taskbar visibility status (taskbar, tray, taskbar-tray, tray-minimized)
  applicationIpc.on.setTaskBarStatus(status => setTaskbarStatus(status));

  // Opens URL in default system browser

  applicationIpc.on.openUrlDefaultBrowser(url => shell.openExternal(url));

  // Sets window progress bar (taskbar/dock) - value: 0-1 for progress, -1 to remove, >1 for indeterminate
  // mode: 'none' | 'normal' | 'indeterminate' | 'error' | 'paused' (Windows only)
  applicationIpc.on.setProgressBar((progress, options) => {
    const window = appManager?.getMainWindow();
    if (window) window.setProgressBar(progress, options);
  });

  // Gets system dark mode preference (light/dark)
  applicationIpc.handle.getSystemDarkMode(() => getSystemDarkMode());

  applicationIpc.handle.isDarkMode(() => isDark());

  // Gets system information (OS platform and build number)
  applicationIpc.handle.getSystemInfo(() => getSystemInfo());

  applicationIpc.handle.checkGitInstalled(() => isGitInstalled());

  applicationIpc.handle.checkPwsh7Installed(() => isPwsh7Installed());

  applicationIpc.handle.getCurrentDataPath(() => getAppDataPath());
  applicationIpc.handle.selectAnotherDataPath(() => selectNewAppDataFolder());
  applicationIpc.handle.isValidDataPath(dir => isAppDir(dir));
}

const sendIsDarkToAllWindows = (isDark: boolean) => {
  const {contextMenuManager, linkPreviewManager, shareScreenManager, toastWindow} = classHolder;

  sendToMain(appChannels.onDarkMode, isDark);

  const contextMenu = getWebContentsIfAvailable(contextMenuManager?.getWindow());
  if (contextMenu) contextMenu.send(appChannels.onDarkMode, isDark);

  const linkPreview = getWebContentsIfAvailable(linkPreviewManager?.getWindow());
  if (linkPreview) linkPreview.send(appChannels.onDarkMode, isDark);

  const shareScreen = getWebContentsIfAvailable(shareScreenManager?.selectorWindow);
  if (shareScreen) shareScreen.send(appChannels.onDarkMode, isDark);

  const toast = getWebContentsIfAvailable(toastWindow);
  if (toast) toast.send(appChannels.onDarkMode, isDark);
};

export const applicationIpc = {
  send: {
    onNewTab: (url: string, background?: boolean) => sendToMain(appChannels.onNewTab, url, background),
    onOnline: (isOnline: boolean) => sendToMain(appChannels.onOnline, isOnline),
    onHotkeysChange: (input: LynxInput) => sendToMain(appChannels.hotkeysChange, input),
    updateStatus: (type: AppUpdateEventTypes, status?: AppUpdateStatus) =>
      sendToMain(appChannels.updateStatus, type, status),
    updateError: () => sendToMain(appChannels.updateError),

    onCustomNotifOpen: (data: CustomNotificationInfo) => sendToMain(appChannels.onCustomNotifOpen, data),
    onCustomNotifClose: (key: string) => sendToMain(appChannels.onCustomNotifClose, key),

    showToast: (message: string, type: ShowToastTypes, placement: HeroToastPlacement = 'bottom-right') =>
      sendToMain(appChannels.showToast, message, type, placement),
    changeWinState: (state: WinStateChange) => sendToMain(appChannels.onChangeState, state),
    updateChannelChange: (channel: string) => sendToMain(appChannels.updateChannelChange, channel),
    onDarkMode: (isDark: boolean) => sendIsDarkToAllWindows(isDark),
  },
  on: {
    onChangeState: (callback: (state: ChangeWindowState) => void) => lynxIpc.on(appChannels.changeState, callback),
    setDarkMode: (callback: (darkMode: DarkModeTypes) => void) => lynxIpc.on(appChannels.setDarkMode, callback),
    setTaskBarStatus: (callback: (status: TaskbarStatus) => void) => lynxIpc.on(appChannels.setTaskBarStatus, callback),
    openUrlDefaultBrowser: (callback: (url: string) => void) => lynxIpc.on(appChannels.openUrlDefaultBrowser, callback),
    setProgressBar: (
      callback: (progress: number, options?: {mode: 'none' | 'normal' | 'indeterminate' | 'error' | 'paused'}) => void,
    ) => lynxIpc.on(appChannels.setProgressBar, callback),
    updateDownload: (callback: () => void) => lynxIpc.on(appChannels.updateDownload, callback),
    updateInstall: (callback: () => void) => lynxIpc.on(appChannels.updateInstall, callback),
    updateCancel: (callback: () => void) => lynxIpc.on(appChannels.updateCancel, callback),

    onCustomNotifBtnPress: (callback: (btnId: string, notifKey: string) => void) =>
      lynxIpc.on(appChannels.onCustomNotifBtnPress, callback),
  },
  handle: {
    getSystemDarkMode: (callback: () => 'dark' | 'light') =>
      lynxIpc.handle<'dark' | 'light'>(appChannels.getSystemDarkMode, callback),
    isDarkMode: (callback: () => boolean) => lynxIpc.handle<boolean>(appChannels.isDarkMode, callback),
    getSystemInfo: (callback: () => SystemInfo) => lynxIpc.handle<SystemInfo>(appChannels.getSystemInfo, callback),
    disableLoadingAnimations: (callback: () => boolean) =>
      lynxIpc.handle<boolean>(appChannels.disableLoadingAnimations, callback),
    checkGitInstalled: (callback: () => Promise<string>) =>
      lynxIpc.handle<string>(appChannels.checkGitInstalled, callback),
    checkPwsh7Installed: (callback: () => Promise<string>) =>
      lynxIpc.handle<string>(appChannels.checkPwsh7Installed, callback),

    getCurrentDataPath: (callback: () => string) => lynxIpc.handle<string>(appChannels.getCurrentDataPath, callback),
    selectAnotherDataPath: (callback: () => Promise<string>) =>
      lynxIpc.handle<string>(appChannels.selectAnotherDataPath, callback),
    isValidDataPath: (callback: (dir: string) => Promise<boolean>) =>
      lynxIpc.handle<boolean>(appChannels.isValidDataPath, callback),
  },
};
