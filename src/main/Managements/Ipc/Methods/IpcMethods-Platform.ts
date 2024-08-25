import os from 'node:os';

import {SystemInfo} from '../../../../cross/IpcChannelAndTypes';

/**
 * Parses the Windows build number from the release string.
 * @param releaseString - The Windows release string.
 * @returns The parsed build number.
 */
function parseWindowsBuildNumber(releaseString: string): number {
  const buildNumber = releaseString.split('.')[2];
  return parseInt(buildNumber, 10);
}

/**
 * Retrieves the system information including the OS platform and build number.
 * @returns An object containing the OS platform and build number.
 */
export function getSystemInfo(): SystemInfo {
  const platform = process.platform;
  let buildNumber: string | number = os.release();

  if (platform === 'win32') {
    buildNumber = parseWindowsBuildNumber(buildNumber);
  }

  return {os: platform, buildNumber};
}
