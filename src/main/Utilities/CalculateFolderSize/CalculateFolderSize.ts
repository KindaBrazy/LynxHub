import {exec} from 'node:child_process';
import {platform} from 'node:os';
import {promisify} from 'node:util';

import path from 'path';

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
      throw new Error(`Unsupported operating system: ${platform()}`);
    }
  }

  try {
    const {stdout} = await execPromise(command, {cwd: target});
    return processDuOutput(stdout);
  } catch (err) {
    console.error('Error calculating folder size:', err);
    throw err;
  }
}
