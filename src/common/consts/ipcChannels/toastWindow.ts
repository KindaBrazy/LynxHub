/**
 * IPC channels for toast notifications.
 * Handles displaying toast messages and toast interactions.
 */
export const toastWindowChannels = {
  onShowMessage: 'toast:onShowMessage',
  closeToast: 'toast:closeToast',
  exitApp: 'toast:exitApp',
  restartApp: 'toast:restartApp',
  customBtnPressed: 'toast:customBtnPressed',
} as const;

