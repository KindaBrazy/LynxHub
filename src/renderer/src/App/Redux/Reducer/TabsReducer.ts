import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {TabInfo} from '../../../../../cross/CrossTypes';
import {defaultTabItem} from '../../Utils/Constants';
import {RootState} from '../Store';

type TabState = {
  tabs: TabInfo[];
  activeTab: string;
  activePage: string;
  prevTab: string;
};

type TabStateTypes = {
  [K in keyof TabState]: TabState[K];
};

const initialState: TabState = {
  tabs: [defaultTabItem],
  activeTab: defaultTabItem.id,
  activePage: defaultTabItem.pageID,
  prevTab: '',
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    setTabState: <K extends keyof TabState>(state: TabState, action: PayloadAction<{key: K; value: TabState[K]}>) => {
      state[action.payload.key] = action.payload.value;
    },
    addTab: (state: TabState, action: PayloadAction<TabInfo>) => {
      let newID = action.payload.id;
      let idNumber = 1;

      const checkDuplicateId = () => {
        const existTab = state.tabs.find(tab => tab.id === newID);
        if (existTab) {
          newID = `${action.payload.id}_${idNumber}`;
          idNumber++;
          checkDuplicateId();
        }
      };

      checkDuplicateId();

      state.tabs.push({...action.payload, id: newID});
      state.activeTab = newID;
      state.activePage = action.payload.pageID;
    },
    removeTab: (state: TabState, action: PayloadAction<string>) => {
      const tabIdToRemove = action.payload;
      const tabIndexToRemove = state.tabs.findIndex(tab => tab.id === tabIdToRemove);

      state.tabs = state.tabs.filter(tab => tab.id !== tabIdToRemove);

      if (state.activeTab === tabIdToRemove) {
        if (state.tabs.length > 0) {
          const newActiveTabIndex = Math.min(tabIndexToRemove, state.tabs.length - 1);
          state.activeTab = state.tabs[newActiveTabIndex].id;
          state.activePage = state.tabs[newActiveTabIndex].pageID;
        } else {
          state.activeTab = defaultTabItem.id;
          state.activePage = defaultTabItem.pageID;
        }
      }

      if (state.tabs.length <= 0) {
        state.tabs = initialState.tabs;
      }
    },
    setActiveTab: (state: TabState, action: PayloadAction<string>) => {
      state.prevTab = state.activeTab;
      state.activeTab = action.payload;
      state.activePage = state.tabs.find(tab => tab.id === action.payload)?.pageID || defaultTabItem.pageID;
    },
    setTabLoading: (state: TabState, action: PayloadAction<{isLoading: boolean; tabID: string}>) => {
      const {tabID, isLoading} = action.payload;
      state.tabs = state.tabs.map(tab => (tab.id === tabID ? {...tab, isLoading} : tab));
    },
    setActiveTabLoading: (state: TabState, action: PayloadAction<boolean>) => {
      state.tabs = state.tabs.map(tab => (tab.id === state.activeTab ? {...tab, isLoading: action.payload} : tab));
    },
    setTabTitle: (state: TabState, action: PayloadAction<{tabID: string; title: string}>) => {
      const {tabID, title} = action.payload;
      state.tabs = state.tabs.map(tab => (tab.id === tabID ? {...tab, title} : tab));
    },
    setActiveTabTitle: (state: TabState, action: PayloadAction<string>) => {
      state.tabs = state.tabs.map(tab => (tab.id === state.activeTab ? {...tab, title: action.payload} : tab));
    },
    setTabFavIcon: (
      state: TabState,
      action: PayloadAction<{
        show: boolean;
        targetUrl: string;
        tabID: string;
      }>,
    ) => {
      const {tabID, ...favIcon} = action.payload;
      state.tabs = state.tabs.map(tab => (tab.id === tabID ? {...tab, favIcon} : tab));
    },
    setActivePage: (
      state: TabState,
      action: PayloadAction<{
        pageID: string;
        title: string;
        isTerminal: boolean;
        favIcon: {show: boolean; targetUrl: string};
      }>,
    ) => {
      const index = state.tabs.findIndex(tab => tab.id === state.activeTab);
      if (index !== -1) {
        const {pageID, title, isTerminal, favIcon} = action.payload;
        state.tabs[index] = {...state.tabs[index], pageID, title, isTerminal, favIcon};
      }
      state.activePage = action.payload.pageID;
    },
  },
});

export const useTabsState = <K extends keyof TabState>(key: K): TabStateTypes[K] =>
  useSelector((state: RootState) => state.tabs[key]);

export const tabsActions = tabsSlice.actions;

export default tabsSlice.reducer;
