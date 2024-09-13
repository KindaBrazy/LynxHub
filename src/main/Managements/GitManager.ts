import path from 'node:path';

import {
  GitResponseError,
  PullResult,
  RemoteWithRefs,
  SimpleGit,
  simpleGit,
  SimpleGitProgressEvent,
  StatusResult,
} from 'simple-git';

import {extractGitHubUrl, validateGitRepoUrl} from '../../cross/CrossUtils';
import {CloneDirTypes} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';
import {checkPathExists, openDialog} from '../Utilities/Utils';
import ModuleManager from './ModuleManager';

/** Manages Git operations such as cloning, pulling, and status checking. */
export default class GitManager {
  //#region Private Properties

  private readonly showTaskbarProgress: boolean;
  private abortController: AbortController;
  private git: SimpleGit;
  //#endregion

  //#region Callbacks

  public onProgress?: (progress: SimpleGitProgressEvent) => void;
  public onComplete?: (result?: PullResult) => void;
  public onError?: (reason: string) => void;
  //#endregion

  //#region Constructor

  constructor(showTaskbarProgress: boolean = false) {
    this.showTaskbarProgress = showTaskbarProgress;
    this.abortController = new AbortController();
    this.git = simpleGit({
      abort: this.abortController.signal,
      progress: this.handleProgressUpdate,
    });
  }

  //#endregion

  //#region Static Methods

  /**
   * Locates a card based on the repository URL.
   * @param url - The URL of the repository.
   * @returns A promise that resolves to the path of the card or undefined.
   */
  public static async locateCard(url: string): Promise<string | undefined> {
    const path = await openDialog('openDirectory');
    if (!path) return undefined;

    const remote = await this.remoteUrlFromDir(path);

    if (!remote) return undefined;

    return validateGitRepoUrl(remote) === url ? path : undefined;
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
  public static async isUpdateAvailable(repoDir: string): Promise<boolean> {
    try {
      const status: StatusResult = await simpleGit(path.resolve(repoDir)).remote(['update']).status();
      return status.behind > 0;
    } catch (error) {
      console.error('Error checking for updates:', error);
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
      // @ts-ignore
      return await simpleGit(dir).checkIsRepo('root');
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

  //#endregion

  //#region Private Methods

  private handleProgressUpdate = (progress: SimpleGitProgressEvent): void => {
    if (this.abortController.signal.aborted) return;
    if (this.showTaskbarProgress) {
      appManager.getMainWindow()?.setProgressBar(progress.progress / 100);
    }
    this.onProgress?.(progress);
  };

  private handleProgressComplete = (result?: PullResult): void => {
    if (this.showTaskbarProgress) {
      appManager.getMainWindow()?.setProgressBar(-1);
    }
    if (this.abortController.signal.aborted) return;
    this.onComplete?.(result);
  };

  private onFailedProgress = (reason: string): void => {
    if (this.showTaskbarProgress) {
      appManager.getMainWindow()?.setProgressBar(-1);
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

  //#endregion

  //#region Public Methods

  /**
   * Clones a repository to the specified directory.
   * @param url - The URL of the repository to clone.
   * @param directory - The directory to clone into.
   */
  public async clone(url: string, directory: CloneDirTypes): Promise<void> {
    return new Promise((resolve, reject) => {
      const resultDir =
        directory === 'moduleDir' ? path.join(ModuleManager.getModulesPath(), extractGitHubUrl(url).repo) : directory;

      try {
        this.git.clone(url, resultDir.toString()).then(() => {
          this.handleProgressComplete();
          resolve();
        });
      } catch (error) {
        this.handleError(error);
        reject(error);
      }
    });
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

  //#endregion
}
