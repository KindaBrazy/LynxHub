import {contextBridge, ipcRenderer, webFrame} from 'electron';

const electronApi = {
  ipcRenderer: {
    promptDialog: (message, defaultValue) => {
      return ipcRenderer.sendSync('prompt_dialog:on-prompt', message, defaultValue);
    },
    confirmDialog: message => {
      return ipcRenderer.sendSync('confirm_dialog:on-confirm', message);
    },
    alertDialog: message => {
      return ipcRenderer.sendSync('alert_dialog:on-alert', message);
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
  webFrame.executeJavaScript(`window.confirm = window.electron.ipcRenderer.confirmDialog`);
  webFrame.executeJavaScript(`window.alert = window.electron.ipcRenderer.alertDialog`);
});
