import {ToastPlacement} from '@heroui/toast/dist/use-toast';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import isBoolean from 'lodash/isBoolean';
import {useSelector} from 'react-redux';

import {RootState} from '../Store';

type AppState = {
  darkMode: boolean;
  onFocus: boolean;
  maximized: boolean;
  fullscreen: boolean;
  isOnline: boolean;
  navBar: boolean;
  appTitle: string | undefined;
  toastPlacement: ToastPlacement;
};

type AppStateTypes = {
  [K in keyof AppState]: AppState[K];
};

const initialState: AppState = {
  darkMode: true,
  fullscreen: false,
  isOnline: false,
  maximized: false,
  onFocus: true,
  navBar: true,
  appTitle: undefined,
  toastPlacement: 'top-center',
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
    setToastPlacement: (state, action: PayloadAction<ToastPlacement>) => {
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
