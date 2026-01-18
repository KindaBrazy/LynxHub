import contextMenuIpc from '@lynx/ipc/context_menu';

export const hideContextWindow = () => contextMenuIpc.send.hideWindow();
export const showContextWindow = () => contextMenuIpc.send.showWindow();

export const setElementFocus = (node: HTMLElement | null) => {
  if (node) {
    setTimeout(() => {
      node?.focus();
    }, 100);
  }
};
