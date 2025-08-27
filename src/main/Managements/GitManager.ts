// noinspection ExceptionCaughtLocallyJS

import path from 'node:path';

import {isEmpty} from 'lodash';
import {
  CheckRepoActions,
  GitResponseError,
  PullResult,
  RemoteWithRefs,
  SimpleGit,
  simpleGit,
  SimpleGitProgressEvent,
  StatusResult,
} from 'simple-git';

import {RepositoryInfo} from '../../cross/CrossTypes';
import {extractGitUrl, validateGitRepoUrl} from '../../cross/CrossUtils';
import {appManager} from '../index';
import {checkPathExists, openDialog} from '../Utilities/Utils';

/** Manages Git operations such as cloning, pulling, and status checking. */
export default class GitManager {
  private readonly showTaskbarProgress: boolean;
  private abortController: AbortController;
  private git: SimpleGit;

  public onProgress?: (progress: SimpleGitProgressEvent) => void;
  public onComplete?: (result?: PullResult) => void;
  public onError?: (reason: string) => void;

  constructor(showTaskbarProgress: boolean = false) {
    this.showTaskbarProgress = showTaskbarProgress;
    this.abortController = new AbortController();
    this.git = simpleGit({
      abort: this.abortController.signal,
      progress: this.handleProgressUpdate,
    });
  }

  /**
   * Locates a card based on the repository URL.
   * @param url - The URL of the repository.
   * @param dir - Optional directory instead of user choosing
   * @returns A promise that resolves to the path of the card or undefined.
   */
  public static async locateCard(url: string, dir?: string): Promise<string | undefined> {
    try {
      let resultPath: string | undefined;
      if (dir) {
        resultPath = dir;
      } else {
        resultPath = await openDialog({properties: ['openDirectory']});
      }

      if (!resultPath) return undefined;

      const remote = await this.remoteUrlFromDir(resultPath);

      if (!remote) return undefined;

      return validateGitRepoUrl(remote) === validateGitRepoUrl(url) ? resultPath : undefined;
    } catch (e) {
      console.error('Error locating card:', e);
      return undefined;
    }
  }

  public static async getDirBranch(dir: string) {
    const targetDir = path.resolve(dir);
    const git = simpleGit(targetDir);
    try {
      const branchSummary = await git.branchLocal();
      return branchSummary.current;
    } catch (error) {
      console.error('Error getting current branch:', error);
      return 'unknown';
    }
  }

  /**
   * Gets the date of the last pull for a repository.
   * @param repoDir - The directory of the local repository.
   * @returns A promise that resolves to the date string or an empty string if not found.
   */
  public static async getLastPulledDate(repoDir: string): Promise<string> {
    try {
      const status = await simpleGit(repoDir).log(['-1', '--format=%cd', '--date=format:%Y-%m-%d %H:%M:%S']);
      return status.latest?.hash ?? '';
    } catch (error) {
      console.error('Error getting last pulled date:', error);
      return '';
    }
  }

  /**
   * Gets the current release tag of a repository.
   * @param repoDir - The directory of the local repository.
   * @returns A promise that resolves to the tag or 'No tag found' if not available.
   */
  public static async getCurrentReleaseTag(repoDir: string): Promise<string> {
    try {
      const describeOutput = await simpleGit(repoDir).raw(['describe', '--tags', '--abbrev=0']);
      return describeOutput.trim() || 'No tag found';
    } catch (error) {
      console.error('Error getting current release tag:', error);
      return 'No tag found';
    }
  }

  /**
   * Checks if updates are available for a repository.
   * @param repoDir - The directory of the local repository.
   * @returns A promise that resolves to true if updates are available, false otherwise.
   */
  public static async isUpdateAvailable(repoDir: string | undefined): Promise<boolean> {
    if (!repoDir) return false;
    try {
      const status: StatusResult = await simpleGit(path.resolve(repoDir)).remote(['update']).status();
      return status.behind > 0;
    } catch (error) {
      console.error('Error checking for updates:', error, repoDir);
      return false;
    }
  }

  /**
   * Checks if a directory is a Git repository.
   * @param dir - The directory to check.
   * @returns A promise that resolves to true if the directory is a Git repository, false otherwise.
   */
  public static async isDirRepo(dir: string): Promise<boolean> {
    if (!(await checkPathExists(dir))) return false;
    try {
      return await simpleGit(dir).checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
    } catch (error) {
      console.error('Error checking if directory is a repo:', error);
      return false;
    }
  }

  /**
   * Formats a GitHub URL by removing the '.git' suffix if present.
   * @param url - The URL to format.
   * @returns The formatted URL or undefined if not a valid GitHub URL.
   */
  public static formatGitUrl(url: string): string | undefined {
    const githubRegex = /^https:\/\/github\.com\/.+$/;
    if (!githubRegex.test(url)) {
      console.log(`This url: ${url} isn't a GitHub Repository`);
      return undefined;
    }
    return url.endsWith('.git') ? url.slice(0, -4) : url;
  }

