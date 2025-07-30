export type DownloadProgress = {
  name: string;
  totalBytes: number;
  receivedBytes: number;
  percent: number;
  bytesPerSecond: number;
  etaSecond: number;
};

export type DownloadStartInfo = {name: string; startTime: number; url: string; totalBytes: number};
export type DownloadDoneInfo = {name: string; state: 'completed' | 'cancelled' | 'interrupted'};

export const browserDownloadChannels = {
  onDone: 'browserDL:on-done',
  onProgress: 'browserDL:on-progress',
  onDlStart: 'browserDL:on-dl-start',

  cancel: 'browserDL:cancel',
  pause: 'browserDL:pause',
  resume: 'browserDL:resume',
};
