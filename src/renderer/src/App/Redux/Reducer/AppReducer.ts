import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import isBoolean from 'lodash/isBoolean';
import {useSelector} from 'react-redux';

import rendererIpc from '../../RendererIpc';
import {HeroToastPlacement} from '../../Utils/Types';
import {RootState} from '../Store';

type AppState = {
  darkMode: boolean;
  onFocus: boolean;
  maximized: boolean;
  fullscreen: boolean;
  isOnline: boolean;
  navBar: boolean;
  appTitle: string | undefined;
  toastPlacement: HeroToastPlacement;

  initializer: {
    showWizard: boolean;
    isUpgradeFlow: boolean;
  };
};

type AppStateTypes = {
  [K in keyof AppState]: AppState[K];
};

const storageData = await rendererIpc.storage.get('app');

let darkMode: boolean;
let showWizard: boolean;
let isUpgradeFlow: boolean = false;

if (storageData.darkMode === 'dark') {
  darkMode = true;
} else if (storageData.darkMode === 'light') {
  darkMode = false;
} else {
  const systemDark = await rendererIpc.win.getSystemDarkMode();
  darkMode = systemDark === 'dark';
}

const oldSetupDone = storageData.initialized; // Legacy flag
const newSetupDone = storageData.inited; // New flag
const isWindows = window.osPlatform === 'win32';

// If new setup is done, don't show the wizard.
if (newSetupDone) {
  showWizard = false;
} else {
  // If user completed the old setup and is NOT on Windows,
  // mark the new setup as done and skip the wizard.
  if (oldSetupDone && !isWindows) {
    rendererIpc.storage.update('app', {inited: true});
    showWizard = false;
  } else {
    // Otherwise, show the wizard.
    // Determine if it's a fresh install or an upgrade flow for Windows users.
    isUpgradeFlow = oldSetupDone;
    showWizard = true;
  }
}

const initialState: AppState = {
  darkMode,
  fullscreen: false,
  isOnline: false,
  maximized: false,
  onFocus: true,
  navBar: true,
  appTitle: undefined,
  toastPlacement: 'top-center',

  initializer: {showWizard, isUpgradeFlow},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppState: <K extends keyof AppState>(state: AppState, action: PayloadAction<{key: K; value: AppState[K]}>) => {
      state[action.payload.key] = action.payload.value;
    },
    setAppTitle: (state, action: PayloadAction<string | undefined>) => {
      state.appTitle = action.payload;
    },
    setToastPlacement: (state, action: PayloadAction<HeroToastPlacement>) => {
      state.toastPlacement = action.payload;
    },
    toggleAppState: (state: AppState, action: PayloadAction<keyof AppState>) => {
      const key = action.payload;
      if (isBoolean(state[key])) {
        (state[key] as boolean) = !state[key];
      }
    },
  },
});

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useAppState = <K extends keyof AppState>(key: K): AppStateTypes[K] =>
  useSelector((state: RootState) => state.app[key]);

export const appActions = appSlice.actions;

export default appSlice.reducer;
