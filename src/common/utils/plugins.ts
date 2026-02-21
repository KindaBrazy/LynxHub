import {PluginVersions} from '../types/plugins';
import {extractGitUrl} from './urlUtils';

/**
 * Determines the update type (upgrade or downgrade) based on commit history.
 *
 * @param {PluginVersions} versions - List of plugin versions.
 * @param {string} currentCommit - The current commit hash.
 * @param {string} targetCommit - The target commit hash.
 * @returns {'upgrade' | 'downgrade' | undefined} The update type, or undefined if target commit not found.
 */
export function getUpdateType(
  versions: PluginVersions,
  currentCommit: string,
  targetCommit: string,
): 'downgrade' | 'upgrade' | undefined {
  const currentCommitIndex = versions.findIndex(v => v.commit === currentCommit);
  const targetCommitIndex = versions.findIndex(v => v.commit === targetCommit);

  // If one of the commits isn't found, we treat it as an upgrade for safety,
  // unless we can't find the target, in which case we return undefined.
  if (targetCommitIndex === -1) {
    return undefined;
  }

  let type: 'downgrade' | 'upgrade';

  if (currentCommitIndex === -1) {
    // The current commit is unknown, treat as upgrade.
    type = 'upgrade';
  } else if (targetCommitIndex < currentCommitIndex) {
    // Target commit is closer to index 0 (newer) than the current commit.
    type = 'upgrade';
  } else {
    // Target commit is further from index 0 (older) than the current commit.
    type = 'downgrade';
  }

  return type;
}

/**
 * Generates the raw content URL for the README.md file of a plugin repository.
 *
 * @param {string | undefined} repoUrl - The repository URL.
 * @returns {string | undefined} The raw content URL for README.md, or undefined if invalid.
 */
export function getPluginReadmeUrl(repoUrl: string | undefined): string | undefined {
  if (!repoUrl) return undefined;

  try {
    const {owner, repo} = extractGitUrl(repoUrl);

    if (owner && repo) {
      return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/source/README.md`;
    }

    return undefined;
  } catch (error) {
    console.error('Failed to parse repository URL:', repoUrl, error);
    return undefined;
  }
}

/**
 * Generates the raw content URL for the icon.png file of a plugin repository.
 *
 * @param {string | undefined} repoUrl - The repository URL.
 * @returns {string | undefined} The raw content URL for icon.png, or undefined if invalid.
 */
export function getPluginIconUrl(repoUrl: string | undefined): string | undefined {
  if (!repoUrl) return undefined;

  try {
    const {owner, repo} = extractGitUrl(repoUrl);

    if (owner && repo) {
      return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/metadata/icon.png`;
    }

    return undefined;
  } catch (error) {
    console.error('Failed to parse repository URL:', repoUrl, error);
    return undefined;
  }
}
