import {execSync, spawn} from 'node:child_process';
import {platform} from 'node:os';
import {dirname, isAbsolute, relative, resolve} from 'node:path';

import {AgentTypes, DarkModeTypes} from '@lynx_common/types/ipc';
import {formatSize} from '@lynx_common/utils';
import {applicationIpc} from '@lynx_main/ipc/application';
import classHolder from '@lynx_main/managers/classHolder';
import {app, BrowserWindow, dialog, nativeTheme, OpenDialogOptions, OpenDialogReturnValue, safeStorage} from 'electron';
import fs from 'graceful-fs';

import calcFolderSize from './calcFolderSize';

/**
 * Opens a system file/folder dialog and returns the selected path.
 *
 * @param {'openDirectory' | 'openFile'} options - Select folder or file
 * @returns {string | undefined} The selected file/folder path, or undefined if cancelled.
 */
export async function openDialog(options: OpenDialogOptions): Promise<string | undefined> {
  const {appManager} = classHolder;
  try {
    const mainWindow = appManager?.getMainWindow();
    const result: OpenDialogReturnValue = await (mainWindow
      ? dialog.showOpenDialog(mainWindow, options)
      : dialog.showOpenDialog(options));
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
  const dirPath = resolve(dir);

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
  } catch {
    // pwsh.exe not available, try Windows PowerShell
  }

  try {
    // Fall back to Windows PowerShell (powershell.exe)
    const psVersion = parseInt(
      execSync(`powershell.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    return psVersion >= 5 ? psVersion : -1;
  } catch {
    // Neither PowerShell is available
    return -1;
  }
}

/**
 * Determines the appropriate shell based on the operating system and PowerShell version.
 * @returns The shell command to use.
 */
export function determineShell(): string {
  switch (platform()) {
    case 'darwin':
      return 'zsh';
    case 'linux':
      return 'bash';
    case 'win32':
    default: {
      const psVersion = getPowerShellVersion();
      if (psVersion >= 7) return 'pwsh.exe';
      if (psVersion >= 5) return 'powershell.exe';
      // Fallback to cmd.exe if PowerShell is not available
      return 'cmd.exe';
    }
  }
}

export function getSystemDarkMode() {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}

export function isDark(): boolean {
  const {storageManager} = classHolder;
  const darkMode = storageManager.getData('app').darkMode;
  switch (darkMode) {
    case 'dark':
      return true;
    case 'light':
      return false;
    case 'system':
      return getSystemDarkMode() == 'dark';
  }
}

export function getWebContentsIfAvailable(window: BrowserWindow | undefined) {
  if (window && !window.isDestroyed() && !window.webContents.isDestroyed()) return window.webContents;

  return undefined;
}

export function noticeAllWindowsDarkMode(darkMode: DarkModeTypes) {
  const value = darkMode === 'system' ? getSystemDarkMode() : darkMode;
  const isDark = value === 'dark';

  applicationIpc.send.onDarkMode(isDark);
}

function getWindowBgColor(isDark: boolean) {
  return isDark ? '#212121' : '#ffffff';
}

export function getWindowColor(preferred?: 'dark' | 'light') {
  if (preferred) return getWindowBgColor(preferred === 'dark');

  return getWindowBgColor(isDark());
}

export function isPortable(): 'win' | 'linux' | null {
  if (process.env.PORTABLE_EXECUTABLE_FILE) return 'win';
  if (process.env.APPIMAGE) return 'linux';
  return null;
}

export function getExePath(): string {
  try {
    const winPortablePath = process.env.PORTABLE_EXECUTABLE_FILE && dirname(process.env.PORTABLE_EXECUTABLE_FILE);
    const linuxPortablePath = process.env.APPIMAGE && dirname(process.env.APPIMAGE);

    if (winPortablePath) return winPortablePath;
    if (linuxPortablePath) return linuxPortablePath;

    return app.getAppPath();
  } catch (e) {
    console.error(e);
    return '';
  }
}

export function getRelativePath(basePath: string, targetPath: string): string {
  try {
    if (!isAbsolute(targetPath)) {
      return targetPath;
    }
    return relative(basePath, targetPath);
  } catch (error) {
    console.error('Error calculating relative path:', error);
    return resolve(targetPath);
  }
}

export function getAbsolutePath(basePath: string, targetPath: string): string {
  try {
    if (isAbsolute(targetPath)) {
      return targetPath;
    }
    return resolve(basePath, targetPath);
  } catch (error) {
    console.error('Error calculating absolute path:', error);
    return targetPath;
  }
}

export function RelaunchApp(saveLastSize: boolean = true) {
  const {storageManager} = classHolder;
  if (saveLastSize) storageManager.updateLastSize();
  app.relaunch({execPath: process.env.PORTABLE_EXECUTABLE_FILE || process.env.APPIMAGE});
  app.quit();
}

/**
 * User agent configuration and templates
 */
const USER_AGENT_CONFIG = {
  osMap: {
    darwin: '(Macintosh; Intel Mac OS X 10_15_7)',
    linux: '(X11; Linux x86_64)',
    win32: '(Windows NT 10.0; Win64; x64)',
  },
  getVersionStrings: () => ({
    lynxHub: `LynxHub/${app.getVersion()}`,
    electron: `Electron/${process.versions.electron}`,
    chrome: `Chrome/${process.versions.chrome}`,
  }),
};

/**
 * Builds a user agent string based on the specified type
 */
export function getUserAgent(type?: AgentTypes) {
  const targetType: AgentTypes = type || classHolder.storageManager.getData('browser').userAgent || 'lynxhub';

  const osString = USER_AGENT_CONFIG.osMap[platform()] || USER_AGENT_CONFIG.osMap.win32;
  const baseUA = `Mozilla/5.0 ${osString} AppleWebKit/537.36 (KHTML, like Gecko)`;
  const versions = USER_AGENT_CONFIG.getVersionStrings();

  const templates: Record<AgentTypes, () => string> = {
    lynxhub: () => `${baseUA} ${versions.lynxHub} ${versions.chrome} ${versions.electron} Safari/537.36`,
    electron: () => `${baseUA} ${versions.chrome} ${versions.electron} Safari/537.36`,
    chrome: () => `${baseUA} ${versions.chrome} Safari/537.36`,
    custom: () => classHolder.storageManager.getData('browser').customUserAgent,
  };

  return templates[targetType]?.() || templates.lynxhub();
}

/**
 * Generic encryption/decryption handler for safeStorage operations
 */
function handleSafeStorageOperation<T extends string | string[]>(
  data: T,
  operation: 'encrypt' | 'decrypt',
  operationName: string,
): T {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn(`safeStorage ${operationName} not available. Data will not be ${operation}ed.`);
    return data;
  }

  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];

  try {
    const processed = items.map(item => {
      if (operation === 'encrypt') {
        return safeStorage.encryptString(item).toString('hex');
      } else {
        return safeStorage.decryptString(Buffer.from(item, 'hex'));
      }
    });

    return (isArray ? processed : processed[0]) as T;
  } catch (e) {
    console.error(`Failed to ${operation} data:`, e);
    return data;
  }
}

/**
 * Helper function to encrypt a string using Electron's safeStorage.
 * Returns the encrypted data as a hexadecimal string.
 * Provides a warning if encryption is not available.
 */
export function encryptString(data: string): string {
  return handleSafeStorageOperation(data, 'encrypt', 'encryption');
}

export function encryptStrings(data: string[]): string[] {
  return handleSafeStorageOperation(data, 'encrypt', 'encryption');
}

/**
 * Helper function to decrypt a string using Electron's safeStorage.
 * Expects the input to be a hexadecimal string.
 * Provides a warning and returns the original string if decryption fails or isn't available.
 */
export function decryptString(encryptedData: string): string {
  return handleSafeStorageOperation(encryptedData, 'decrypt', 'decryption');
}

export function decryptStrings(encryptedData: string[]): string[] {
  return handleSafeStorageOperation(encryptedData, 'decrypt', 'decryption');
}

export const getPrivilegeText = () => {
  const platform = process.platform;
  if (platform === 'win32') {
    return 'administrator';
  } else if (platform === 'darwin' || platform === 'linux') {
    return 'sudo';
  }
  return 'elevated privileges';
};

export async function isGitInstalled(): Promise<string> {
  return new Promise((resolve, reject) => {
    const commandProcess = spawn('git', ['--version']);

    let stdoutData = '';

    commandProcess.on('error', err => {
      console.error('Failed to start git process. Is Git installed and in your PATH?', err);

      reject('Git is not installed or could not be found in the system PATH.');
    });

    commandProcess.stdout.on('data', data => {
      stdoutData += data.toString();
    });

    commandProcess.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    commandProcess.on('close', code => {
      if (code !== 0) {
        console.error(`git process exited with error code ${code}`);
        reject(`Git process exited with error code: ${code}`);
        return;
      }

      if (stdoutData) {
        const versionString = stdoutData.trim();
        const versionParts = versionString.split(' ');

        if (versionParts.length >= 3) {
          resolve(versionParts[2]);
        } else {
          resolve(versionString);
        }
      } else {
        reject('Git command ran successfully but produced no output.');
      }
    });
  });
}

export async function isPowerShell7Installed(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Flag to ensure the promise is only settled once.
    let isSettled = false;

    // Use 'pwsh' to specifically target PowerShell 7+
    const commandProcess = spawn('pwsh', ['--version']);

    commandProcess.stdout.on('data', data => {
      if (isSettled) return;

      const output = data.toString().trim();
      // Expected output is something like "PowerShell 7.4.1"
      const versionParts = output.split(' ');
      if (versionParts.length >= 2 && versionParts[0] === 'PowerShell') {
        const version = versionParts[1];
        // Ensure it's version 7 or higher
        if (version.startsWith('7.')) {
          isSettled = true;
          resolve(`V${version}`);
        } else {
          isSettled = true;
          // It's a version of pwsh, but not 7. Reject with a clear message.
          reject(new Error(`Found PowerShell version ${version}, but version 7 is required.`));
        }
      }
      // If output is unexpected, we'll let the 'close' event handle the rejection.
    });

    // This 'error' event fires if the 'pwsh' command cannot be started.
    commandProcess.on('error', err => {
      if (isSettled) return;
      isSettled = true;

      console.error('Failed to start pwsh. Is PowerShell 7 installed and in PATH?', err.message);
      // Reject with a clear error message.
      reject(new Error('PowerShell 7 (pwsh) was not found in your system PATH.'));
    });

    commandProcess.stderr.on('data', data => {
      // Log stderr for debugging, but don't reject here. Let the 'close' event handle it
      // based on the exit code, as some programs write warnings to stderr on success.
      console.error('stderr from pwsh check:', data.toString());
    });

    // The 'close' event fires when the process has exited.
    commandProcess.on('close', code => {
      if (isSettled) return;
      isSettled = true;

      // If we reach this point, it means stdout did not resolve the promise.
      // This is considered a failure. The exit code gives a hint as to why.
      console.log(`pwsh process exited with code ${code}.`);
      reject(new Error(`The PowerShell 7 check failed. The 'pwsh' command exited without providing a valid version.`));
    });
  });
}
