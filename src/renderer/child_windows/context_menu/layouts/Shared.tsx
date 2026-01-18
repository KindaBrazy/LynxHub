import rendererIpc from '@lynx/ipc';

export const hideWindow = () => rendererIpc.contextMenu.hideWindow();

export const setElementFocus = (node: HTMLElement | null) => {
  if (node) {
    setTimeout(() => {
      node?.focus();
    }, 100);
  }
};
