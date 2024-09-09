import {platform} from 'node:os';
import path from 'node:path';

import {shell} from 'electron';
import fs from 'graceful-fs';

import {DiscordRPC} from '../../../../cross/CrossTypes';
import {ChangeWindowState, DarkModeTypes, TaskbarStatus, winChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager, discordRpcManager, storageManager, trayManager} from '../../../index';
import {getSystemDarkMode} from '../../../Utilities/Utils';

/**
 * Changes the state of the main window based on the provided action.
 * @param state - The desired window state change.
 */
export function changeWindowState(state: ChangeWindowState): void {
  const mainWindow = appManager.getMainWindow();
  if (!mainWindow) return;

  const actions: Record<ChangeWindowState, () => void> = {
    maximize: () => (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()),
    minimize: () => mainWindow.minimize(),
    close: () => {
      mainWindow.close();
      if (platform() === 'darwin') trayManager.destroyTrayIcon();
    },
    fullscreen: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
    restart: () => appManager.restart(),
  };

  const action = actions[state];
  if (action) {
    action();
  } else {
    console.warn(`MainIpcFunctions:changeWindowState -> Invalid state argument: ${state}`);
  }
}

/**
 * Sets the dark mode for the application.
 * @param darkMode - The dark mode setting to apply.
 */
export function setDarkMode(darkMode: DarkModeTypes): void {
  if (darkMode === 'system') {
    appManager.getWebContent()?.send(winChannels.onDarkMode, getSystemDarkMode());
  }
  storageManager.updateData('app', {darkMode});
}

/**
 * Sets the taskbar status for the application.
 * @param status - The desired taskbar status.
 */
export function setTaskbarStatus(status: TaskbarStatus): void {
  const mainWindow = appManager.getMainWindow();
  if (!mainWindow) return;

  const actions: Record<TaskbarStatus, () => void> = {
    'taskbar-tray': () => {
      trayManager.createTrayIcon();
      mainWindow.setSkipTaskbar(false);
    },
    taskbar: () => {
      trayManager.destroyTrayIcon();
      mainWindow.setSkipTaskbar(false);
    },
    tray: () => {
      trayManager.createTrayIcon();
      mainWindow.setSkipTaskbar(true);
    },
    'tray-minimized': () => {
      trayManager.destroyTrayIcon();
      mainWindow.setSkipTaskbar(false);
    },
  };

  const action = actions[status];
  if (action) {
    action();
    storageManager.updateData('app', {taskbarStatus: status});
  } else {
    console.warn(`Invalid taskbar status: ${status}`);
  }
}

/**
 * Removes a directory and its contents.
 * @param dir - The directory path to remove.
 */
export async function removeDir(dir: string): Promise<void> {
  try {
    const resolvedPath = path.resolve(dir);
    console.log(`Removing directory: ${resolvedPath}`);
    return await fs.promises.rm(resolvedPath, {recursive: true, force: true});
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * Moves a directory to the trash.
 * @param dir - The directory path to trash.
 */
export async function trashDir(dir: string): Promise<void> {
  try {
    const resolvedPath = path.resolve(dir);
    console.log(`Moving directory to trash: ${resolvedPath}`);
    return await shell.trashItem(resolvedPath);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * Sets the Discord Rich Presence status.
 * @param discordRP - The Discord Rich Presence configuration.
 */
export function setDiscordRP(discordRP: DiscordRPC): void {
  storageManager.updateData('app', {discordRP});
  discordRpcManager.updateDiscordRP();
}
