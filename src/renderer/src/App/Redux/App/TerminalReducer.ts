import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import StorageTypes from '../../../../../cross/StorageTypes';
import rendererIpc from '../../RendererIpc';
import {RootState} from '../Store';

//#region Initialization & Types

type TerminalState = StorageTypes['terminal'];

type TerminalStateTypes = {
  [K in keyof TerminalState]: TerminalState[K];
};

const initialState: TerminalState = {
  outputColor: true,
  useConpty: 'auto',
  scrollBack: 10000,
  fontSize: 14,
  cursorStyle: 'bar',
  cursorInactiveStyle: 'none',
  blinkCursor: true,
  resizeDelay: 77,
};
//#endregion

//#region Slice

const terminalSlice = createSlice({
  initialState,
  name: 'terminal',
  reducers: {
    initState: (state: TerminalState, action: PayloadAction<TerminalState>) => {
      state = action.payload;
      return state;
    },
    setTerminalState: <K extends keyof TerminalState>(
      state: TerminalState,
      action: PayloadAction<{
        key: K;
        value: TerminalState[K];
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
      rendererIpc.storage.update('terminal', {[action.payload.key]: action.payload.value});
    },

    resetToDefaults: (state: TerminalState) => {
      state = initialState;
      rendererIpc.storage.update('terminal', initialState);
      return state;
    },
  },
});
//#endregion

//#region Exports & Utils

export const useTerminalState = <T extends keyof TerminalState>(name: T): TerminalStateTypes[T] =>
  useSelector((state: RootState) => state.terminal[name]);

export const terminalActions = terminalSlice.actions;

export default terminalSlice.reducer;
//#endregion
