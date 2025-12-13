import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import rendererIpc from '../../RendererIpc';
import {RootState} from '../Store';

type VolumeState = {
  // Per-tab volume levels (0-100)
  tabVolumes: {[tabId: string]: number};

  // Per-tab mute states
  tabMuted: {[tabId: string]: boolean};

  // Per-tab audio playing states
  tabAudioPlaying: {[tabId: string]: boolean};

  // Global mute state
  globalMuted: boolean;
};

type VolumeStateTypes = {
  [K in keyof VolumeState]: VolumeState[K];
};

const storageData = await rendererIpc.storage.getAll();
const {volumeSettings} = storageData.browser;

const initialState: VolumeState = {
  tabVolumes: volumeSettings?.tabVolumes || {},
  tabMuted: {},
  tabAudioPlaying: {},
  globalMuted: volumeSettings?.globalMuted ?? false,
};

const volumeSlice = createSlice({
  name: 'volume',
  initialState,
  reducers: {
    setTabVolume: (state: VolumeState, action: PayloadAction<{tabId: string; volume: number}>) => {
      const {tabId, volume} = action.payload;
      const clampedVolume = Math.max(0, Math.min(100, volume));
      state.tabVolumes[tabId] = clampedVolume;
    },
    setTabMuted: (state: VolumeState, action: PayloadAction<{tabId: string; muted: boolean}>) => {
      const {tabId, muted} = action.payload;
      state.tabMuted[tabId] = muted;
    },
    setTabAudioPlaying: (state: VolumeState, action: PayloadAction<{tabId: string; playing: boolean}>) => {
      const {tabId, playing} = action.payload;
      state.tabAudioPlaying[tabId] = playing;
    },
    setGlobalMuted: (state: VolumeState, action: PayloadAction<boolean>) => {
      state.globalMuted = action.payload;
    },
    removeTab: (state: VolumeState, action: PayloadAction<string>) => {
      const tabId = action.payload;
      delete state.tabVolumes[tabId];
      delete state.tabMuted[tabId];
      delete state.tabAudioPlaying[tabId];
    },
  },
});

export const useVolumeState = <K extends keyof VolumeState>(key: K): VolumeStateTypes[K] =>
  useSelector((state: RootState) => state.volume[key]);

export const volumeActions = volumeSlice.actions;

export default volumeSlice.reducer;
