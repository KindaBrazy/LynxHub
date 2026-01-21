import {ContextMenuVolumeData, ContextWindowWidthSizes} from '@lynx_cross/types/ipc';
import {NavHistory} from '@lynx_cross/types/ipc';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ContextMenuParams} from 'electron';
import {cloneDeep} from 'lodash';
import {useSelector} from 'react-redux';

import {MenuTypes} from '../consts';
import {showContextWindow} from '../layouts/Shared';
import {RootState} from './store';

type ZoomLayout = {id: string; factor: number};
type RightClick = {id: number; contextMenuParams: ContextMenuParams | undefined; navigationHistory: NavHistory};
type RightClickParams = {
  hasLinkItems: boolean;
  hasImageItems: boolean;
  hasTextSelection: boolean;
  hasEditItems: boolean;
  isActionsAvailable: boolean;
};

type PromptWindow = {message: string; defaultValue?: string};
type AlertWindow = {message: string};
type ConfirmWindow = {message: string};

type ContextState = {
  windowWidth: string;
  activeLayout: MenuTypes | undefined;
  targetID: string;

  browserScale: ZoomLayout;
  browserVolume: ContextMenuVolumeData;
  promptWindow: PromptWindow;

  rightClick: RightClick;
  rightClickParams: RightClickParams;
  alertWindow: AlertWindow;
  confirmWindow: ConfirmWindow;
};

type ContextStateTypes = {
  [K in keyof ContextState]: ContextState[K];
};

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: ContextState = {
  windowWidth: 'w-44',
  activeLayout: undefined,

  browserScale: {id: '', factor: 100},
  targetID: '',
  rightClick: {
    contextMenuParams: undefined,
    navigationHistory: {
      canGoBack: false,
      canGoForward: false,
    },
    id: 0,
  },
  rightClickParams: {
    hasLinkItems: false,
    hasImageItems: false,
    hasTextSelection: false,
    hasEditItems: false,
    isActionsAvailable: false,
  },
  browserVolume: {
    id: '',
    tabId: '',
    volume: 0,
    muted: false,
    globalMuted: false,
  },
  promptWindow: {
    message: '',
    defaultValue: undefined,
  },
  alertWindow: {
    message: '',
  },
  confirmWindow: {
    message: '',
  },
};

const getWidth = (state: ContextWindowWidthSizes) => {
  switch (state) {
    case 'md':
      return 'w-72';
    case 'lg':
      return 'w-96';
    default:
    case 'sm':
      return 'w-44';
  }
};

const appSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setContextState: <K extends keyof ContextState>(
      state: ContextState,
      action: PayloadAction<{key: K; value: ContextState[K]}>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    showLayout: <K extends keyof ContextState>(
      _,
      action: PayloadAction<{key: K; value: ContextState[K]; layout?: MenuTypes; widthSize: ContextWindowWidthSizes}>,
    ) => {
      const {layout, widthSize, key, value} = action.payload;

      const result = cloneDeep(initialState);
      result.windowWidth = getWidth(widthSize);

      if (layout) result.activeLayout = layout;

      result[key] = value;

      showContextWindow();

      return result;
    },

    updateZoomFactor: (state: ContextState, action: PayloadAction<number>) => {
      state.browserScale.factor = action.payload;
    },
    updateRightClickParams: (state: ContextState, action: PayloadAction<RightClickParams>) => {
      state.rightClickParams = action.payload;
    },

    updateVolume: (state: ContextState, action: PayloadAction<number>) => {
      state.browserVolume.volume = action.payload;
    },
    updateMuted: (state: ContextState, action: PayloadAction<boolean>) => {
      state.browserVolume.muted = action.payload;
    },
  },
});

export const useContextState = <K extends keyof ContextState>(key: K): ContextStateTypes[K] =>
  useSelector((state: RootState) => state.context[key]);
export const contextActions = appSlice.actions;
export default appSlice.reducer;
