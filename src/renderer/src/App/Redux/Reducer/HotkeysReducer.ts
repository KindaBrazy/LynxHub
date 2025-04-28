import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {LynxInput} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

type HotkeysState = {
  input: LynxInput;
  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isMetaPressed: boolean;
  key: string;
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
  },
  isCtrlPressed: false,
  isShiftPressed: false,
  isAltPressed: false,
  isMetaPressed: false,
  key: '',
};

const hotkeysSlice = createSlice({
  name: 'hotkeys',
  initialState,
  reducers: {
    setInput: (state: HotkeysState, action: PayloadAction<LynxInput>) => {
      state.input = action.payload;
      state.isCtrlPressed = action.payload.control;
      state.isShiftPressed = action.payload.shift;
      state.isAltPressed = action.payload.alt;
      state.isMetaPressed = action.payload.meta;
      state.key = action.payload.key;
    },
  },
});

export const useHotkeysState = <K extends keyof HotkeysState>(key: K): HotkeysStateTypes[K] =>
  useSelector((state: RootState) => state.hotkeys[key]);

export const hotkeysActions = hotkeysSlice.actions;

export default hotkeysSlice.reducer;
