import {AppState} from '@lynx/types/reducers';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type AppStateValueByKey = {
  [K in keyof AppState]: AppState[K];
};

type BooleanAppStateKey = {
  [K in keyof AppState]: AppState[K] extends boolean ? K : never;
}[keyof AppState];

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: AppState = {
  darkMode: true,
  fullscreen: false,
  isOnline: false,
  maximized: false,
  onFocus: true,
  navBar: true,
  appTitle: undefined,
  initializer: {showWizard: false, isUpgradeFlow: false},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppState: <K extends keyof AppState>(state, action: PayloadAction<{key: K; value: AppState[K]}>) => {
      state[action.payload.key] = action.payload.value;
    },
    setAppTitle: (state, action: PayloadAction<string | undefined>) => {
      state.appTitle = action.payload;
    },
    toggleAppState: (state, action: PayloadAction<BooleanAppStateKey>) => {
      const key = action.payload;
      state[key] = !state[key];
    },
  },
});

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useAppState = <K extends keyof AppState>(key: K): AppStateValueByKey[K] =>
  useSelector((state: RootState) => state.app[key]);

export const appActions = appSlice.actions;

export default appSlice.reducer;
