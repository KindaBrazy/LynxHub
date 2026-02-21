/**
 * Environment utilities.
 */

/**
 * Checks if the application is running in development mode.
 * Uses Vite's import.meta.env.DEV.
 *
 * @returns {boolean} True if in development mode, false otherwise.
 */
export function isDev(): boolean {
  return import.meta.env.DEV;
}
