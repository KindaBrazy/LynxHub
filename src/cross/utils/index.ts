import {isEqual} from 'lodash';
import normalizeUrl, {Options} from 'normalize-url';

import {SearchQuerySites, StorageUnit} from '../types';

/**
 * Extracts the owner and repository name from a given GitHub | GitLab URL.
 * @param {string} url - The GitHub repository URL.
 * @returns {{owner: string, repo: string}} An object containing the owner and repository name.
 * @throws {Error} If the provided URL is not a valid GitHub repository URL.
 */
export function extractGitUrl(url: string): {
  owner: string;
  repo: string;
  platform: 'github' | 'gitlab';
  avatarUrl: string;
} {
  // Regular expression to match GitHub and GitLab repository URLs with or without protocol
  const gitRepoRegex = /^(https?:\/\/)?(www\.)?(github|gitlab)\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/;
  const match = url.match(gitRepoRegex);

  if (!match) {
    throw new Error(`Invalid Git repository URL: ${url}`);
  }

  const [, , , platform, owner, repo] = match;
  const avatarUrl = `https://github.com/${owner}.png`;
  return {owner, repo, platform: platform as 'github' | 'gitlab', avatarUrl};
}

/**
 * Gets a numerical value from a string, converts it based on the initial unit,
 * and then converts it to the specified target unit.
 *
 * @param valueString The string containing the value (e.g., "1024", "2.5").
 * @param initialUnit The unit of the provided value (e.g., 'KB', 'MB', 'GB'). Must be a valid StorageUnit.
 * @param targetUnit The unit to convert the final value to (e.g., 'GB', 'MB', 'TB'). Must be a valid StorageUnit.
 * @returns The converted numerical value, or null if parsing fails.
 */
