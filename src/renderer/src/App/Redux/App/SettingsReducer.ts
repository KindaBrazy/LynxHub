import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {LynxHotkeys, TooltipStatus} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

//#region Initialization & Types

type SettingState = {
  tooltipLevel: TooltipStatus;
  hotkeys: LynxHotkeys;

  cardsCompactMode: boolean;
  cardsDevImage: boolean;
  cardsDevName: boolean;
  cardsDesc: boolean;
  cardsRepoInfo: boolean;

  closeConfirm: boolean;
  terminateAIConfirm: boolean;

  updatedModules: string[];
  newModules: string[];
  moduleUpdateAvailable: boolean;

  extensionsUpdateAvailable: string[];

  updateAvailable: boolean;
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
  terminateAIConfirm: true,
  hotkeys: {
    FULLSCREEN: window.osPlatform === 'darwin' ? 'f12' : 'f11',
    TOGGLE_NAV: 'alt+a',
    TOGGLE_AI_VIEW: 'alt+q',
    isEnabled: true,
  },
  updatedModules: [],
  newModules: [],
  moduleUpdateAvailable: false,
  updateAvailable: false,
  extensionsUpdateAvailable: [],
};
//#endregion

//#region Slice

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
    setHotkeys: (state, action: PayloadAction<LynxHotkeys>) => {
      state.hotkeys = action.payload;
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
//#endregion

//#region Exports & Utils

export const useSettingsState = <T extends keyof SettingState>(name: T): SettingStateTypes[T] =>
  useSelector((state: RootState) => state.settings[name]);

export const settingsActions = settingsSlice.actions;

export default settingsSlice.reducer;
//#endregion
