import * as https from 'node:https';
import os from 'node:os';
import path from 'node:path';

import decompress from 'decompress';
import {createWriteStream} from 'fs';
import fs from 'graceful-fs';
import {pipeline} from 'stream/promises';

import {getAppDirectory} from '../../Managements/AppDataManager';
import ShowToastWindow from '../../Managements/ToastWindowManager';

const DU_ZIP_URL = 'https://download.sysinternals.com/files/DU.zip';
const DU_BINARY_NAME = 'du64.exe';

/**
 * Downloads and extracts the DU.zip file.
 * @param savePath - The path where the extracted files should be saved.
 */
async function downloadAndExtractDuZip(savePath: string): Promise<void> {
  const tempFilePath = path.join(os.tmpdir(), 'du.zip');

  try {
    await new Promise<void>((resolve, reject) => {
      https
        .get(DU_ZIP_URL, async res => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download DU.zip: ${res.statusCode} ${res.statusMessage}`));
            return;
          }

          const fileStream = createWriteStream(tempFilePath);
          await pipeline(res, fileStream);
          resolve();
        })
        .on('error', reject);
    });

    await decompress(tempFilePath, savePath);
  } finally {
    await fs.promises.unlink(tempFilePath).catch(() => {}); // Clean up temp file
  }
}

/** Downloads the DU utility if it's not already installed. */
export default async function downloadDU(): Promise<void> {
  if (os.platform() !== 'win32') return;

  const duBinPath = path.join(getAppDirectory('Binaries'), 'DiskUsage', DU_BINARY_NAME);

  try {
    await fs.promises.access(duBinPath);
    console.log(`${DU_BINARY_NAME} found at ${duBinPath}`);
  } catch (error) {
    try {
      console.log(`${DU_BINARY_NAME} not found at ${duBinPath}. Downloading...`);
      const savePath = path.join(getAppDirectory('Binaries'), 'DiskUsage');
      await downloadAndExtractDuZip(savePath);
      console.log(`${DU_BINARY_NAME} has been downloaded and extracted to ${savePath}`);
    } catch (e) {
      ShowToastWindow({
        title: 'Download Failed',
        message:
          'Could not download du64, is needed for folder size calculation. ' +
          'Please check internet connection and restart app to try again.',
        type: 'warning',
        buttons: ['close', 'restart'],
      });
      console.error('Failed to download DU64: ', e);
    }
  }
}
