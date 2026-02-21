/**
 * Platform detection utilities.
 *
 * This module provides a safe way to detect the operating system
 * in both Main (Node.js) and Renderer (Browser) environments.
 */

/**
 * Detects if the current platform is Windows.
 * @returns {boolean} True if running on Windows.
 */
function detectIsWin(): boolean {
  // Renderer process - use preload-exposed platform
  if (typeof window !== 'undefined' && (window as any).osPlatform) {
    return (window as any).osPlatform === 'win32';
  }
  // Main process - use process.platform directly
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'win32';
  }
  // Fallback (shouldn't happen in Electron)
  return true;
}

/**
 * Detects if the current platform is macOS.
 * @returns {boolean} True if running on macOS.
 */
function detectIsMac(): boolean {
  // Renderer process - use preload-exposed platform
  if (typeof window !== 'undefined' && (window as any).osPlatform) {
    return (window as any).osPlatform === 'darwin';
  }
  // Main process - use process.platform directly
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'darwin';
  }
  // Fallback
  return false;
}

/**
 * Detects if the current platform is Linux.
 * @returns {boolean} True if running on Linux.
 */
function detectIsLinux(): boolean {
  // Renderer process - use preload-exposed platform
  if (typeof window !== 'undefined' && (window as any).osPlatform) {
    return (window as any).osPlatform === 'linux';
  }
  // Main process - use process.platform directly
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'linux';
  }
  // Fallback
  return false;
}

/**
 * True if the current platform is Windows.
 */
export const isWin: boolean = detectIsWin();

/**
 * True if the current platform is macOS.
 */
export const isMac: boolean = detectIsMac();

/**
 * True if the current platform is Linux.
 */
export const isLinux: boolean = detectIsLinux();

/**
 * The line ending character for the current platform.
 * '\r' for Windows, '\n' for others.
 */
export const terminalLineEnding = isWin ? '\r' : '\n';
