import {platform} from 'node:os';
import path from 'node:path';

import decompress from 'decompress';
import {app, shell} from 'electron';
import {promises, readdir} from 'graceful-fs';

import {DiscordRPC, FolderListData} from '../../../../cross/CrossTypes';
import {ChangeWindowState, DarkModeTypes, TaskbarStatus, winChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager, discordRpcManager, storageManager, trayManager} from '../../../index';
import {getSystemDarkMode} from '../../../Utilities/Utils';

/**
 * Changes the state of the main window based on the provided action.
 * @param state - The desired window state change.
 */
export function changeWindowState(state: ChangeWindowState): void {
  const mainWindow = appManager?.getMainWindow();
  if (!mainWindow) return;

  const actions: Record<ChangeWindowState, () => void> = {
    maximize: () => (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()),
    minimize: () => mainWindow.minimize(),
    close: () => {
      storageManager.updateLastSize();
      mainWindow.close();
      if (platform() === 'darwin') trayManager?.destroyTrayIcon();
    },
    fullscreen: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
    restart: () => appManager?.restart(),
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
    appManager?.getWebContent()?.send(winChannels.onDarkMode, getSystemDarkMode());
    appManager?.getContextMenuWindow()?.webContents?.send(winChannels.onDarkMode, getSystemDarkMode());
  } else {
    appManager?.getContextMenuWindow()?.webContents?.send(winChannels.onDarkMode, darkMode);
  }
  storageManager.updateData('app', {darkMode});
}

/**
 * Sets the taskbar status for the application.
 * @param status - The desired taskbar status.
 */
export function setTaskbarStatus(status: TaskbarStatus): void {
  const mainWindow = appManager?.getMainWindow();
  if (!mainWindow) return;

  const actions: Record<TaskbarStatus, () => void> = {
    'taskbar-tray': () => {
      trayManager?.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
    },
    taskbar: () => {
      trayManager?.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
      }
    },
    tray: () => {
      trayManager?.createTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(true);
      } else if (platform() === 'darwin' && app.dock?.isVisible()) {
        app.dock?.hide();
      }
    },
    'tray-minimized': () => {
      trayManager?.destroyTrayIcon();
      if (platform() === 'win32') {
        mainWindow?.setSkipTaskbar(false);
      } else if (platform() === 'darwin' && !app.dock?.isVisible()) {
        app.dock?.show();
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
    return await promises.rm(resolvedPath, {recursive: true, force: true});
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
 * Checks if the specified directory is empty.
 * @param dir - The directory path to check.
 * @returns A promise that resolves to true if the directory is empty, false otherwise.
 */
export async function isEmptyDir(dir: string): Promise<boolean> {
  try {
    const files = await promises.readdir(dir);
    return files.length === 0;
  } catch (e) {
    return true;
  }
}

/**
 * Sets the Discord Rich Presence status.
 * @param discordRP - The Discord Rich Presence configuration.
 */
export function setDiscordRP(discordRP: DiscordRPC): void {
  storageManager.updateData('app', {discordRP});
  discordRpcManager?.updateDiscordRP();
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

export async function decompressFile(filePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const finalPath = path.join(app.getPath('downloads'), 'LynxHub', fileName);
      await decompress(filePath, finalPath);
      resolve(finalPath);
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

export async function checkFilesExist(dir: string, files: string[]) {
  try {
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        await promises.access(fullPath);
      } catch (error) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking files:', error);
    return false;
  }
}

export async function isResponseValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);

    return response.ok;
  } catch (e) {
    return false;
  }
}

export async function getImageAsDataURL(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`The fetched URL does not appear to be an image. Content-Type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const base64String = buffer.toString('base64');

    return `data:${contentType};base64,${base64String}`;
  } catch (error: any) {
    console.error(`Error processing image from ${imageUrl}:`, error.message);
    return null;
  }
}
