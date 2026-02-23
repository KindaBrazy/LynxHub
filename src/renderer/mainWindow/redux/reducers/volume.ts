import {VolumeState} from '@lynx/types/reducers';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type VolumeStateValueByKey = {
  [K in keyof VolumeState]: VolumeState[K];
};

const clampVolume = (volume: number): number => Math.max(0, Math.min(100, volume));

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: VolumeState = {
  tabVolumes: {},
  tabMuted: {},
  tabAudioPlaying: {},
  globalMuted: false,
};

const volumeSlice = createSlice({
  name: 'volume',
  initialState,
  reducers: {
    setTabVolume: (state, action: PayloadAction<{tabId: string; volume: number}>) => {
      const {tabId, volume} = action.payload;
      state.tabVolumes[tabId] = clampVolume(volume);
    },
    setTabMuted: (state, action: PayloadAction<{tabId: string; muted: boolean}>) => {
      const {tabId, muted} = action.payload;
      state.tabMuted[tabId] = muted;
    },
    setTabAudioPlaying: (state, action: PayloadAction<{tabId: string; playing: boolean}>) => {
      const {tabId, playing} = action.payload;
      state.tabAudioPlaying[tabId] = playing;
    },
    setGlobalMuted: (state, action: PayloadAction<boolean>) => {
      state.globalMuted = action.payload;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      delete state.tabVolumes[tabId];
      delete state.tabMuted[tabId];
      delete state.tabAudioPlaying[tabId];
    },
  },
});

/**
 * Hook to access volume reducer state by key with inferred return type.
 */
export const useVolumeState = <K extends keyof VolumeState>(key: K): VolumeStateValueByKey[K] =>
  useSelector((state: RootState) => state.volume[key]);

export const volumeActions = volumeSlice.actions;

export default volumeSlice.reducer;
