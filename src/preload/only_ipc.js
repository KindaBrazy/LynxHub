import {electronAPI} from '@electron-toolkit/preload';
import {contextBridge} from 'electron';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('ipc', electronAPI.ipcRenderer);
  } catch (error) {
    console.error(error);
  }
} else {
  window.ipc = electronAPI.ipcRenderer;
}
