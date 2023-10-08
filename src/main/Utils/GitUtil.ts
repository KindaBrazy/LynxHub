import {simpleGit, SimpleGit, GitResponseError, SimpleGitProgressEvent, StatusResult, RemoteWithRefs} from 'simple-git';
import {MainLogError, MainLogInfo, MainLogWarning} from '../../AppState/AppConstants';

let gitProgress: SimpleGitProgressEvent;

// Track the progress of git operations
const trackProgress = ({method, stage, progress, total, processed}: SimpleGitProgressEvent): void => {
  gitProgress = {method, stage, progress, total, processed};
  console.log(MainLogInfo(`Git Progress --> Method: ${method}, Stage: ${stage}, Progress: ${progress}%, Total: ${total}, Processed: ${processed}`));
};

// Initialize git with progress tracking
const git: SimpleGit = simpleGit({progress: trackProgress});

// Get the progress of git operations
export function getProgress(): SimpleGitProgressEvent {
  return gitProgress;
}

// Log git errors to the console
function logGitError(error: unknown): void {
  if (error instanceof GitResponseError) {
    console.log(MainLogError(`Git Error Message: ${error.message}\n\tStack:${error.stack}\n\tGit:${error.git}`));
  } else {
    console.log(MainLogError(`Git Unknown Error: ${error}`));
  }
}

/**
 * Check if update is available for the repository
 * @param {string | undefined} repoPath - The path to repository for update check.
 * @returns {Promise<boolean>} True if update available, false if not.
 */
export async function isUpdateAvailable(repoPath: string | undefined): Promise<boolean> {
  try {
    const status: StatusResult = await simpleGit(repoPath).status();
    return status.behind > 0;
  } catch (error) {
    console.log(MainLogError(error));
    return false;
  }
}

/**
 * Clones a Git repository to a local directory.
 *
 * @param {string} repoUrl - The URL of the remote Git repository to clone.
 * @param {string} targetDir - The local directory path to clone the repository to.
 * @returns {Promise<void>} A promise that resolves when the clone is complete.
 */
export async function cloneRepository(repoUrl: string, targetDir: string): Promise<void> {
  try {
    await git.clone(repoUrl, targetDir);
  } catch (error) {
    logGitError(MainLogError(error));
    throw error;
  }
}

// Pulls latest changes from the remote git repository.
export async function pullChanges(): Promise<void> {
  try {
    await git.pull();
  } catch (err) {
    logGitError(err);
  }
}

/**
 * Validate and format GitHub URL
 * @param {string} url - The Git remote URL.
 * @returns {string | undefined} The Formatted (Without .git) GitHub URL if the URL is a GitHub repo, otherwise undefined.
 */
export function formatGitUrl(url: string): string | undefined {
  const githubRegex: RegExp = /^https:\/\/github\.com\/.+$/;
  if (githubRegex.test(url)) {
    if (url.endsWith('.git')) {
      return url.slice(0, -4);
    }
    return url;
  }
  console.log(MainLogWarning(`This url:${url}, isn't Github Repository`));
  return undefined;
}

/**
 * Gets the remote URL for a Git directory.
 * @param {string} dir - The directory path.
 * @returns {Promise<string | undefined>} The remote fetch URL, or undefined if no remote found.
 */
export async function getRemoteUrl(dir: string): Promise<string | undefined> {
  const result: RemoteWithRefs[] = await simpleGit(dir).getRemotes(true);
  console.log(MainLogInfo(formatGitUrl(result[0].refs.fetch)));
  return formatGitUrl(result[0].refs.fetch);
}