  /**
   * Gets the remote URL for a local repository directory.
   * @param dir - The directory of the local repository.
   * @returns A promise that resolves to the formatted remote URL or undefined.
   */
  public static async remoteUrlFromDir(dir: string): Promise<string | undefined> {
    const result: RemoteWithRefs[] = await simpleGit(dir).getRemotes(true);
    return GitManager.formatGitUrl(result[0]?.refs.fetch);
  }

  private handleProgressUpdate = (progress: SimpleGitProgressEvent): void => {
    if (this.abortController.signal.aborted) return;
    if (this.showTaskbarProgress) {
      appManager?.getMainWindow()?.setProgressBar(progress.progress / 100);
    }
    this.onProgress?.(progress);
  };

  private handleProgressComplete = (result?: PullResult): void => {
    if (this.showTaskbarProgress) {
      appManager?.getMainWindow()?.setProgressBar(-1);
    }
    if (this.abortController.signal.aborted) return;
    this.onComplete?.(result);
  };

  private onFailedProgress = (reason: string): void => {
    if (this.showTaskbarProgress) {
      appManager?.getMainWindow()?.setProgressBar(-1);
    }
    if (this.abortController.signal.aborted) return;
    this.onError?.(reason);
  };

  private handleError(error: any): void {
    if (error instanceof GitResponseError) {
      console.error(`Git Error: ${error.message}\n\tStack: ${error.stack}\n\tGit: ${error.git}`);
      this.onFailedProgress(error.message);
    } else {
      console.error(`Unknown Error: ${error}`);
      this.onFailedProgress(error.toString());
    }
  }

