import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {TooltipStatus} from '../../../../../cross/IpcChannelAndTypes';
import rendererIpc from '../../RendererIpc';
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

  updateAvailable: boolean;
  checkCustomUpdate: boolean;
};

type SettingStateTypes = {
  [K in keyof SettingState]: SettingState[K];
};

const storageData = await rendererIpc.storage.getAll();

const {cardCompactMode, cardsDevImage, cardsDevName, cardsDesc, cardsRepoInfo} = storageData.cards;
const {
  tooltipStatus,
  closeConfirm,
  closeTabConfirm,
  terminateAIConfirm,
  openLastSize,
  dynamicAppTitle,
  openLinkExternal,
  hardwareAcceleration,
  disableLoadingAnimations,
} = storageData.app;

const initialState: SettingState = {
  cardsCompactMode: cardCompactMode,
  cardsDevImage,
  cardsDevName,
  cardsDesc,
  cardsRepoInfo,
  tooltipLevel: tooltipStatus,
  closeConfirm,
  closeTabConfirm,
  terminateAIConfirm,
  openLastSize,
  updatedModules: [],
  newModules: [],
  updateAvailable: false,
  dynamicAppTitle,
  openLinkExternal,
  hardwareAcceleration,
  disableLoadingAnimations,
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
