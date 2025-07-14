import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    ipc: ElectronAPI['ipcRenderer'];
  }
}
