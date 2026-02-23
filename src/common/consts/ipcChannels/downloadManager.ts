/**
 * IPC channels for the browser download manager.
 * Handles download progress, control (pause/resume/cancel), and UI interactions.
 */
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
} as const;
