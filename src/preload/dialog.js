import '@sentry/electron/preload';

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, data) => {
      ipcRenderer.on(channel, data);
    },
  },
});
