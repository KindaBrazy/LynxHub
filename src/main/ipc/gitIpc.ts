import {gitChannels} from '@lynx_common/consts/ipcChannels/git';
import {RepositoryInfo} from '@lynx_common/types';
import {CommitItem, ShallowCloneOptions} from '@lynx_common/types/git';
import {GitProgressState, MainHT} from '@lynx_common/types/ipc';
import {PullResult, SimpleGitProgressEvent} from 'simple-git';

import lynxIpc from './ipcWrapper';
import {
  changeBranch,
  getCommits,
  getRepositoryInfo,
  pullRepo,
  resetHard,
  shallowClone,
  shallowClonePromise,
  stashDrop,
  unShallow,
  validateGitDir,
} from './methods/repository';
import {sendToMain} from './sender';

/**
 * Initializes listeners for Git operations.
 */
export default function listenGit() {
  // Pulls latest changes from remote repository
  gitIpc.on.pull((dir, id) => pullRepo(dir, id));

  // Performs shallow clone of Git repository (non-blocking)
  gitIpc.on.shallowClone(options => shallowClone(options));

  // Validates if directory is a valid Git repository matching the URL
  gitIpc.handle.validateGitDir((dir, url) => validateGitDir(dir, url));

  // Performs shallow clone and returns promise
  gitIpc.handle.shallowClonePromise(options => shallowClonePromise(options));

  // Drops Git stash entries
  gitIpc.handle.stashDrop(dir => stashDrop(dir));

  // Gets repository information (branch, remote, etc.)
  gitIpc.handle.getRepoInfo(dir => getRepositoryInfo(dir));

  // Changes Git branch
  gitIpc.handle.changeBranch((dir, branchName) => changeBranch(dir, branchName));

  // Converts shallow clone to full clone
  gitIpc.handle.unShallow(dir => unShallow(dir));

  // Performs hard reset to HEAD
  gitIpc.handle.resetHard(dir => resetHard(dir));

  // Gets repository commit log
  gitIpc.handle.getCommits((dir, maxCount) => getCommits(dir, maxCount));
}

/**
 * IPC interface for Git operations.
 */
export const gitIpc = {
  send: {
    /** Sends Git progress event */
    onProgress: (
      id: string | undefined,
      state: GitProgressState,
      progress: SimpleGitProgressEvent | PullResult | undefined | string | never,
    ) => sendToMain(gitChannels.onProgress, id, state, progress),
  },
  on: {
    /** Listens for pull request */
    pull: (callback: (dir: string, id: string) => void) => lynxIpc.on(gitChannels.pull, callback),
    /** Listens for shallow clone request */
    shallowClone: (callback: (options: ShallowCloneOptions) => void) => lynxIpc.on(gitChannels.shallowClone, callback),
  },
  handle: {
    /** Handles validate Git directory request */
    validateGitDir: (callback: (dir: string, url: string) => MainHT<boolean>) =>
      lynxIpc.handle(gitChannels.validateGitDir, callback),
    /** Handles shallow clone promise request */
    shallowClonePromise: (callback: (options: ShallowCloneOptions) => MainHT<void>) =>
      lynxIpc.handle(gitChannels.shallowClonePromise, callback),
    /** Handles stash drop request */
    stashDrop: (callback: (dir: string) => MainHT<{message: string; type: 'error' | 'success' | 'info'}>) =>
      lynxIpc.handle(gitChannels.stashDrop, callback),
    /** Handles get repository info request */
    getRepoInfo: (callback: (dir: string) => MainHT<RepositoryInfo>) =>
      lynxIpc.handle(gitChannels.getRepoInfo, callback),
    /** Handles change branch request */
    changeBranch: (callback: (dir: string, branchName: string) => MainHT<void>) =>
      lynxIpc.handle(gitChannels.changeBranch, callback),
    /** Handles unshallow request */
    unShallow: (callback: (dir: string) => MainHT<void>) => lynxIpc.handle(gitChannels.unShallow, callback),
    /** Handles reset hard request */
    resetHard: (callback: (dir: string) => MainHT<string>) => lynxIpc.handle(gitChannels.resetHard, callback),
    /** Handles get commits history request */
    getCommits: (callback: (dir: string, maxCount?: number) => MainHT<CommitItem[]>) =>
      lynxIpc.handle(gitChannels.getCommits, callback),
  },
};
