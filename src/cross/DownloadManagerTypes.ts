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

export const browserDownloadChannels = {
  onDone: 'browserDL:on-done',
  onProgress: 'browserDL:on-progress',
  onDlStart: 'browserDL:on-dl-start',

  cancel: 'browserDL:cancel',
  pause: 'browserDL:pause',
  resume: 'browserDL:resume',
  clear: 'browserDL:clear',
  clearAll: 'browserDL:clear-all',
  openDownloadsMenu: 'browserDL:open-downloads-menu',

  openItem: 'browserDL:open-item',

  setDownloadLocation: 'browserDL:set-download-location',
  getDownloadLocation: 'browserDL:get-download-location',
  openLocationDialog: 'browserDL:open-location-dialog',
  setDownloadBehavior: 'browserDL:set-download-behavior',
  getDownloadBehavior: 'browserDL:get-download-behavior',

  mainDownloadCount: 'browserDL:main-download-count',
};

export const customNotifChannels = {
  onOpen: 'customNotif-onOpen',
  onClose: 'customNotif-onClose',
  onBtnPress: 'customNotif-onBtnPress',
};
