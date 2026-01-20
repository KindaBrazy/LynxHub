import {OnUpdatingExtensions} from '@lynx_cross/types/ipc';
import {InstalledCards} from '@lynx_cross/types/storage';
import browserIpc from '@lynx_shared/ipc/browser';
import ptyIpc from '@lynx_shared/ipc/pty';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {includes} from 'lodash';
import {useSelector} from 'react-redux';

import {UpdatingCard} from '../../types';
import {CardsState} from '../../types/reducers';
import {RootState} from '../store';

type CardsStateTypes = {
  [K in keyof CardsState]: CardsState[K];
};

// Default initial state - actual values come from preloadedState in Store.ts
const initialState: CardsState = {
  autoUpdate: [],
  installedCards: [],
  pinnedCards: [],
  updateAvailable: [],
  updatingCards: [],
  runningCard: [],
  recentlyUsedCards: [],
  homeCategory: [],
  autoUpdateExtensions: [],
  updatingExtensions: undefined,
  duplicates: [],
  checkUpdateInterval: 0,
  activeTab: '',
  browserDomReadyIds: [],
};

const cardsSlice = createSlice({
  initialState,
  name: 'cards',
  reducers: {
    addUpdateAvailable: (state, action: PayloadAction<string>) => {
      if (!includes(state.updateAvailable, action.payload)) {
        state.updateAvailable = [...state.updateAvailable, action.payload];
      }
    },
    setUpdateAvailable: (state, action: PayloadAction<string[]>) => {
      state.updateAvailable = action.payload;
    },
    removeUpdateAvailable: (state, action: PayloadAction<string>) => {
      state.updateAvailable = state.updateAvailable.filter(card => card !== action.payload);
    },
    setUpdatingExtensions: (state, action: PayloadAction<OnUpdatingExtensions | undefined>) => {
      state.updatingExtensions = action.payload;
    },

    setUpdateInterval: (state, action: PayloadAction<number>) => {
      state.checkUpdateInterval = action.payload;
    },

    addUpdatingCard: (state, action: PayloadAction<UpdatingCard>) => {
      if (!includes(state.updatingCards, action.payload)) {
        state.updatingCards = [...state.updatingCards, action.payload];
      }
    },
    removeUpdatingCard: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      state.updatingCards = state.updatingCards.filter(card => card.id !== cardId);
    },

    setAutoUpdate: (state, action: PayloadAction<string[]>) => {
      state.autoUpdate = action.payload;
    },
    setAutoUpdateExtensions: (state, action: PayloadAction<string[]>) => {
      state.autoUpdateExtensions = action.payload;
    },
    setInstalledCards: (state, action: PayloadAction<InstalledCards>) => {
      state.installedCards = action.payload;
    },
    setPinnedCards: (state, action: PayloadAction<string[]>) => {
      state.pinnedCards = action.payload;
    },
    setHomeCategory: (state, action: PayloadAction<string[]>) => {
      state.homeCategory = action.payload;
    },
    setRecentlyUsedCards: (state, action: PayloadAction<string[]>) => {
      state.recentlyUsedCards = action.payload;
    },
    setDuplicates: (state, action: PayloadAction<{ogID: string; id: string; title: string}[]>) => {
      state.duplicates = action.payload;
    },

    addDomReady: (state, action: PayloadAction<string>) => {
      if (!state.browserDomReadyIds.includes(action.payload)) {
        state.browserDomReadyIds = [...state.browserDomReadyIds, action.payload];
      }
    },

    addRunningEmpty: (state, action: PayloadAction<{tabId: string; type: 'browser' | 'terminal' | 'both'}>) => {
      const {tabId, type} = action.payload;

      const id = `${tabId}_${type}`;
      const currentView = type === 'browser' ? 'browser' : 'terminal';

      state.runningCard = [
        ...state.runningCard,
        {
          tabId,
          type,
          id,
          currentView,
          webUIAddress: '',
          customAddress: '',
          currentAddress: '',
          browserTitle: 'Browser',
          startTime: new Date().toString(),
          isEmptyRunning: true,
        },
      ];

      if (type !== 'terminal') browserIpc.send.createBrowser(id);
      if (type !== 'browser') ptyIpc.emptyProcess(id);
    },

    addRunningCard: (state, action: PayloadAction<{tabId: string; id: string}>) => {
      const {tabId, id} = action.payload;
      state.runningCard = [
        ...state.runningCard,
        {
          tabId,
          id,
          type: 'both',
          webUIAddress: '',
          customAddress: '',
          currentAddress: '',
          browserTitle: 'Browser',
          currentView: 'terminal',
          startTime: new Date().toString(),
          isEmptyRunning: false,
        },
      ];
      browserIpc.send.createBrowser(id);
    },
    setRunningCardAddress: (state, action: PayloadAction<{tabId: string; address: string}>) => {
      const {tabId, address} = action.payload;
      state.runningCard = state.runningCard.map(card =>
        card.tabId === tabId
          ? {
              ...card,
              webUIAddress: address,
            }
          : card,
      );
    },
    setRunningCardCustomAddress: (state, action: PayloadAction<{tabId: string; address: string}>) => {
      const {tabId, address} = action.payload;
      state.runningCard = state.runningCard.map(card =>
        card.tabId === tabId
          ? {
              ...card,
              customAddress: address,
            }
          : card,
      );
    },
    setRunningCardCurrentAddress: (state, action: PayloadAction<{tabId: string; address: string}>) => {
      const {tabId, address} = action.payload;
      state.runningCard = state.runningCard.map(card =>
        card.tabId === tabId
          ? {
              ...card,
              currentAddress: address,
            }
          : card,
      );
    },
    setRunningCardView: (state, action: PayloadAction<{tabId: string; view: 'browser' | 'terminal'}>) => {
      const {tabId, view} = action.payload;
      state.runningCard = state.runningCard.map(card => (card.tabId === tabId ? {...card, currentView: view} : card));
    },
    setRunningCardBrowserTitle: (state, action: PayloadAction<{tabId: string; title: string}>) => {
      const {tabId, title} = action.payload;
      state.runningCard = state.runningCard.map(card => (card.tabId === tabId ? {...card, browserTitle: title} : card));
    },
    toggleRunningCardView: (state, action: PayloadAction<{tabId: string}>) => {
      if (!state.runningCard) return;

      const {tabId} = action.payload;
      state.runningCard = state.runningCard.map(card => {
        const currentView = card.currentView === 'browser' ? 'terminal' : 'browser';
        return card.tabId === tabId ? {...card, currentView} : card;
      });
    },
    stopRunningCard: (state, action: PayloadAction<{tabId: string}>) => {
      const id = state.runningCard.find(card => card.tabId === action.payload.tabId)?.id;
      if (id) {
        browserIpc.send.removeBrowser(id);
        state.browserDomReadyIds = state.browserDomReadyIds.filter(item => item !== id);
      }

      state.runningCard = state.runningCard.filter(card => card.tabId !== action.payload.tabId);
    },
  },
});

export const useCardsState = <T extends keyof CardsState>(name: T): CardsStateTypes[T] =>
  useSelector((state: RootState) => state.cards[name]);

export const cardsActions = cardsSlice.actions;

export default cardsSlice.reducer;
