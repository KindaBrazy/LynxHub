import {HotkeysState} from '@lynx/types/reducers';
import {LynxHotkey, LynxInput} from '@lynx_common/types/ipc';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type HotkeysStateTypes = {
  [K in keyof HotkeysState]: HotkeysState[K];
};

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: HotkeysState = {
  input: {
    key: '',
    shift: false,
    control: false,
    alt: false,
    meta: false,
    type: '',
  },
  isCtrlPressed: false,
  isShiftPressed: false,
  isAltPressed: false,
  isMetaPressed: false,
  key: '',
  type: '',
  copyPressed: false,
  hotkeys: [],
};

const hotkeysSlice = createSlice({
  name: 'hotkeys',
  initialState,
  reducers: {
    setInput: (state: HotkeysState, action: PayloadAction<LynxInput>) => {
      state.input = action.payload;

      const {control, key, shift, alt, meta, type} = action.payload;

      state.isCtrlPressed = key === 'control' ? type === 'keyDown' : control;
      state.isShiftPressed = key === 'shift' ? type === 'keyDown' : shift;
      state.isAltPressed = key === 'alt' ? type === 'keyDown' : alt;
      state.isMetaPressed = key === 'meta' ? type === 'keyDown' : meta;
      state.key = key;
      state.type = type;

      state.copyPressed = (control || meta) && key === 'c' && type === 'keyUp';
    },
    setHotkeys: (state: HotkeysState, action: PayloadAction<LynxHotkey[]>) => {
      state.hotkeys = action.payload;
    },
  },
});

export const useHotkeysState = <K extends keyof HotkeysState>(key: K): HotkeysStateTypes[K] =>
  useSelector((state: RootState) => state.hotkeys[key]);

export const hotkeysActions = hotkeysSlice.actions;

export default hotkeysSlice.reducer;
