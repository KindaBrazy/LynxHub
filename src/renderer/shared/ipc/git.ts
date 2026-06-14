import {gitChannels} from '@lynx_common/consts/ipcChannels/git';
import type {RepositoryInfo} from '@lynx_common/types';
import type {CommitItem, ShallowCloneOptions} from '@lynx_common/types/git';
import type {GitProgressCallback} from '@lynx_common/types/ipc';

import lynxIpc from './lynxIpc';

const gitIpc = {
  // Performs shallow clone of Git repository (non-blocking)
  cloneShallow: (options: ShallowCloneOptions) => lynxIpc.send(gitChannels.shallowClone, options),

  // Performs shallow clone and returns promise
  cloneShallowPromise: (options: ShallowCloneOptions) => lynxIpc.invoke<void>(gitChannels.shallowClonePromise, options),

  // Gets repository information (branch, remote, etc.)
  getRepoInfo: (dir: string) => lynxIpc.invoke<RepositoryInfo>(gitChannels.getRepoInfo, dir),

  // Changes Git branch
  changeBranch: (dir: string, branchName: string) => lynxIpc.invoke<void>(gitChannels.changeBranch, dir, branchName),

  // Converts shallow clone to full clone
  unShallow: (dir: string) => lynxIpc.invoke<void>(gitChannels.unShallow, dir),

  // Performs hard reset to HEAD
  resetHard: (dir: string) => lynxIpc.invoke<string>(gitChannels.resetHard, dir),

  // Gets repository commit log
  getCommits: (dir: string, maxCount?: number) => lynxIpc.invoke<CommitItem[]>(gitChannels.getCommits, dir, maxCount),

  // Validates if directory is a valid Git repository matching the URL
  validateGitDir: (dir: string, url: string) => lynxIpc.invoke<boolean>(gitChannels.validateGitDir, dir, url),

  // Listens for Git operation progress updates
  onProgress: (callback: GitProgressCallback) => lynxIpc.on(gitChannels.onProgress, callback),

  // Pulls latest changes from remote repository
  pull: (repoDir: string, id: string) => lynxIpc.send(gitChannels.pull, repoDir, id),

  // Drops Git stash entries
  stashDrop: (dir: string) =>
    lynxIpc.invoke<{message: string; type: 'error' | 'success' | 'info'}>(gitChannels.stashDrop, dir),
};

export default gitIpc;
