/**
 * Time utilities.
 */

/**
 * Converts a time value to milliseconds.
 * @param {number} value - The time value.
 * @param {'seconds' | 'minutes'} from - The unit of the value.
 * @returns {number} The value in milliseconds.
 */
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
 * Formats seconds into a human-readable string (e.g., "1h:5m:30s").
 * @param {number} seconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
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

/**
 * Calculates the seconds elapsed since a given start date.
 * @param {Date} startDate - The start date.
 * @returns {number} The number of seconds elapsed.
 */
export function secondsElapsed(startDate: Date): number {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - startDate.getTime();
  return Math.floor(diffInMilliseconds / 1000);
}
