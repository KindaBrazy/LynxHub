/**
 * Progress information for a file download.
 */
export type DownloadManagerProgress = {
  /** The name of the file being downloaded. */
  name: string;
  /** The total size of the file in bytes. */
  totalBytes: number;
  /** The number of bytes received so far. */
  receivedBytes: number;
  /** The download progress percentage (0-1). */
  percent: number;
  /** The current download speed in bytes per second. */
  bytesPerSecond: number;
  /** Estimated time of arrival (completion) in seconds. */
  etaSecond: number;
};

/**
 * Information available when a download starts.
 */
export type DownloadStartInfo = {
  /** The name of the file. */
  name: string;
  /** The start timestamp (ms). */
  startTime: number;
  /** The URL of the file. */
  url: string;
  /** The total size of the file in bytes. */
  totalBytes: number;
};

/**
 * Information available when a download completes.
 */
export type DownloadDoneInfo = {
  /** The name of the file. */
  name: string;
  /** The final state of the download. */
  state: 'completed' | 'cancelled' | 'interrupted';
};

/**
 * Comprehensive information about a download item, combining progress and status.
 */
export type DownloadItemInfo = DownloadManagerProgress & {
  /** The current status of the download. */
  status: 'downloading' | 'paused' | 'completed' | 'cancelled';
} & Omit<DownloadStartInfo, 'name' | 'totalBytes'>;
