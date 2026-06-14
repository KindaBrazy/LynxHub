// Git repository IPC methods - Handles Git operations (clone, pull, branch changes, etc.)
import path from 'node:path';

import {CommitItem, ShallowCloneOptions} from '@lynx_common/types/git';
import GitManager from '@lynx_main/git';
import {setupGitManagerListeners} from '@lynx_main/git/gitListeners';

/**
 * Performs a shallow clone of a repository.
 * @param options - The shallow clone options.
 */
export function shallowClone(options: ShallowCloneOptions): void {
  const manager = new GitManager(true);
  manager.shallowClone(options);
  setupGitManagerListeners(manager);
}

/**
 * Performs a shallow clone and returns a promise that resolves when complete.
 * @param options - The shallow clone options.
 * @returns A promise that resolves when the clone is complete.
 */
export async function shallowClonePromise(options: ShallowCloneOptions): Promise<void> {
  return new GitManager(true).shallowClone(options);
}

/**
 * Retrieves information about a repository.
 * @param dir - The repository directory.
 * @returns A promise that resolves to the repository info.
 */
export async function getRepositoryInfo(dir: string) {
  return new GitManager(true).getRepositoryInfo(dir);
}

/**
 * Stashes local changes and then drops the stash.
 * @param dir - The repository directory.
 * @returns A promise resolving to the operation result.
 */
export async function stashDrop(dir: string): Promise<{message: string; type: 'error' | 'success' | 'info'}> {
  return new GitManager(true).stashAndDrop(dir);
}

/**
 * Changes the current branch of the repository.
 * @param dir - The repository directory.
 * @param branchName - The target branch name.
 */
export async function changeBranch(dir: string, branchName: string): Promise<void> {
  return new GitManager(true).changeBranch(dir, branchName);
}

/**
 * Converts a shallow clone to a full clone.
 * @param dir - The repository directory.
 */
export async function unShallow(dir: string): Promise<void> {
  return new GitManager(true).convertToFullClone(dir);
}

/**
 * Performs a hard reset on the repository.
 * @param dir - The repository directory.
 * @returns The output of the reset command.
 */
export async function resetHard(dir: string): Promise<string> {
  return new GitManager(true).resetHard(dir);
}

/**
 * Retrieves the commit history of the repository.
 * @param dir - The repository directory.
 * @param maxCount - The maximum number of commits to retrieve.
 */
export async function getCommits(dir: string, maxCount?: number): Promise<CommitItem[]> {
  return new GitManager(true).getCommits(dir, maxCount);
}

/**
 * Pulls the latest changes from a repository.
 * @param dir - The directory of the repository.
 * @param id - The unique identifier for the repository.
 */
export function pullRepo(dir: string, id: string): void {
  const manager = new GitManager();
  manager.pull(path.resolve(dir));
  setupGitManagerListeners(manager, id);
}

/**
 * Validates if a directory corresponds to a given Git repository URL.
 * @param dir - The directory to check.
 * @param url - The expected repository URL.
 * @returns True if valid, false otherwise.
 */
export async function validateGitDir(dir: string, url: string): Promise<boolean> {
  try {
    const result = await GitManager.locateCard(url, dir);
    return !!result;
  } catch (e) {
    console.error('Error validating git directory: ', e);
    return false;
  }
}
