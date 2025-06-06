/**
 * Extracts the owner and repository name from a given GitHub | GitLab URL.
 * @param {string} url - The GitHub repository URL.
 * @returns {{owner: string, repo: string}} An object containing the owner and repository name.
 * @throws {Error} If the provided URL is not a valid GitHub repository URL.
 */
export function extractGitUrl(url: string): {owner: string; repo: string; platform: 'github' | 'gitlab'} {
  // Regular expression to match GitHub and GitLab repository URLs with or without protocol
  const gitRepoRegex = /^(https?:\/\/)?(www\.)?(github|gitlab)\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/;
  const match = url.match(gitRepoRegex);

  if (!match) {
    throw new Error(`Invalid Git repository URL: ${url}`);
  }

  const [, , , platform, owner, repo] = match;
  return {owner, repo, platform: platform as 'github' | 'gitlab'};
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
 * Validates and normalizes a GitHub | GitLab repository URL.
 * @param url - The URL to validate
 * @returns Normalized GitHub repository URL or an empty string if invalid
 */
export function validateGitRepoUrl(url: string): string {
  const githubMatch = url
    .toLowerCase()
    .match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+?)(\.git)?(\/)?$/i);
  if (githubMatch) {
    return `https://github.com/${githubMatch[1]}/${githubMatch[2]}`;
  }

  const gitlabMatch = url
    .toLowerCase()
    .match(/^(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([^/]+)\/([^/]+?)(\.git)?(\/)?$/i);
  if (gitlabMatch) {
    return `https://gitlab.com/${gitlabMatch[1]}/${gitlabMatch[2]}`;
  }

  return '';
}

export function isValidURL(str: string): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  if (urlRegex.test(str)) {
    return true;
  }

  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

export function isDev() {
  return import.meta.env.DEV;
}

export function secondsElapsed(startDate: Date): number {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  return Math.floor(diffInMilliseconds / 1000);
}

export function formatWebAddress(address: string): string {
  if (!address) {
    return '';
  }

  const protocolRegex = /^(?:https?:\/\/|ftp:\/\/|www\.)/i;
  const localhostRegex = /^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i;

  if (localhostRegex.test(address)) {
    if (!address.match(/^https?:\/\//i)) {
      return 'http://' + address;
    }
    return address;
  }

  if (protocolRegex.test(address)) {
    if (address.startsWith('www.') && !address.match(/^https?:\/\//i)) {
      return 'https://' + address;
    }
    return address;
  } else {
    return 'https://' + address;
  }
}

export function getUrlName(url: string): string {
  try {
    const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname;

    if (hostname === 'localhost') {
      return hostname + (parsedUrl.port ? `:${parsedUrl.port}` : '');
    }

    const hostnameParts = hostname.split('.');
    if (hostnameParts.length >= 2) {
      const domain = hostnameParts[hostnameParts.length - 2];

      if (normalizedUrl.includes(hostname) && normalizedUrl.length > hostname.length + 8) {
        const path = parsedUrl.pathname;
        const formattedPath = hostname + path;
        return formattedPath.replace(/^\/+/, '');
      }

      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    return hostname;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return url;
  }
}

export async function compareUrls(firstUrl: string, secondUrl: string, defaultProtocol?: 'https' | 'http' | undefined) {
  const normalizeUrl = await import('normalize-url');
  if (firstUrl === secondUrl) {
    return true;
  }

  // @ts-ignore
  const options: normalizeUrl.Options = {
    defaultProtocol: defaultProtocol || 'https',
  };

  return normalizeUrl.default(firstUrl, options) === normalizeUrl.default(secondUrl, options);
}
