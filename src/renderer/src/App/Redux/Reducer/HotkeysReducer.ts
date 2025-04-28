import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {LynxInput} from '../../../../../cross/IpcChannelAndTypes';
import {RootState} from '../Store';

type HotkeysState = {
  input: LynxInput;
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
};

const hotkeysSlice = createSlice({
  name: 'hotkeys',
  initialState,
  reducers: {
    setInput: (state: HotkeysState, action: PayloadAction<LynxInput>) => {
      state.input = action.payload;
    },
  },
});

export const useHotkeysState = <K extends keyof HotkeysState>(key: K): HotkeysStateTypes[K] =>
  useSelector((state: RootState) => state.hotkeys[key]);

export const hotkeysActions = hotkeysSlice.actions;

export default hotkeysSlice.reducer;
