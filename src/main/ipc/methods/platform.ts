
// Platform IPC methods - Retrieves system information (OS platform and build number)
import os from 'node:os';

import {SystemInfo} from '@lynx_common/types/ipc';
import {isWin} from '@lynx_common/utils';

/**
 * Parses the Windows build number from the release string.
 * @param releaseString - The Windows release string (e.g., "10.0.19042").
 * @returns The parsed build number.
 */
function parseWindowsBuildNumber(releaseString: string): number {
  const parts = releaseString.split('.');
  return parts.length >= 3 ? parseInt(parts[2], 10) : 0;
}

/**
 * Retrieves the system information including the OS platform and build number.
 * @returns An object containing the OS platform and build number.
 */
export function getSystemInfo(): SystemInfo {
  const platform = process.platform;
  let buildNumber: string | number = os.release();

  if (isWin) {
    buildNumber = parseWindowsBuildNumber(buildNumber);
  }

  return {os: platform, buildNumber};
}
