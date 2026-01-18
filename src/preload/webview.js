import {contextBridge, ipcRenderer, webFrame} from 'electron';

const electronApi = {
  ipcRenderer: {
    promptDialog: (message, defaultValue) => {
      return ipcRenderer.sendSync('prompt_dialog:on-prompt', message, defaultValue);
    },
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronApi;
}

window.addEventListener('DOMContentLoaded', () => {
  webFrame.executeJavaScript(`window.prompt = window.electron.ipcRenderer.promptDialog`);
});
