import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {TooltipStatus} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

type SettingState = {
  tooltipLevel: TooltipStatus;

  cardsCompactMode: boolean;
  cardsDevImage: boolean;
  cardsDevName: boolean;
  cardsDesc: boolean;
  cardsRepoInfo: boolean;

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
  moduleUpdateAvailable: string[];

  extensionsUpdateAvailable: string[];

  updateAvailable: boolean;
  checkCustomUpdate: boolean;
};

type SettingStateTypes = {
  [K in keyof SettingState]: SettingState[K];
};

const initialState: SettingState = {
  cardsCompactMode: false,
  cardsDevImage: true,
  cardsDevName: false,
  cardsDesc: true,
  cardsRepoInfo: true,
  tooltipLevel: 'essential',
  closeConfirm: true,
  closeTabConfirm: true,
  terminateAIConfirm: true,
  openLastSize: false,
  updatedModules: [],
  newModules: [],
  moduleUpdateAvailable: [],
  updateAvailable: false,
  extensionsUpdateAvailable: [],
  dynamicAppTitle: true,
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
    removeExtUpdateAvailable: (state, action: PayloadAction<string>) => {
      state.extensionsUpdateAvailable = state.extensionsUpdateAvailable.filter(item => item !== action.payload);
    },

    addUpdatedModule: (state, action: PayloadAction<string | string[]>) => {
      const modulesToAdd = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.updatedModules = [...new Set([...state.updatedModules, ...modulesToAdd])];
    },
    addNewModule: (state, action: PayloadAction<string>) => {
      state.newModules = [...new Set([...state.newModules, action.payload])];
    },

    removeUpdatedModule: (state, action: PayloadAction<string>) => {
      state.updatedModules = state.updatedModules.filter(module => module !== action.payload);
    },
    removeNewModule: (state, action: PayloadAction<string>) => {
      state.newModules = state.updatedModules.filter(module => module !== action.payload);
    },
  },
});

export const useSettingsState = <T extends keyof SettingState>(name: T): SettingStateTypes[T] =>
  useSelector((state: RootState) => state.settings[name]);

export const settingsActions = settingsSlice.actions;

export default settingsSlice.reducer;
