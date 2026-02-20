import {parse} from 'node:path';

import {isWin} from './index';

/**
 * Sanitizes a filename to prevent path traversal and invalid characters
 * @param filename - The filename to sanitize
 * @returns Sanitized filename safe for file system operations
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
    const parsed = parse(sanitized);
    const ext = parsed.ext;
    const name = parsed.name.substring(0, maxLength - ext.length);
    sanitized = name + ext;
  }

  return sanitized;
}
