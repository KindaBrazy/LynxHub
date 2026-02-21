import contextMenuIpc from '@lynx_shared/ipc/contextMenu';

/**
 * Hides the context menu window via IPC.
 */
export const hideContextWindow = (): void => {
  contextMenuIpc.send.hideWindow();
};

/**
 * Shows the context menu window via IPC.
 */
export const showContextWindow = (): void => {
  contextMenuIpc.send.showWindow();
};

/**
 * Sets focus to a specific HTML element with a slight delay.
 * Useful when the element might not be immediately focusable (e.g., after a render update).
 *
 * @param node - The HTML element to focus.
 */
export const setElementFocus = (node: HTMLElement | null): void => {
  if (node) {
    // Small delay to ensure the DOM is ready/visible before focusing
    setTimeout(() => {
      node?.focus();
    }, 100);
  }
};
