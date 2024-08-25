import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {isBoolean} from 'lodash';
import {useSelector} from 'react-redux';

import {homeRoutePath} from '../../Components/Pages/ContentPages/Home/HomePage';
import {RootState} from '../Store';

//#region Initialization & Types

type AppState = {
  darkMode: boolean;
  onFocus: boolean;
  maximized: boolean;
  fullscreen: boolean;
  isOnline: boolean;
  navBar: boolean;
  currentPage: string;
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
  currentPage: homeRoutePath,
};
//#endregion

//#region Slice

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppState: <K extends keyof AppState>(state: AppState, action: PayloadAction<{key: K; value: AppState[K]}>) => {
      state[action.payload.key] = action.payload.value;
    },
    toggleAppState: (state: AppState, action: PayloadAction<keyof AppState>) => {
      const key = action.payload;
      if (isBoolean(state[key])) {
        (state[key] as boolean) = !state[key];
      }
    },
  },
});
//#endregion

//#region Exports & Utils

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useAppState = <K extends keyof AppState>(key: K): AppStateTypes[K] =>
  useSelector((state: RootState) => state.app[key]);

export const appActions = appSlice.actions;

export default appSlice.reducer;
//#endregion
