import {exec} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {platform} from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';

import {isMac, isWin} from '@lynx_common/utils';
import {applicationIpc} from '@lynx_main/ipc/application';
import {getAppDirectory} from '@lynx_main/managers/dataFolder';

const execPromise = promisify(exec);

/**
 * Processes the output of the du command across different platforms.
 * @param stdout - The standard output from the du command execution.
 * @returns The folder size in bytes.
 * @throws {Error} If the operating system is not supported.
 */
function processDuOutput(stdout: string): number {
  if (isWin) {
    const stats = stdout.trim().split('\n')[1]?.split(',') ?? [];
    return Number(stats.at(-2)) || 0;
  }

  const match = /^(\d+)/.exec(stdout);
  if (!match) return 0;

  const bytes = Number(match[1]);
  return isMac ? bytes * 1024 : bytes;
}

/**
 * Calculates the size of a folder using system utilities (du or du64.exe).
 *
 * @param target - The absolute path to the target folder.
 * @returns A promise that resolves to the folder size in bytes. Returns 0 on error.
 */
export default async function calcFolderSize(target: string): Promise<number> {
  // Check if the target path exists and is a directory
  try {
    const stats = await stat(target);
    if (!stats.isDirectory()) {
      const message = `The provided path is not a directory: ${target}`;
      console.error(message);
      applicationIpc.send.showToast(message, 'danger');
      return 0;
    }
  } catch (err: any) {
    let message: string;
    if (err.code === 'ENOENT') {
      message = `The specified path does not exist: ${target}`;
      console.error(message);
      applicationIpc.send.showToast(message, 'danger');
    } else {
      message = `Error accessing the path: ${target}. Details: ${err.message}`;
      console.error(message);
      applicationIpc.send.showToast(message, 'danger');
    }
    return 0;
  }

  let command: string;
  const currentPlatform = platform();

  switch (currentPlatform) {
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
      const message = `Unsupported operating system: ${currentPlatform}`;
      console.error(message);
      applicationIpc.send.showToast(message, 'danger');
      return 0;
    }
  }

  try {
    const {stdout} = await execPromise(command, {cwd: target});
    return processDuOutput(stdout);
  } catch (err) {
    const message = `Failed to calculate folder size for '${target}'. Please check the folder and try again.`;
    console.error('Error calculating folder size:', err);
    applicationIpc.send.showToast(message, 'danger');
    return 0;
  }
}
