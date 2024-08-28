import {contextBridge, ipcRenderer, webFrame} from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    promptDialog: message => {
      return ipcRenderer.sendSync('show-prompt', message);
    },
  },
});

window.addEventListener('DOMContentLoaded', () => {
  webFrame.executeJavaScript(`window.prompt = window.electron.ipcRenderer.promptDialog`);
});
