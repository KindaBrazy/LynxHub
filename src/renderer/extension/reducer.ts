import {createSlice} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

type ExtensionsState = {someString: string; someBoolean: boolean; someNumber: number; someArray: []};

type ExtensionsStateTypes = {
  [K in keyof ExtensionsState]: ExtensionsState[K];
};

const initialState: ExtensionsState = {
  someString: 'WoW',
  someBoolean: true,
  someNumber: 77,
  someArray: [],
};

const extensionReducer = createSlice({
  initialState,
  name: 'extension',
  reducers: {
    increaseNumber: (state: ExtensionsState) => {
      state.someNumber = state.someNumber + 1;
    },
  },
});

export const useExtensionState = <T extends keyof ExtensionsState>(name: T): ExtensionsStateTypes[T] =>
  useSelector((state: any) => state.extension[name]);

export const extensionActions = extensionReducer.actions;

export default extensionReducer.reducer;
