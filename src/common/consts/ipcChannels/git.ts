/**
 * IPC channels for Git operations.
 * Handles cloning, pulling, branch management, and repository info.
 */
export const gitChannels = {
  shallowClone: 'git:clone-shallow',
  shallowClonePromise: 'git:clone-shallow-promise',

  stashDrop: 'git:stash-drop',

  validateGitDir: 'git:validateGitDir',

  getRepoInfo: 'git:get-repo-info',
  changeBranch: 'git:changeBranch',
  unShallow: 'git:unShallow',
  resetHard: 'git:resetHard',
  getCommits: 'git:get-commits',

  pull: 'git:pull',

  onProgress: 'git:on-progress',
} as const;
