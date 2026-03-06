import {isWin} from './platform';

/**
 * Sanitizes a filename to prevent path traversal and invalid characters.
 *
 * @param {string} filename - The filename to sanitize.
 * @returns {string} Sanitized filename safe for file system operations.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || filename.trim() === '') {
    return 'download';
  }

  // Remove path separators and parent directory references
  let sanitized = filename.replace(/[/\\]/g, '_').replace(/\.\./g, '_');

  // Remove invalid characters based on OS
  if (isWin) {
    // Windows invalid characters: < > : " / \ | ? *
    sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
    // Remove trailing dots and spaces (Windows doesn't allow these)
    sanitized = sanitized.replace(/[\s.]+$/, '');
  } else {
    // Unix-like systems: only null character is invalid
    sanitized = sanitized.replace(/\0/g, '_');
  }

  // Ensure filename is not empty after sanitization
  if (sanitized.trim() === '') {
    return 'download';
  }

  // Limit filename length (leaving room for counter suffix)
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    // Manual extension extraction to avoid node:path dependency
    const lastDotIndex = sanitized.lastIndexOf('.');
    let name: string;
    let ext: string;

    if (lastDotIndex !== -1 && lastDotIndex > 0) {
      ext = sanitized.substring(lastDotIndex);
      name = sanitized.substring(0, lastDotIndex);
    } else {
      ext = '';
      name = sanitized;
    }

    // Truncate name to fit maxLength including extension
    // Ensure we don't cut in the middle of a surrogate pair if possible (though JS strings are UTF-16)
    const availableLength = maxLength - ext.length;
    if (availableLength > 0) {
      name = name.substring(0, availableLength);
      sanitized = name + ext;
    } else {
      // Extension is too long, just truncate the whole string
      sanitized = sanitized.substring(0, maxLength);
    }
  }

  return sanitized;
}

export const replaceSlashes = (value: string) => value.replaceAll('\\', '/').replaceAll('\\\\', '/');
