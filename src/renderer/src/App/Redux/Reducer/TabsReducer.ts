import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../Store';

type Tab = {
  id: string;
  title: string;
  isTerminal: boolean;
  content: string;
  icon: string;
};

type TabState = {
  tabs: Tab[];
  activeTab: string;
  prevTab: string;
};

type TabStateTypes = {
  [K in keyof TabState]: TabState[K];
};

const initialState: TabState = {
  tabs: [],
  activeTab: '',
  prevTab: '',
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    setAppState: <K extends keyof TabState>(state: TabState, action: PayloadAction<{key: K; value: TabState[K]}>) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const useTabsState = <K extends keyof TabState>(key: K): TabStateTypes[K] =>
  useSelector((state: RootState) => state.tabs[key]);

export const tabsActions = tabsSlice.actions;

export default tabsSlice.reducer;
