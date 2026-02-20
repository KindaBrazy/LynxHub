import contextMenuIpc from '@lynx_shared/ipc/contextMenu';

export const hideContextWindow = () => contextMenuIpc.send.hideWindow();
export const showContextWindow = () => contextMenuIpc.send.showWindow();

export const setElementFocus = (node: HTMLElement | null) => {
  if (node) {
    setTimeout(() => {
      node?.focus();
    }, 100);
  }
};
