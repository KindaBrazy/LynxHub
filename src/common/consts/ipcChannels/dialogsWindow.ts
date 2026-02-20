/**
 * IPC channels for dialog windows (prompt, confirm, alert).
 * Handles communication between the main process and dialog windows.
 */
export const windowDialogsChannels = {
  promptResult: 'prompt_dialog:result',
  promptShow: 'prompt_dialog:on-show',

  confirmResult: 'confirm_dialog:result',
  confirmShow: 'confirm_dialog:on-show',

  alertShow: 'alert_dialog:on-show',

  onPrompt: 'prompt_dialog:on-prompt',
  onConfirm: 'confirm_dialog:on-confirm',
  onAlert: 'alert_dialog:on-alert',
} as const;

