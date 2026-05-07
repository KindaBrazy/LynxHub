import {ProgressBarProps} from '@heroui/react';

/**
 * Determines the color status for the progress bar based on the download state.
 * @param status - The current status of the download item.
 * @returns The color string for the progress bar.
 */
export const getStatusColor = (status: string): ProgressBarProps['color'] => {
  switch (status) {
    case 'downloading':
      return 'accent';
    case 'paused':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

/**
 * Formats a byte value into a human-readable string (e.g., "1.5 MB").
 * @param bytes - The number of bytes.
 * @returns The formatted string.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Formats the download speed.
 * @param bytesPerSecond - The speed in bytes per second.
 * @returns The formatted speed string.
 */
export const formatSpeed = (bytesPerSecond: number): string => {
  return formatBytes(bytesPerSecond) + '/s';
};

/**
 * Formats the estimated time of arrival (ETA).
 * @param totalBytes - The total size of the file in bytes.
 * @param receivedBytes - The number of bytes received so far.
 * @param bytesPerSecond - The current download speed in bytes per second.
 * @returns The formatted ETA string (e.g., "1m 30s").
 */
export const formatETA = (totalBytes: number, receivedBytes: number, bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '--';
  const remainingBytes = totalBytes - receivedBytes;
  const etaSeconds = Math.ceil(remainingBytes / bytesPerSecond);

  if (etaSeconds < 60) return `${etaSeconds}s`;
  if (etaSeconds < 3600) return `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s`;
  return `${Math.floor(etaSeconds / 3600)}h ${Math.floor((etaSeconds % 3600) / 60)}m`;
};

/**
 * Calculates the download progress percentage.
 * @param received - The number of bytes received.
 * @param total - The total number of bytes.
 * @returns The progress percentage (0-100).
 */
export const getProgress = (received: number, total: number): number => {
  if (total === 0) return 0;
  return (received / total) * 100;
};
