import path from 'node:path';

import {ShallowCloneOptions} from '../../../../cross/GitTypes';
import {setupGitManagerListeners} from '../../Git/GitHelper';
import GitManager from '../../Git/GitManager';

let gitManager: GitManager | undefined;

export function shallowClone(options: ShallowCloneOptions): void {
  gitManager = new GitManager(true);

  gitManager.shallowClone(options);

  setupGitManagerListeners(gitManager);
}

export async function shallowClonePromise(options: ShallowCloneOptions) {
  return new GitManager(true).shallowClone(options);
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

export async function validateGitDir(dir: string, url: string): Promise<boolean> {
  try {
    const result = await GitManager.locateCard(url, dir);
    return !!result;
  } catch (e) {
    console.error('Error validating git directory: ', e);
    return false;
  }
}
