// eslint-disable-next-line
const {contextBridge, ipcRenderer} = require('electron');

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
