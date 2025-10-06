import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {isArray} from 'lodash';
import {useSelector} from 'react-redux';

import {PluginItem} from '../../../../../cross/plugin/PluginTypes';
import {RootState} from '../Store';

type SetKeys = 'installing' | 'updating' | 'unInstalling';
type ManageOperation = 'add' | 'remove';
type IdType = string | string[] | undefined;

type PluginsState = {
  installing: Set<string>;
  updating: Set<string>;
  unInstalling: Set<string>;
  selectedPlugin: PluginItem | undefined;
  updatingAll: boolean;
};

type PluginsStateTypes = {
  [K in keyof PluginsState]: PluginsState[K];
};

const initialState: PluginsState = {
  installing: new Set([]),
  updating: new Set([]),
  unInstalling: new Set([]),
  selectedPlugin: undefined,
  updatingAll: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setPluginsState: <K extends keyof PluginsState>(
      state: PluginsState,
      action: PayloadAction<{key: K; value: PluginsState[K]}>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    setSelectedPlugin: (state: PluginsState, action: PayloadAction<PluginItem | undefined>) => {
      state.selectedPlugin = action.payload;
    },
    setUpdatingAll: (state: PluginsState, action: PayloadAction<boolean>) => {
      state.updatingAll = action.payload;
    },
    manageSet: (state: PluginsState, action: PayloadAction<{key: SetKeys; id: IdType; operation: ManageOperation}>) => {
      const {key, id, operation} = action.payload;
      if (id) {
        const newSet = new Set(state[key]);
        if (operation === 'add') {
          if (isArray(id)) {
            id.forEach(id => newSet.add(id));
          } else {
            newSet.add(id);
          }
        } else {
          if (isArray(id)) {
            id.forEach(id => newSet.delete(id));
          } else {
            newSet.delete(id);
          }
        }
        state[key] = newSet;
      }
    },
  },
});

export const usePluginsState = <K extends keyof PluginsState>(key: K): PluginsStateTypes[K] =>
  useSelector((state: RootState) => state.plugins[key]);

export const useIsInstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.installing.has(id));
export const useIsUninstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.unInstalling.has(id));

export const pluginsActions = appSlice.actions;

export default appSlice.reducer;
