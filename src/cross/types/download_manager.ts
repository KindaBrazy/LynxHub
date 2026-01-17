export type DownloadManagerProgress = {
  name: string;
  totalBytes: number;
  receivedBytes: number;
  percent: number;
  bytesPerSecond: number;
  etaSecond: number;
};

export type DownloadStartInfo = {name: string; startTime: number; url: string; totalBytes: number};
export type DownloadDoneInfo = {name: string; state: 'completed' | 'cancelled' | 'interrupted'};

export type DownloadItemInfo = DownloadManagerProgress & {
  status: 'downloading' | 'paused' | 'completed' | 'cancelled';
} & Omit<DownloadStartInfo, 'name' | 'totalBytes'>;
