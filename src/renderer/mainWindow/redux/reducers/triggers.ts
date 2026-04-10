import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type TriggerState = {
  clearBrowserFail: boolean;
  reloadBrowserHomePage: boolean;
};

type TriggerStateValueByKey = {
  [K in keyof TriggerState]: TriggerState[K];
};

type BooleanTriggerStateKey = {
  [K in keyof TriggerState]: TriggerState[K] extends boolean ? K : never;
}[keyof TriggerState];

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: TriggerState = {
  clearBrowserFail: false,
  reloadBrowserHomePage: false,
};

const triggerSlice = createSlice({
  name: 'trigger',
  initialState,
  reducers: {
    trigger: (state, action: PayloadAction<BooleanTriggerStateKey>) => {
      const key = action.payload;
      state[key] = true;
    },
    clear: (state, action: PayloadAction<BooleanTriggerStateKey>) => {
      const key = action.payload;
      state[key] = false;
    },
  },
});

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useTriggerState = <K extends keyof TriggerState>(key: K): TriggerStateValueByKey[K] =>
  useSelector((state: RootState) => state.trigger[key]);

export const triggerActions = triggerSlice.actions;

export default triggerSlice.reducer;
