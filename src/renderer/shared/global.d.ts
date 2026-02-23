import 'vite/client';

import type {ElectronAPI} from '@electron-toolkit/preload';

/**
 * Global preload-injected window API and runtime metadata.
 */

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
