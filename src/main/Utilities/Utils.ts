import {execSync} from 'node:child_process';
import path from 'node:path';

import {dialog, nativeTheme, OpenDialogReturnValue} from 'electron';
import fs from 'graceful-fs';

import {formatSize} from '../../cross/CrossUtils';
import {appManager} from '../index';
import calcFolderSize from './CalculateFolderSize/CalculateFolderSize';

/**
 * Opens a system file/folder dialog and returns the selected path.
 *
 * @param {'openDirectory' | 'openFile'} option - Select folder or file
 * @returns {string | undefined} The selected file/folder path, or undefined if cancelled.
 */
export async function openDialog(option: 'openDirectory' | 'openFile'): Promise<string | undefined> {
  try {
    const mainWindow = appManager.getMainWindow();
    const result: OpenDialogReturnValue = await (mainWindow
      ? dialog.showOpenDialog(mainWindow, {properties: [option]})
      : dialog.showOpenDialog({properties: [option]}));
    if (result.filePaths) return result.filePaths[0];
    return undefined;
  } catch (error) {
    console.log('util:openDialog -> No valid directory or file selected');
    throw error;
  }
}

/**
 * Check if a given path exists and is accessible.
 *
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} A promise that resolves with a boolean value
 * indicating whether the path exists and is accessible.
 */
export const checkPathExists = async (path: string): Promise<boolean> => {
  try {
    // Use the promises.access function to check if the path exists and is accessible
    await fs.promises.access(path, fs.constants.R_OK);
    return true;
  } catch (error: any) {
    // If the path doesn't exist or is not accessible, the error code will be 'ENOENT'
    if (error.code === 'ENOENT') {
      return false;
    }
    // If there's any other error, re-throw it
    throw error;
  }
};

/**
 * Calculates the total size of a folder and its contents recursively.
 *
 * @param {string} folderPath - The path of the folder to calculate the size for.
 * @returns {Promise<number>} A promise that resolves with the total size of the folder in bytes.
 */
export async function calculateFolderSize(folderPath: string): Promise<string> {
  try {
    const result = await calcFolderSize(folderPath);

    return result ? formatSize(result) : '0';
  } catch (error) {
    console.error('Error calculating folder size:', error);
    return '0';
  }
}

export async function getDirCreationDate(dir: string): Promise<string> {
  const dirPath = path.resolve(dir);

  try {
    const stats = await fs.promises.stat(dirPath);

    if (stats.isDirectory()) {
      return stats.birthtime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
    return '';
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Directory doesn't exist
      return '';
    }

    // Re-throw any other error
    throw error;
  }
}

/**
 * Gets the highest available PowerShell version on the system.
 * @returns The major version number of PowerShell, or 0 if PowerShell is not found.
 */
export function getPowerShellVersion(): number {
  const command = '$PSVersionTable.PSVersion.Major';

  try {
    // Try PowerShell Core (pwsh.exe) first
    const pwshVersion = parseInt(
      execSync(`pwsh.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    if (pwshVersion >= 7) return pwshVersion;

    // Fall back to Windows PowerShell (powershell.exe)
    const psVersion = parseInt(
      execSync(`powershell.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    return psVersion >= 5 ? psVersion : 0;
  } catch (err) {
    console.error('Error determining PowerShell version:', err);
    return 0;
  }
}

export function getSystemDarkMode() {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}