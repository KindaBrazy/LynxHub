import os from 'node:os';

import {electronAPI} from '@electron-toolkit/preload';
import {contextBridge} from 'electron';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('osPlatform', os.platform());
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.osPlatform = os.platform();
}
