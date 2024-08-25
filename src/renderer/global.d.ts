import 'vite/client';

import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
