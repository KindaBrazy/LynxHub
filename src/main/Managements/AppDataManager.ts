import {isAbsolute, join} from 'node:path';

import {dialog} from 'electron';
import fs from 'graceful-fs';

import {
  BINARIES_FOLDER_NAME,
  EXTENSIONS_FOLDER_NAME,
  MODULES_FOLDER_NAME,
  REPOSITORIES_FOLDER_NAME,
} from '../../cross/CrossConstants';
import {FolderNames} from '../../cross/CrossTypes';
import {appManager, storageManager} from '../index';
import {getExePath, getRelativePath} from '../Utilities/Utils';

const DIRECTORIES = [
  MODULES_FOLDER_NAME,
  EXTENSIONS_FOLDER_NAME,
  BINARIES_FOLDER_NAME,
  REPOSITORIES_FOLDER_NAME,
] as const;

/**
 * Creates application directories in the app data path.
 * @throws {Error} If directory creation fails
 */
export async function checkAppDirectories(): Promise<void> {
  const appDataPath = getAppDataPath();

  try {
    await Promise.all(DIRECTORIES.map(dir => fs.promises.mkdir(join(appDataPath, dir), {recursive: true})));
    console.log('Directories created successfully');
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
}

/**
 * Gets the full path for a specific app directory.
 * @param name - The name of the directory
 * @returns The full path to the specified directory
 */
export function getAppDirectory(name: FolderNames): string {
  return join(getAppDataPath(), name);
}

/** Retrieves the app data path from storage. */
export function getAppDataPath(): string {
  const dataDir = storageManager.getData('app').appDataDir;

  if (isAbsolute(dataDir)) return dataDir;

  return join(getExePath(), dataDir);
}

/**
 * Sets a new app data folder and restarts the app.
 * @param targetDir - The new destination folder
 */
function setAppDataFolder(targetDir: string): void {
  storageManager.updateData('app', {appDataDir: targetDir});
  appManager.restart();
}

/**
 * Prompts the user to select a new app data folder.
 * @returns A promise that resolves when a new folder is selected or rejects if cancelled
 */
export async function selectNewAppDataFolder(): Promise<string> {
  const window = appManager.getMainWindow();
  if (!window) {
    throw new Error('No main window available');
  }

  const result = await dialog.showOpenDialog(window, {properties: ['openDirectory']});

  if (result.canceled) {
    throw new Error('Folder selection cancelled');
  }

  if (result.filePaths && result.filePaths.length > 0) {
    const newPath = getRelativePath(getExePath(), result.filePaths[0]);
    setAppDataFolder(newPath);
    return 'New folder selected';
  } else {
    throw new Error('No folder path selected');
  }
}
