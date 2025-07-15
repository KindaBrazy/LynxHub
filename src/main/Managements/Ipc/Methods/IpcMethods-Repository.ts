import path from 'node:path';

import {SimpleGitProgressEvent} from 'simple-git';

import {gitChannels} from '../../../../cross/IpcChannelAndTypes';
import {appManager} from '../../../index';
import GitManager from '../../GitManager';

let gitManager: GitManager | undefined;

export function cloneShallow(
  url: string,
  directory: string,
  singleBranch: boolean,
  depth?: number,
  branch?: string,
): void {
  gitManager = new GitManager(true);

  gitManager.cloneShallow(url, directory, singleBranch, depth, branch);

  setupGitManagerListeners(gitManager);
}

export async function cloneShallowPromise(
  url: string,
  directory: string,
  singleBranch: boolean,
  depth?: number,
  branch?: string,
) {
  return new GitManager(true).cloneShallow(url, directory, singleBranch, depth, branch);
}

export async function getRepositoryInfo(dir: string) {
  return new GitManager(true).getRepositoryInfo(dir);
}

export async function stashDrop(dir: string): Promise<{message: string; type: 'error' | 'success' | 'info'}> {
  return new GitManager(true).stashAndDrop(dir);
}

export async function changeBranch(dir: string, branchName: string) {
  return new GitManager(true).changeBranch(dir, branchName);
}

export async function unShallow(dir: string) {
  return new GitManager(true).unShallow(dir);
}

export async function resetHard(dir: string) {
  return new GitManager(true).resetHard(dir);
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
 * Sets up listeners for GitManager instance.
 * @param manager - The GitManager instance.
 * @param id - Optional identifier for pull operations.
 */
function setupGitManagerListeners(manager: GitManager, id?: string): void {
  manager.onProgress = (progress: SimpleGitProgressEvent) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Progress', progress);
  };

  manager.onComplete = (result?: any) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Completed', result);
  };

  manager.onError = (reason: string) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Failed', reason);
  };
}

export async function validateGitDir(dir: string, url: string): Promise<boolean> {
  try {
    const result = await GitManager.locateCard(url, dir);
    return !!result;
  } catch (e) {
    console.error('Error validating git directory: ', e);
    return false;
  }
}