  /**
   * Clones a repository to the specified directory.
   */
  public async clone(url: string, directory: string): Promise<void> {
    const targetDirectory = path.resolve(directory);

    return new Promise((resolve, reject) => {
      this.git
        .clone(url, targetDirectory)
        .then(() => {
          this.handleProgressComplete();
          resolve();
        })
        .catch(error => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  public async cloneShallow(
    url: string,
    directory: string,
    singleBranch: boolean,
    depth?: number,
    branch?: string,
  ): Promise<void> {
    const targetDirectory = path.resolve(directory);

    const cloneOptions: string[] = [];

    if (depth) cloneOptions.push(`--depth=${depth}`);
    if (singleBranch) cloneOptions.push('--single-branch');
    if (branch) {
      cloneOptions.push('--branch');
      cloneOptions.push(branch);
    }

    return new Promise((resolve, reject) => {
      this.git
        .clone(url, targetDirectory, isEmpty(cloneOptions) ? undefined : cloneOptions)
        .then(() => {
          this.handleProgressComplete();
          resolve();
        })
        .catch(error => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  public async changeBranch(directory: string, branchName: string): Promise<void> {
    const targetDirectory = path.resolve(directory);

    const checkout = async () => {
      await this.git.checkout(branchName);
      await this.git.raw(['branch', '--set-upstream-to', `origin/${branchName}`, branchName]);
    };

    try {
      await this.git.cwd(targetDirectory);

      const branchSummary = await this.git.branchLocal();
      if (branchSummary.all.includes(branchName)) {
        await checkout();
        return;
      }

      try {
        await this.git.fetch(['origin', `${branchName}:${branchName}`]);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.message.includes('could not find remote ref')) {
          try {
            await this.git.fetch(['--all']);
            await checkout();

            return;
          } catch (e) {
            this.handleError(new Error(`Branch "${branchName}" not found in the remote repository.`));
            throw new Error(`Branch "${branchName}" not found in the remote repository.`);
          }
        } else {
          this.handleError(fetchError);
          throw fetchError;
        }
      }

      await checkout();
    } catch (error) {
      if (error instanceof Error) {
        this.handleError(error);
        throw error;
      } else {
        this.handleError(new Error('An unknown error occurred while changing branches.'));
        throw new Error('An unknown error occurred while changing branches.');
      }
    }
  }

  public async unShallow(directory: string): Promise<void> {
    const targetDirectory = path.resolve(directory);
    try {
      await this.git.cwd(targetDirectory);
      await this.git.fetch(['--unshallow']);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async stashAndDrop(dir: string): Promise<{message: string; type: 'error' | 'success' | 'info'}> {
    const targetDir = path.resolve(dir);
    await this.git.cwd(targetDir);

    return new Promise(resolve => {
      this.git
        .stash()
        .then(stashResult => {
          if (stashResult) {
            this.git
              .stash(['drop'])
              .then(() => {
                resolve({message: stashResult, type: 'success'});
              })
              .catch(dropError => {
                resolve({message: dropError.message, type: 'error'});
              });
          } else {
            resolve({message: 'No local changes to save.', type: 'info'});
          }
        })
        .catch(err => {
          resolve({message: err.message, type: 'error'});
        });
    });
  }

  public async resetHard(dir: string, commit: string = 'HEAD'): Promise<string> {
    const targetDirectory = path.resolve(dir);

    try {
      this.git.cwd(targetDirectory);

      // Perform the hard reset
      const resetResult = await this.git.reset(['--hard', commit]);
      console.log(`Hard reset successful in ${dir} to ${commit}. Output:\n${resetResult}`);
      return resetResult;
    } catch (error) {
      console.error(`Error performing hard reset in ${dir}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  public async getRepositoryInfo(directory: string): Promise<RepositoryInfo> {
    const targetDirectory = path.resolve(directory);
    try {
      await this.git.cwd(targetDirectory);

      const currentBranch = await this.getCurrentBranch();
      const remoteUrl = await this.getRemoteUrl();
      const isShallow = await this.isShallowRepository();
      const lastCommitHash = await this.getLastCommitHash();
      const lastCommitMessage = await this.getLastCommitMessage();
      const lastCommitTime = await this.getLastCommitDate();
      const availableBranches = await this.getAvailableBranches(remoteUrl);

      return {
        currentBranch,
        availableBranches,
        remoteUrl,
        isShallow,
        lastCommitHash,
        lastCommitMessage,
        lastCommitTime,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private async getLastCommitMessage(): Promise<string> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error(`Directory  is not a git repository.`);
      }

      const log = await this.git.log({maxCount: 1});

      if (log.latest === null) {
        return 'No commits found';
      }

      return log.latest.message;
    } catch (error) {
      console.error(`Error getting last commit message for:`, error);
      return `Error: ${(error as Error).message}`;
    }
  }

  async getLastCommitDate(): Promise<string> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error(`Directory is not a git repository.`);
      }

      const log = await this.git.log({maxCount: 1});

      if (log.latest === null) {
        return 'No commits found';
      }

      const lastCommitDate = new Date(log.latest.date);
      const now = new Date();
      const diffInMs = now.getTime() - lastCommitDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays > 7) {
        return lastCommitDate.toLocaleString();
      } else {
        return this.getElapsedTime(lastCommitDate);
      }
    } catch (error) {
      console.error(`Error getting last commit date for:`, error);
      return `Error: ${(error as Error).message}`;
    }
  }

  private getElapsedTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
  }

  private async getCurrentBranch(): Promise<string> {
    try {
      const branchSummary = await this.git.branchLocal();
      return branchSummary.current;
    } catch (error) {
      console.error('Error getting current branch:', error);
      return 'unknown';
    }
  }

  public async getAvailableBranches(url: string): Promise<string[]> {
    try {
      const {owner, repo} = extractGitUrl(url);
      const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
      if (!branchesResponse.ok) {
        console.error(`Failed to fetch branches: ${branchesResponse.status}`);
        return [];
      }
      const branchesData: {name: string}[] = await branchesResponse.json();

      return branchesData.map(b => b.name);
    } catch (err: any) {
      console.error(err.message || 'An error occurred while fetching data.');
      return [];
    }
  }

  private async isShallowRepository(): Promise<boolean> {
    try {
      return await this.git.revparse(['--is-shallow-repository']).then(output => output.trim() === 'true');
    } catch (error) {
      console.error('Error checking if shallow repository:', error);
      return false;
    }
  }

  private async getRemoteUrl(): Promise<string> {
    try {
      const remotes = await this.git.getRemotes(true);
      const originRemote = remotes.find(remote => remote.name === 'origin');
      return originRemote ? originRemote.refs.fetch : '';
    } catch (error) {
      console.error('Error getting remote URL:', error);
      return '';
    }
  }

  private async getLastCommitHash(): Promise<string> {
    try {
      const log = await this.git.log(['-1', '--pretty=%H']);
      return log.latest ? log.latest.hash : '';
    } catch (error) {
      console.error('Error getting last commit hash:', error);
      return '';
    }
  }

  public async getCurrentCommitHash(dir: string, short: boolean = true): Promise<string | undefined> {
    const targetDirectory = path.resolve(dir);

    try {
      await this.git.cwd(targetDirectory);

      const log = await this.git.log(['-1', '--pretty=%H']);
      if (log.latest) {
        return short ? log.latest.hash.substring(0, 7) : log.latest.hash;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting last commit hash:', error);
      return undefined;
    }
  }

  /**
   * Pulls the latest changes from the remote repository.
   * @param dir - The directory of the local repository.
   */
  public async pull(dir: string): Promise<void> {
    try {
      const result = await simpleGit(dir, {progress: this.handleProgressUpdate}).pull();
      this.handleProgressComplete(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Pulls the latest changes and returns whether updates were received.
   * @param dir - The directory of the local repository.
   * @returns A promise that resolves to true if updates were received false otherwise.
   */
  public async pullAsync(dir: string): Promise<boolean> {
    try {
      const result = await simpleGit(dir, {progress: this.handleProgressUpdate}).pull();
      const {changes, insertions, deletions} = result.summary;
      return changes > 0 || insertions > 0 || deletions > 0;
    } catch {
      return false;
    }
  }

  /** Aborts the current Git operation. */
  public abort(): void {
    this.abortController.abort();
  }
}
