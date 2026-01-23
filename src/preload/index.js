import '@sentry/electron/preload';

import os from 'node:os';

import {electronAPI} from '@electron-toolkit/preload';
import {contextBridge} from 'electron';

import {APP_BUILD_NUMBER, APP_NAME, APP_VERSION} from '../common/consts';

function isPortable() {
  if (process.env.PORTABLE_EXECUTABLE_FILE) return 'win';
  if (process.env.APPIMAGE) return 'linux';
  return null;
}

const lynxHub = {
  name: APP_NAME,
  version: APP_VERSION,
  buildNumber: APP_BUILD_NUMBER,
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('osPlatform', os.platform());
    contextBridge.exposeInMainWorld('isPortable', isPortable());
    contextBridge.exposeInMainWorld('appStartTime', Date.now());
    contextBridge.exposeInMainWorld('LynxHub', lynxHub);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.osPlatform = os.platform();
  window.isPortable = isPortable();
  window.appStartTime = Date.now();
  window.LynxHub = lynxHub;
}
