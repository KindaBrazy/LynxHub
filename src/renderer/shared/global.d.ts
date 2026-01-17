import 'vite/client';

import {ElectronAPI} from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    osPlatform: NodeJS.Platform;
    isPortable: 'win' | 'linux' | null;
    appStartTime: number;
    LynxHub: {
      name: string;
      version: string;
      buildNumber: number;
    };
  }
}
