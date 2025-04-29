import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {LynxHotkey, LynxInput} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

type HotkeysState = {
  hotkeys: LynxHotkey[];
  input: LynxInput;

  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isMetaPressed: boolean;
  key: string;
  type: 'keyUp' | 'keyDown' | string;

  copyPressed: boolean;
};

type HotkeysStateTypes = {
  [K in keyof HotkeysState]: HotkeysState[K];
};

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

      state.isCtrlPressed = control;
      state.isShiftPressed = shift;
      state.isAltPressed = alt;
      state.isMetaPressed = meta;
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
