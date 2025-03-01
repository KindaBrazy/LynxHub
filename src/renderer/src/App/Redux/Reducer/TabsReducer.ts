import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {TabInfo} from '../../../../../cross/CrossTypes';
import {defaultTabItem} from '../../Utils/Constants';
import {RootState} from '../Store';

type TabState = {
  tabs: TabInfo[];
  activeTab: string;
  prevTab: string;
};

type TabStateTypes = {
  [K in keyof TabState]: TabState[K];
};

const initialState: TabState = {
  tabs: [defaultTabItem],
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
    addTab: (state: TabState, action: PayloadAction<TabInfo>) => {
      let newID = action.payload.id;
      let idNumber = 1;

      const checkDuplicateId = () => {
        const existTab = state.tabs.find(tab => tab.id === newID);
        if (existTab) {
          newID = `action.payload.id_${idNumber}`;
          idNumber++;
          checkDuplicateId();
        }
      };

      checkDuplicateId();

      state.tabs.push({...action.payload, id: newID});
    },
    removeTab: (state: TabState, action: PayloadAction<string>) => {
      const tabIdToRemove = action.payload;
      const tabIndexToRemove = state.tabs.findIndex(tab => tab.id === tabIdToRemove);

      state.tabs = state.tabs.filter(tab => tab.id !== tabIdToRemove);

      if (state.activeTab === tabIdToRemove) {
        if (state.tabs.length > 0) {
          const newActiveTabIndex = Math.min(tabIndexToRemove, state.tabs.length - 1);
          state.activeTab = state.tabs[newActiveTabIndex].id;
        } else {
          state.activeTab = defaultTabItem.id;
        }
      }
    },
    setActiveTab: (state: TabState, action: PayloadAction<string>) => {
      state.prevTab = state.activeTab;
      state.activeTab = action.payload;
    },
    setActivePage: (state: TabState, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex(tab => tab.id === state.activeTab);
      if (index !== -1) {
        state.tabs[index] = {...state.tabs[index], pageID: action.payload};
      }
    },
  },
});

export const useTabsState = <K extends keyof TabState>(key: K): TabStateTypes[K] =>
  useSelector((state: RootState) => state.tabs[key]);

export const useActivePage = () => {
  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  return tabs.find(tab => tab.id === activeTab)?.pageID;
};

export const tabsActions = tabsSlice.actions;

export default tabsSlice.reducer;
