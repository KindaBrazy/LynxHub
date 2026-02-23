import {PluginInstalledItem, PluginItem, PluginSyncItem, UnloadedPlugins} from '@lynx_common/types/plugins';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type PluginQueueKey = 'installing' | 'updating' | 'unInstalling';
type QueueOperation = 'add' | 'remove';
type PluginIdInput = string | string[] | undefined;

type PluginsState = {
  installing: string[];
  updating: string[];
  unInstalling: string[];
  updatingAll: boolean;

  installedList: PluginInstalledItem[];
  unloadedList: UnloadedPlugins[];
  syncList: PluginSyncItem[];

  selectedPlugin: PluginItem | undefined;
};

type PluginsStateValueByKey = {
  [K in keyof PluginsState]: PluginsState[K];
};

const normalizePluginIds = (ids: PluginIdInput): string[] => (Array.isArray(ids) ? ids : ids ? [ids] : []);

const initialState: PluginsState = {
  installing: [],
  updating: [],
  unInstalling: [],
  updatingAll: false,

  installedList: [],
  unloadedList: [],
  syncList: [],

  selectedPlugin: undefined,
};

const pluginsSlice = createSlice({
  name: 'plugins',
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
    addInstalled: (state: PluginsState, action: PayloadAction<PluginInstalledItem>) => {
      state.installedList.push(action.payload);
    },
    removeInstalled: (state: PluginsState, action: PayloadAction<string>) => {
      state.installedList = state.installedList.filter(item => item.id !== action.payload);
    },
    updateInstalledVersion: (
      state: PluginsState,
      action: PayloadAction<{id: string; version: string} | {id: string; version: string}[]>,
    ) => {
      if (Array.isArray(action.payload)) {
        const items = action.payload;
        state.installedList = state.installedList.map(item => {
          const updatedItem = items.find(payloadItem => payloadItem.id === item.id);
          return updatedItem ? {...item, version: updatedItem.version} : item;
        });
      } else {
        const {id, version} = action.payload;
        state.installedList = state.installedList.map(item => (item.id === id ? {...item, version} : item));
      }
    },
    removeUpdateItem: (state: PluginsState, action: PayloadAction<{id: string | undefined; isUpdated: boolean}>) => {
      const {id, isUpdated} = action.payload;
      state.updating = state.updating.filter(item => item !== id);
      const version = state.syncList.find(item => item.id === id)?.version;

      if (isUpdated && version) {
        state.installedList = state.installedList.map(item => {
          if (item.id === id) {
            return {...item, version};
          }
          return item;
        });
      }
    },
    manageSet: (
      state: PluginsState,
      action: PayloadAction<{key: PluginQueueKey; id: PluginIdInput; operation: QueueOperation}>,
    ) => {
      const {key, id, operation} = action.payload;
      const currentArray = state[key];
      const idsToManage = normalizePluginIds(id);
      if (idsToManage.length === 0) return;

      if (operation === 'add') {
        const nextIds = idsToManage.filter(idToAdd => !currentArray.includes(idToAdd));
        state[key] = [...currentArray, ...nextIds];
      } else {
        state[key] = currentArray.filter(currentId => !idsToManage.includes(currentId));
      }
    },
  },
});

/**
 * Hook to access plugins reducer state by key with inferred return type.
 */
export const usePluginsState = <K extends keyof PluginsState>(key: K): PluginsStateValueByKey[K] =>
  useSelector((state: RootState) => state.plugins[key]);

export const useIsInstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.installing.includes(id));
export const useIsUninstallingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.unInstalling.includes(id));
export const useIsUpdatingPlugin = (id: string): boolean =>
  useSelector((state: RootState) => state.plugins.updating.includes(id));

export const pluginsActions = pluginsSlice.actions;

export default pluginsSlice.reducer;