export function convertStorageUnit(
  valueString: string,
  initialUnit: StorageUnit,
  targetUnit: StorageUnit,
): number | null {
  // 1. Define the conversion factor relative to the smallest common unit (Bytes)
  // We use lowercase keys here for internal consistency, as we standardize user input.
  const UNIT_FACTORS: {[key: string]: number} = {
    // Standard Binary Prefixes (base 1024)
    b: 1, // Bytes
    kb: 1024, // Kilobytes
    mb: 1024 * 1024, // Megabytes
    gb: 1024 * 1024 * 1024, // Gigabytes
    tb: 1024 * 1024 * 1024 * 1024, // Terabytes
    pb: 1024 * 1024 * 1024 * 1024 * 1024, // Petabytes
  };

  // Helper function to standardize unit keys to lowercase for internal lookup
  const standardizeUnit = (unit: string): string => unit.toLowerCase().trim();

  // Standardize the units
  const initialKey = standardizeUnit(initialUnit);
  const targetKey = standardizeUnit(targetUnit);

  // 2. Validate units (Though TypeScript enforces the type, we check the factor map just in case)
  if (!UNIT_FACTORS[initialKey] || !UNIT_FACTORS[targetKey]) {
    // This should theoretically not happen if the `StorageUnit` type is correct
    console.error(`Internal error: Unit factor missing for Initial: ${initialUnit} or Target: ${targetUnit}`);
    return null;
  }

  // 3. Extract the numerical value from the string
  // We expect valueString to primarily contain the number, ignoring surrounding text/units
  const match = valueString.match(/(\d+\.?\d*)/);
  if (!match) {
    console.error(`Could not parse numerical value from string: ${valueString}`);
    return null;
  }

  const numericValue = parseFloat(match[0]);
  if (isNaN(numericValue)) {
    console.error(`Parsed value is not a number: ${match[0]}`);
    return null;
  }

  // 4. Conversion Logic

  // Step A: Convert the initial value to the base unit (Bytes)
  const initialFactor = UNIT_FACTORS[initialKey];
  const valueInBytes = numericValue * initialFactor;

  // Step B: Convert the value in Bytes to the desired target unit
  const targetFactor = UNIT_FACTORS[targetKey];

  return valueInBytes / targetFactor;
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
  if (!url) return '';

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

export function isValidURL(str: string | string[]): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,6})(?:[\\/\w .-]*)?$/i;

  const check = (url: string) => {
    if (urlRegex.test(url)) {
      return true;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return Array.isArray(str) ? str.every(check) : check(str);
}

export function isDev() {
  return import.meta.env.DEV;
}

export function secondsElapsed(startDate: Date): number {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  return Math.floor(diffInMilliseconds / 1000);
}

/**
 * Determines if the given string is a search query rather than a URL.
 * @param {string} input - The input string to check
 * @returns {boolean} True if the input appears to be a search query, false if it's likely a URL
 */
export function isSearchQuery(input: string): boolean {
  if (!input) {
    return false;
  }

  const trimmedInput = input.trim();

  // If it contains spaces, it's likely a search query
  if (trimmedInput.includes(' ')) {
    return true;
  }

  // If it starts with a protocol, it's definitely a URL
  if (/^https?:\/\//i.test(trimmedInput)) {
    return false;
  }

  // If it looks like localhost or IP address, it's a URL
  if (/^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i.test(trimmedInput)) {
    return false;
  }

  // If it contains a dot and looks like a domain, it's likely a URL
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/.test(trimmedInput)) {
    return false;
  }

  // If it starts with www., it's likely a URL
  if (/^www\./i.test(trimmedInput)) {
    return false;
  }

  // If it contains common search operators or patterns, it's a search query
  if (/[+\-"'(){}[\]]/.test(trimmedInput) || /\b(and|or|not)\b/i.test(trimmedInput)) {
    return true;
  }

  // If it's a single word without dots, it's likely a search query
  if (!/\./.test(trimmedInput)) {
    return true;
  }

  // Default to search query for ambiguous cases
  return true;
}

export function formatWebAddress(address: string, detectSearchQuery?: boolean): string {
  if (!address) {
    return '';
  }

  // Check if the input is a search query rather than a URL
  if (detectSearchQuery && isSearchQuery(address)) {
    return `https://google.com/search?q=${encodeURIComponent(address)}`;
  }

  const protocolRegex = /^(?:https?:\/\/|ftp:\/\/|www\.)/i;
  const localhostRegex = /^(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?$/i;

  if (localhostRegex.test(address)) {
    if (!address.match(/^https?:\/\//i)) {
      return 'http://' + address;
    }
    return address;
  }

  let formattedAddress = address;

  // Remove www. prefix if present
  if (formattedAddress.match(/^(?:https?:\/\/)?www\./i)) {
    formattedAddress = formattedAddress.replace(/^(https?:\/\/)?www\./i, '$1');
  }

  // Remove trailing slash if present
  formattedAddress = formattedAddress.replace(/\/$/, '');

  if (protocolRegex.test(address)) {
    if (address.startsWith('www.') && !address.match(/^https?:\/\//i)) {
      return 'https://' + formattedAddress;
    }
    return formattedAddress;
  } else {
    return 'https://' + formattedAddress;
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
  if (isEqual(firstUrl, secondUrl)) return true;

  try {
    const options: Options = {
      defaultProtocol: defaultProtocol || 'https',
    };

    return normalizeUrl(firstUrl, options) === normalizeUrl(secondUrl, options);
  } catch (e) {
    console.error('Comparing Urls', e);
    return false;
  }
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m${remainingSeconds > 0 ? `:${remainingSeconds}s` : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h:${remainingMinutes}m${remainingSeconds > 0 ? `:${remainingSeconds}s` : ''}`;
}

export function getSearchUrl(text: string, site: SearchQuerySites): string {
  const encodedText = encodeURIComponent(text);
  let urlTemplate: string;

  switch (site) {
    case 'Reddit':
      urlTemplate = 'http://www.reddit.com/search?q=%s';
      break;
    case 'DuckDuckGo':
      urlTemplate = 'https://duckduckgo.com/?q=%s';
      break;
    case 'Perplexity':
      urlTemplate = 'https://www.perplexity.ai/?q=%s';
      break;
    case 'ChatGPT':
      urlTemplate = 'https://chatgpt.com/?q=%s';
      break;
    case 'Claude':
      urlTemplate = 'https://claude.ai/new?q=%s';
      break;
    case 'Google':
    default:
      urlTemplate = 'https://google.com/search?q=%s';
      break;
  }

  return urlTemplate.replace('%s', encodedText);
}

/** Detect if file called this method is in renderer or main process
 * @returns
 * - **True**: renderer process
 * - **False**: main process
 * - **Undefined**: Can't detect
 * */
export function isRenderer(): boolean | undefined {
  if (typeof window !== 'undefined') return true;

  if (typeof process !== 'undefined') return false;

  return undefined;
}

export function isWin() {
  if (isRenderer() === true && window.osPlatform) return window.osPlatform === 'win32';
  if (isRenderer() === false && process.platform) return process.platform === 'win32';

  // Fallback (shouldn't happen in Electron)
  return true;
}

/**
 * Generates a cache URL for a given image URL.
 * Use this URL in img src to load images through the cache.
 * @param url - The original image URL
 * @returns The cache protocol URL
 */
export function getCacheUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return `lynxcache://fetch/${encodeURIComponent(url)}`;
}
