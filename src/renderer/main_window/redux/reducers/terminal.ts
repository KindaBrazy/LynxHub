import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import rendererIpc from '../../ipc';
import {TerminalState} from '../../types/reducers';
import {RootState} from '../store';

type TerminalStateTypes = {
  [K in keyof TerminalState]: TerminalState[K];
};

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: TerminalState = {
  outputColor: true,
  useConpty: 'auto',
  scrollBack: 5000,
  fontSize: 14,
  cursorStyle: 'bar',
  cursorInactiveStyle: 'outline',
  blinkCursor: true,
  resizeDelay: 100,
  closeTabOnExit: false,
  enableLigatures: false,
  cdHistory: [],
  quickCommands: [],
};

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

export const useTerminalState = <T extends keyof TerminalState>(name: T): TerminalStateTypes[T] =>
  useSelector((state: RootState) => state.terminal[name]);

export const useTerminalStat = () => useSelector((state: RootState) => state.terminal);

export const terminalActions = terminalSlice.actions;

export default terminalSlice.reducer;
