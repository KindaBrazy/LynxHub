import {exec} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {platform} from 'node:os';
import {promisify} from 'node:util';

import path from 'path';

import {appManager} from '../../index';
import {getAppDirectory} from '../../Managements/AppDataManager';

const execPromise = promisify(exec);

/**
 * Processes the output of the du command across different platforms.
 * @param stdout - The standard output from the du command execution.
 * @returns The folder size in bytes.
 * @throws {Error} If the operating system is not supported.
 */
function processDuOutput(stdout: string): number {
  if (platform() === 'win32') {
    const stats = stdout.trim().split('\n')[1]?.split(',') ?? [];
    return Number(stats.at(-2)) || 0;
  }

  const match = /^(\d+)/.exec(stdout);
  if (!match) return 0;

  const bytes = Number(match[1]);
  return platform() === 'darwin' ? bytes * 1024 : bytes;
}

/**
 * Calculates the size of a folder using the du64.exe utility.
 * @param target - The path to the target folder.
 * @returns A promise that resolves to the folder size in bytes.
 * @throws Will throw an error if the command execution fails.
 */
export default async function calcFolderSize(target: string): Promise<number> {
  // Check if the target path exists and is a directory
  try {
    const stats = await stat(target);
    if (!stats.isDirectory()) {
      const message = `The provided path is not a directory: ${target}`;
      console.error(message);
      appManager?.showToast(message, 'error');
      return 0;
    }
  } catch (err: any) {
    let message: string;
    if (err.code === 'ENOENT') {
      message = `The specified path does not exist: ${target}`;
      console.error(message);
      appManager?.showToast(message, 'error');
    } else {
      message = `Error accessing the path: ${target}. Details: ${err.message}`;
      console.error(message);
      appManager?.showToast(message, 'error');
    }
    return 0;
  }

  let command: string;
  switch (platform()) {
    case 'linux': {
      command = 'du -sb .';
      break;
    }
    case 'darwin': {
      command = 'du -sk .';
      break;
    }
    case 'win32': {
      const duPath = path.join(getAppDirectory('Binaries'), 'DiskUsage', 'du64.exe');
      command = `"${duPath}" -nobanner -accepteula -q -c .`;
      break;
    }
    default: {
      const message = `Unsupported operating system: ${platform()}`;
      console.error(message);
      appManager?.showToast(message, 'error');
      return 0;
    }
  }

  try {
    const {stdout} = await execPromise(command, {cwd: target});
    return processDuOutput(stdout);
  } catch (err) {
    const message = `Failed to calculate folder size for '${target}'. Please check the folder and try again.`;
    console.error('Error calculating folder size:', err);
    appManager?.showToast(message, 'error');
    return 0;
  }
}
