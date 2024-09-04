import {SimpleGitProgressEvent} from 'simple-git';

import {CloneDirTypes, gitChannels, utilsChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager} from '../../../index';
import {calculateFolderSize, getDirCreationDate} from '../../../Utilities/Utils';
import GitManager from '../../GitManager';

let gitManager: GitManager | undefined;

/**
 * Retrieves and sends repository information to the web content.
 * @param id - The unique identifier for the repository.
 * @param repoDir - The directory path of the repository.
 * @param extensionsDir - Optional directory path for extensions.
 */
export async function getRepoInfo(id: string, repoDir: string, extensionsDir?: string): Promise<void> {
  const [installDate, lastUpdate, releaseTag] = await Promise.all([
    getDirCreationDate(repoDir),
    GitManager.getLastPulledDate(repoDir),
    GitManager.getCurrentReleaseTag(repoDir),
  ]);

  appManager.getWebContent()?.send(utilsChannels.onCardInfo, {
    data: {installDate, lastUpdate, releaseTag},
    id,
    type: 'repo',
  });

  const [extensionsSize, totalSize] = await Promise.all([
    extensionsDir ? calculateFolderSize(extensionsDir) : Promise.resolve(''),
    calculateFolderSize(repoDir),
  ]);

  appManager.getWebContent()?.send(utilsChannels.onCardInfo, {
    data: {extensionsSize, totalSize},
    id,
    type: 'disk',
  });
}

/**
 * Clones a repository and sets up progress tracking.
 * @param url - The URL of the repository to clone.
 * @param dir - The directory type to clone into.
 */
export function cloneRepo(url: string, dir: CloneDirTypes): void {
  gitManager = new GitManager(true);

  gitManager.clone(url, dir);

  setupGitManagerListeners(gitManager);
}

/**
 * Clones a repository and resolve when completed and reject when got error.
 * @param url - The URL of the repository to clone.
 * @param dir - The directory type to clone into.
 */
export async function clonePromise(url: string, dir: CloneDirTypes) {
  gitManager = new GitManager(true);
  return gitManager.clone(url, dir);
}

/**
 * Pulls the latest changes from a repository.
 * @param dir - The directory of the repository.
 * @param id - The unique identifier for the repository.
 */
export function pullRepo(dir: string, id: string): void {
  gitManager = new GitManager();

  gitManager.pull(dir);

  setupGitManagerListeners(gitManager, id);
}

/**
 * Aborts the current git operation.
 */
export function abortGitOperation(): void {
  gitManager?.abort();
}

/**
 * Sets up listeners for GitManager instance.
 * @param manager - The GitManager instance.
 * @param id - Optional identifier for pull operations.
 */
function setupGitManagerListeners(manager: GitManager, id?: string): void {
  manager.onProgress = (progress: SimpleGitProgressEvent) => {
    appManager.getWebContent()?.send(gitChannels.onProgress, id, 'Progress', progress);
  };

  manager.onComplete = (result?: any) => {
    appManager.getWebContent()?.send(gitChannels.onProgress, id, 'Completed', result);
  };

  manager.onError = (reason: string) => {
    appManager.getWebContent()?.send(gitChannels.onProgress, id, 'Failed', reason);
  };
}
