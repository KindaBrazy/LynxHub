export type DownloadProgress = {
  totalBytes: number;
  receivedBytes: number;
  percent: number;
  bytesPerSecond: number;
  etaSecond: number;
};

export const browserDownloadChannels = {
  onDone: 'browserDL:on-done',
  onProgress: 'browserDL:on-progress',
  onDlStart: 'browserDL:on-dl-start',
};
