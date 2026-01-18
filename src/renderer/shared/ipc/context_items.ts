import contextMenuChannels from '@lynx_cross/consts/ipc_channels/context_menu';

import lynxIpc from './lynxIpc';

const contextItemsIpc = {
  copy: (id: number) => lynxIpc.send(contextMenuChannels.copy, id),

  // Cuts selected text in browser
  cut: (id: number) => lynxIpc.send(contextMenuChannels.cut, id),

  // Pastes clipboard content in browser
  paste: (id: number) => lynxIpc.send(contextMenuChannels.paste, id),

  // Replaces misspelled word in browser
  replaceMisspelling: (id: number, text: string) => lynxIpc.send(contextMenuChannels.replaceMisspelling, id, text),

  // Selects all text in browser
  selectAll: (id: number) => lynxIpc.send(contextMenuChannels.selectAll, id),

  // Undoes last action in browser
  undo: (id: number) => lynxIpc.send(contextMenuChannels.undo, id),

  // Redoes last undone action in browser
  redo: (id: number) => lynxIpc.send(contextMenuChannels.redo, id),

  // Opens new tab with URL
  newTab: (url: string) => lynxIpc.send(contextMenuChannels.newTab, url),

  // Opens URL in default system browser
  openExternal: (url: string) => lynxIpc.send(contextMenuChannels.openExternal, url),

  // Downloads image from URL
  downloadImage: (id: number, url: string) => lynxIpc.send(contextMenuChannels.downloadImage, id, url),

  // Copies image to clipboard
  copyImage: (url: string) => lynxIpc.send(contextMenuChannels.copyImage, url),

  // Searches selected text with Google
  searchWithGoogle: (text: string) => lynxIpc.send(contextMenuChannels.searchWithGoogle, text),

  // Opens DevTools and inspects element at coordinates
  inspectElement: (id: number, x: number, y: number) => lynxIpc.send(contextMenuChannels.inspectElement, id, x, y),

  // Navigates browser (back, forward, or refresh)
  navigate: (id: number, action: 'back' | 'forward' | 'refresh') =>
    lynxIpc.send(contextMenuChannels.navigate, id, action),
};

export default contextItemsIpc;
