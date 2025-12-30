import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {TooltipStatus} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

type SettingState = {
  tooltipLevel: TooltipStatus;

  closeConfirm: boolean;
  closeTabConfirm: boolean;
  terminateAIConfirm: boolean;
  openLastSize: boolean;
  dynamicAppTitle: boolean;
  openLinkExternal: boolean;
  hardwareAcceleration: boolean;
  disableLoadingAnimations: boolean;

  updatedModules: string[];
  newModules: string[];

  updateAvailable: boolean;
  checkCustomUpdate: boolean;
};

type SettingStateTypes = {
  [K in keyof SettingState]: SettingState[K];
};

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: SettingState = {
  tooltipLevel: 'essential',
  closeConfirm: true,
  closeTabConfirm: true,
  terminateAIConfirm: true,
  openLastSize: false,
  updatedModules: [],
  newModules: [],
  updateAvailable: false,
  dynamicAppTitle: false,
  openLinkExternal: false,
  hardwareAcceleration: true,
  disableLoadingAnimations: false,
  checkCustomUpdate: false,
};

const settingsSlice = createSlice({
  initialState,
  name: 'settings',
  reducers: {
    setSettingsState: <K extends keyof SettingState>(
      state: SettingState,
      action: PayloadAction<{
        key: K;
        value: SettingState[K];
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const useSettingsState = <T extends keyof SettingState>(name: T): SettingStateTypes[T] =>
  useSelector((state: RootState) => state.settings[name]);

export const settingsActions = settingsSlice.actions;

export default settingsSlice.reducer;
