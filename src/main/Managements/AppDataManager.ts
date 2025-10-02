import {platform} from 'node:os';
import {dirname, isAbsolute, join} from 'node:path';

import {app, BrowserWindow, dialog} from 'electron';
import fs from 'graceful-fs';
import {resolve} from 'path';

import {
  BINARIES_FOLDER_NAME,
  PLUGINS_FOLDER_NAME,
  REPOSITORIES_FOLDER_NAME,
  STATICS_FOLDER_NAME,
} from '../../cross/CrossConstants';
import {FolderNames} from '../../cross/CrossTypes';
import {appManager, storageManager} from '../index';
import {getExePath, getRelativePath, isPortable} from '../Utilities/Utils';
import {changeWindowState} from './Ipc/Methods/IpcMethods';

const DIRECTORIES = [PLUGINS_FOLDER_NAME, BINARIES_FOLDER_NAME, REPOSITORIES_FOLDER_NAME, STATICS_FOLDER_NAME] as const;

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
  if (isPortable() === 'linux') {
    changeWindowState('close');
  } else {
    appManager?.restart();
  }
}

/**
 * Prompts the user to select a new app data folder.
 * @returns A promise that resolves when a new folder is selected or rejects if cancelled
 */

export async function selectNewAppDataFolder(targetWindow?: BrowserWindow): Promise<string> {
  const window = targetWindow || appManager?.getMainWindow();
  if (!window) {
    throw new Error('Main window is not available. Please ensure the application is properly initialized.');
  }

  const result = await dialog.showOpenDialog(window, {
    properties: ['openDirectory'],
    title: 'Select Application Data Folder',
    buttonLabel: 'Select Folder',
  });

  if (result.canceled) {
    throw new Error('Folder selection was cancelled.');
  }

  if (!result.filePaths || result.filePaths.length === 0) {
    throw new Error('No folder was selected. Please try again.');
  }

  const targetPath = result.filePaths[0];

  try {
    fs.accessSync(targetPath, fs.constants.R_OK | fs.constants.W_OK);

    const newPath = getRelativePath(getExePath(), targetPath);
    setAppDataFolder(newPath);

    return 'Application data folder has been successfully updated.';
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        throw new Error('The selected folder does not exist or has been moved.');
      } else if (nodeError.code === 'EACCES') {
        throw new Error(
          `Permission denied. Try running as ${platform() === 'win32' ? 'administrator' : 'sudo'}` +
            ` or select another folder.`,
        );
      }
    }

    throw new Error(
      `Unable to access the selected folder: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function isAppDir(dir: string) {
  const appPath = resolve(dirname(app.getPath('exe')));
  const target = resolve(dir);
  console.log(appPath, target, target.startsWith(appPath));
  return target.startsWith(appPath);
}
