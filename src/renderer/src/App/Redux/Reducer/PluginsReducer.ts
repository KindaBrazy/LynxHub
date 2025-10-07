import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {isArray} from 'lodash';
import {useSelector} from 'react-redux';

import {SkippedPlugins} from '../../../../../cross/IpcChannelAndTypes';
import {InstalledPlugin, PluginItem, PluginSyncList, VersionItem} from '../../../../../cross/plugin/PluginTypes';
import {RootState} from '../Store';

type SetKeys = 'installing' | 'updating' | 'unInstalling';
type ManageOperation = 'add' | 'remove';
type IdType = string | string[] | undefined;

type PluginsState = {
  installing: string[];
  updating: string[];
  unInstalling: string[];
  updatingAll: boolean;

  installed: InstalledPlugin[];
  skipped: SkippedPlugins[];
  syncList: PluginSyncList[];

  selectedPlugin: PluginItem | undefined;
};

type PluginsStateTypes = {
  [K in keyof PluginsState]: PluginsState[K];
};

const initialState: PluginsState = {
  installing: [],
  updating: [],
  unInstalling: [],
  updatingAll: false,

  installed: [],
  skipped: [],
  syncList: [],

  selectedPlugin: undefined,
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
    addInstalled: (state: PluginsState, action: PayloadAction<InstalledPlugin>) => {
      state.installed = [...state.installed, action.payload];
    },
    removeInstalled: (state: PluginsState, action: PayloadAction<string>) => {
      state.installed = state.installed.filter(item => item.metadata.id !== action.payload);
    },
    removeUpdateItem: (state: PluginsState, action: PayloadAction<{id: string | undefined; isUpdated: boolean}>) => {
      const {id, isUpdated} = action.payload;
      state.updating = state.updating.filter(item => item !== id);
      if (isUpdated) {
        state.installed = state.installed.map(item => {
          if (item.metadata.id === id) {
            const version = state.syncList.find(item => item.id === id)?.version as VersionItem;
            return {...item, version};
          }
          return item;
        });
      }
    },
    manageSet: (state: PluginsState, action: PayloadAction<{key: SetKeys; id: IdType; operation: ManageOperation}>) => {
      const {key, id, operation} = action.payload;
      if (id) {
        const currentArray = state[key];

        const idsToManage = isArray(id) ? id : [id];

        if (operation === 'add') {
          // Add only unique IDs
          const newIds = idsToManage.filter(idToAdd => !currentArray.includes(idToAdd));
          state[key] = [...currentArray, ...newIds];
        } else {
          // Remove IDs
          state[key] = currentArray.filter(currentId => !idsToManage.includes(currentId));
        }
      }
    },
  },
});

export const usePluginsState = <K extends keyof PluginsState>(key: K): PluginsStateTypes[K] =>
  useSelector((state: RootState) => state.plugins[key]);

export const useIsInstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.installing.includes(id));
export const useIsUninstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.unInstalling.includes(id));
export const useIsUpdatingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.updating.includes(id));

export const pluginsActions = appSlice.actions;

export default appSlice.reducer;
