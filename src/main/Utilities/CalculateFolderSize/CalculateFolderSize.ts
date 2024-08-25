import {exec} from 'node:child_process';
import {promisify} from 'node:util';

import path from 'path';

import {getAppDirectory} from '../../Managements/AppDataManager';

const execPromise = promisify(exec);

/**
 * Processes the output of the du64.exe command.
 * @param stdout - The standard output from the command execution.
 * @returns The folder size in bytes.
 */
function processDuOutput(stdout: string): number {
  const stats = stdout.trim().split('\n')[1]?.split(',') ?? [];
  return Number(stats.at(-2)) || 0;
}

/**
 * Calculates the size of a folder using the du64.exe utility.
 * @param target - The path to the target folder.
 * @returns A promise that resolves to the folder size in bytes.
 * @throws Will throw an error if the command execution fails.
 */
export default async function calcFolderSize(target: string): Promise<number> {
  const duPath = path.join(getAppDirectory('Binaries'), 'DiskUsage', 'du64.exe');
  const command = `"${duPath}" -nobanner -accepteula -q -c .`;

  try {
    const {stdout} = await execPromise(command, {cwd: target});
    return processDuOutput(stdout);
  } catch (err) {
    console.error('Error calculating folder size:', err);
    throw err;
  }
}
