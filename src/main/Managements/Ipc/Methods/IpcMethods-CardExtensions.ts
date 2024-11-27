import path from 'node:path';

import fs from 'graceful-fs';

import {ExtensionsData, ExtensionsUpdateStatus, utilsChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager} from '../../../index';
import {calculateFolderSize} from '../../../Utilities/Utils';
import GitManager from '../../GitManager';

let loadingExtensions = false;

export function disableLoadingExtensions(): void {
  loadingExtensions = false;
}

/**
 * Retrieves repository folders from a given directory.
 * @param dir - The directory to search for repositories.
 * @returns A promise that resolves to an array of repository folder names.
 */
async function getRepoFolders(dir: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(dir, {withFileTypes: true});
    const folders = files.filter(file => file.isDirectory()).map(file => file.name);

    if (folders.length === 0) return [];

    const repoFolders = await Promise.all(
      folders.map(async folder => {
        const isRepo = await GitManager.isDirRepo(path.join(dir, folder));
        return isRepo ? folder : null;
      }),
    );

    return repoFolders.filter(Boolean) as string[];
  } catch (error) {
    console.error(`Error retrieving repository folders from ${dir}:`, error);
    return [];
  }
}

/**
 * Retrieves update status for extensions in a given directory.
 * @param dir - The directory containing the extensions.
 * @returns A promise that resolves to an array of extension update statuses.
 */
export async function getExtensionsUpdate(dir: string): Promise<ExtensionsUpdateStatus> {
  try {
    const filteredFolders = await getRepoFolders(path.resolve(dir));
    if (filteredFolders.length === 0) return [];

    loadingExtensions = true;

    const updateData = await Promise.all(
      filteredFolders.map(async extension => {
        if (!loadingExtensions) return null;
        const extensionDir = path.join(dir, extension);
        const updateAvailable = await GitManager.isUpdateAvailable(extensionDir);
        return {id: extension, updateAvailable};
      }),
    );

    return loadingExtensions ? (updateData.filter(Boolean) as ExtensionsUpdateStatus) : [];
  } catch (error) {
    console.error(`Error retrieving extension updates from ${dir}:`, error);
    return [];
  }
}

/**
 * Retrieves detailed information about extensions in a given directory.
 * @param dir - The directory containing the extensions.
 * @returns A promise that resolves to an array of extension details or 'empty' if no extensions are found.
 */
export async function getExtensionsDetails(dir: string): Promise<ExtensionsData | 'empty'> {
  try {
    const filteredFolders = await getRepoFolders(path.resolve(dir));
    if (filteredFolders.length === 0) return 'empty';

    loadingExtensions = true;

    const extensionsData = await Promise.all(
      filteredFolders.map(async extension => {
        if (!loadingExtensions) return null;
        const extensionDir = path.join(dir, extension);
        const [remoteUrl, size] = await Promise.all([
          GitManager.remoteUrlFromDir(extensionDir).catch(() => ''),
          calculateFolderSize(extensionDir),
        ]);
        return {name: extension, remoteUrl, size};
      }),
    );

    return loadingExtensions ? (extensionsData.filter(Boolean) as ExtensionsData) : 'empty';
  } catch (error) {
    console.error(`Error retrieving extension details from ${dir}:`, error);
    return 'empty';
  }
}

async function getRepoDirectories(dir: string) {
  const folders = await getRepoFolders(dir);
  return folders.map(folder => path.join(dir, folder));
}

export async function updateAllExtensions(data: {id: string; dir: string}) {
  const directories = await getRepoDirectories(path.resolve(data.dir));

  if (directories) {
    const extensionsCount: number = directories.length;
    let currentState: number = 1;
    for (const dir of directories) {
      const gitManager = new GitManager(false);

      appManager.getWebContent()?.send(utilsChannels.onUpdateAllExtensions, {
        id: data.id,
        step: `${currentState}/${extensionsCount}`,
      });

      await gitManager.pullAsync(dir);

      currentState++;
    }
  }

  appManager.getWebContent()?.send(utilsChannels.onUpdateAllExtensions, {
    id: data.id,
    step: 'done',
  });
}
