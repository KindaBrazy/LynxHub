import {HotkeysState} from '@lynx/types/reducers';
import {LynxHotkey, LynxInput} from '@lynx_common/types/ipc';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type HotkeysStateValueByKey = {
  [K in keyof HotkeysState]: HotkeysState[K];
};

const isModifierKeyPressed = (
  modifierKey: string,
  activeKey: string,
  eventType: string,
  modifierState: boolean,
): boolean => (activeKey === modifierKey ? eventType === 'keyDown' : modifierState);

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
    setInput: (state, action: PayloadAction<LynxInput>) => {
      state.input = action.payload;

      const {control, key, shift, alt, meta, type} = action.payload;

      state.isCtrlPressed = isModifierKeyPressed('control', key, type, control);
      state.isShiftPressed = isModifierKeyPressed('shift', key, type, shift);
      state.isAltPressed = isModifierKeyPressed('alt', key, type, alt);
      state.isMetaPressed = isModifierKeyPressed('meta', key, type, meta);
      state.key = key;
      state.type = type;

      state.copyPressed = (control || meta) && key === 'c' && type === 'keyUp';
    },
    setHotkeys: (state, action: PayloadAction<LynxHotkey[]>) => {
      state.hotkeys = action.payload;
    },
    clearInput: state => {
      state.input = {
        key: '',
        shift: false,
        control: false,
        alt: false,
        meta: false,
        type: '',
      };
      state.isCtrlPressed = false;
      state.isShiftPressed = false;
      state.isAltPressed = false;
      state.isMetaPressed = false;
      state.key = '';
      state.type = '';
      state.copyPressed = false;
    },
  },
});

/**
 * Hook to access hotkeys reducer state by key with inferred return type.
 */
export const useHotkeysState = <K extends keyof HotkeysState>(key: K): HotkeysStateValueByKey[K] =>
  useSelector((state: RootState) => state.hotkeys[key]);

export const hotkeysActions = hotkeysSlice.actions;

export default hotkeysSlice.reducer;
