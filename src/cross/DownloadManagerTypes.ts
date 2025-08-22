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

export type DownloadItemInfo = DownloadProgress & {status: 'downloading' | 'paused' | 'completed' | 'cancelled'} & Omit<
    DownloadStartInfo,
    'name' | 'totalBytes'
  >;

export const browserDownloadChannels = {
  onDone: 'browserDL:on-done',
  onProgress: 'browserDL:on-progress',
  onDlStart: 'browserDL:on-dl-start',

  cancel: 'browserDL:cancel',
  pause: 'browserDL:pause',
  resume: 'browserDL:resume',
  clear: 'browserDL:clear',
  openDownloadsMenu: 'browserDL:open-downloads-menu',

  openItem: 'browserDL:open-item',

  mainDownloadCount: 'browserDL:main-download-count',
};

export const customNotifChannels = {
  onOpen: 'customNotif-onOpen',
  onClose: 'customNotif-onClose',
  onBtnPress: 'customNotif-onBtnPress',
};
