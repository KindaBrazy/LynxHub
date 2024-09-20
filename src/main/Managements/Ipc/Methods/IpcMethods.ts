import {platform} from 'node:os';
import path from 'node:path';

import {app, shell} from 'electron';
import fs, {readdir} from 'graceful-fs';

import {DiscordRPC, FolderListData} from '../../../../cross/CrossTypes';
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
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
    },
    taskbar: () => {
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
    },
    tray: () => {
      trayManager.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(true);
      } else if (platform() === 'darwin' && app.dock.isVisible()) {
        app.dock.hide();
      }
    },
    'tray-minimized': () => {
      trayManager.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock.isVisible()) {
        app.dock.show();
      }
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

export function listDirectory(path: string): Promise<FolderListData[]> {
  return new Promise((resolve, reject) => {
    readdir(path, {withFileTypes: true}, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const filesData: FolderListData[] = [];
      const foldersData: FolderListData[] = [];

      files.forEach(file => {
        if (file.isDirectory()) {
          foldersData.push({type: 'folder', name: file.name});
        } else {
          filesData.push({type: 'file', name: file.name});
        }
      });

      resolve([...foldersData, ...filesData]);
    });
  });
}

export async function getRelativeList(dirPath: string, relatives: string[]): Promise<FolderListData[]> {
  const resolvePath = path.resolve(dirPath, ...relatives);
  console.log('resolvePath', resolvePath);
  try {
    return await listDirectory(resolvePath);
  } catch (e) {
    try {
      relatives.pop();
      const newResolvePath = path.resolve(dirPath, ...relatives);
      return await listDirectory(newResolvePath);
    } catch (e) {
      console.error('Reading Dir', e);
      return [];
    }
  }
}
