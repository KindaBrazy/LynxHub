import path from 'node:path';

import {SimpleGitProgressEvent} from 'simple-git';

import {gitChannels, utilsChannels} from '../../../../cross/IpcChannelAndTypes';
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
  const repoPath = path.resolve(repoDir);
  const extPath = extensionsDir ? path.resolve(extensionsDir) : undefined;

  const [installDate, lastUpdate, releaseTag] = await Promise.all([
    getDirCreationDate(repoPath),
    GitManager.getLastPulledDate(repoPath),
    GitManager.getCurrentReleaseTag(repoPath),
  ]);

  appManager.getWebContent()?.send(utilsChannels.onCardInfo, {
    data: {installDate, lastUpdate, releaseTag},
    id,
    type: 'repo',
  });

  const [extensionsSize, totalSize] = await Promise.all([
    extPath ? calculateFolderSize(extPath) : Promise.resolve(''),
    calculateFolderSize(repoPath),
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
export function cloneRepo(url: string, dir: string): void {
  gitManager = new GitManager(true);

  gitManager.clone(url, path.resolve(dir));

  setupGitManagerListeners(gitManager);
}

export function cloneShallow(
  url: string,
  directory: string,
  singleBranch: boolean,
  branch?: string,
  depth?: number,
): void {
  gitManager = new GitManager(true);

  gitManager.cloneShallow(url, directory, singleBranch, branch, depth);

  setupGitManagerListeners(gitManager);
}

/**
 * Clones a repository and resolve when completed and reject when got error.
 * @param url - The URL of the repository to clone.
 * @param dir - The directory type to clone into.
 */
export async function clonePromise(url: string, dir: string) {
  gitManager = new GitManager(true);
  return gitManager.clone(url, path.resolve(dir));
}

export async function getRepositoryInfo(dir: string) {
  gitManager = new GitManager(true);
  return gitManager.getRepositoryInfo(dir);
}

export async function changeBranch(dir: string, branchName: string) {
  gitManager = new GitManager(true);
  return gitManager.changeBranch(dir, branchName);
}

export async function unShallow(dir: string) {
  gitManager = new GitManager(true);
  return gitManager.unShallow(dir);
}

export async function resetHard(dir: string) {
  gitManager = new GitManager(true);
  return gitManager.resetHard(dir);
}

/**
 * Pulls the latest changes from a repository.
 * @param dir - The directory of the repository.
 * @param id - The unique identifier for the repository.
 */
export function pullRepo(dir: string, id: string): void {
  gitManager = new GitManager();

  gitManager.pull(path.resolve(dir));

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

export async function validateGitDir(dir: string, url: string): Promise<boolean> {
  const result = await GitManager.locateCard(url, dir);
  return !!result;
}
