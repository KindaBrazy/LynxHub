/**
 * Extracts the owner and repository name from a given GitHub URL.
 * @param {string} url - The GitHub repository URL.
 * @returns {{owner: string, repo: string}} An object containing the owner and repository name.
 * @throws {Error} If the provided URL is not a valid GitHub repository URL.
 */
export function extractGitHubUrl(url: string): {owner: string; repo: string} {
  // Regular expression to match GitHub repository URLs with or without protocol
  const githubRepoRegex = /^(https?:\/\/)?(www\.)?github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/;
  const match = url.match(githubRepoRegex);

  if (!match) {
    throw new Error(`Invalid GitHub repository URL : ${url}`);
  }

  const [, , , owner, repo] = match;
  return {owner, repo};
}

/**
 * Formats the total size into a human-readable format (MB or GB).
 *
 * @param {number} size - The total size in bytes.
 * @returns {string} The formatted size with the appropriate unit (MB or GB).
 */
export function formatSize(size: number | undefined): string {
  if (!size) return '0KB';
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Formats the total size in KB into a human-readable format (KB, MB, or GB).
 *
 * @param {number} sizeKB - The total size in kilobytes.
 * @returns {string} The formatted size with the appropriate unit (KB, MB, or GB).
 */
export function formatSizeKB(sizeKB: number | undefined): string {
  if (!sizeKB) return '0 KB';
  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(2)} KB`;
  } else if (sizeKB < 1024 * 1024) {
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  } else {
    return `${(sizeKB / (1024 * 1024)).toFixed(2)} GB`;
  }
}

export function toMs(value: number, from: 'seconds' | 'minutes'): number {
  switch (from) {
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    default:
      throw new Error('Invalid conversion type. Use "seconds" or "minutes".');
  }
}

/**
 * Validates and normalizes a GitHub repository URL.
 * @param url - The URL to validate
 * @returns Normalized GitHub repository URL or an empty string if invalid
 */
export function validateGitRepoUrl(url: string): string {
  const match = url.toLowerCase().match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+?)(\.git)?(\/)?$/i);
  return match ? `https://github.com/${match[1]}/${match[2]}` : '';
}
