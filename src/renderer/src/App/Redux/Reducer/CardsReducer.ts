import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {includes} from 'lodash';
import {useSelector} from 'react-redux';

import {OnUpdatingExtensions} from '../../../../../cross/IpcChannelAndTypes';
import {InstalledCards} from '../../../../../cross/StorageTypes';
import rendererIpc from '../../RendererIpc';
import {RunningCard, UpdatingCard, UpdatingCards} from '../../Utils/Types';
import {RootState} from '../Store';

type CardsState = {
  installedCards: InstalledCards;
  autoUpdate: string[];
  autoUpdateExtensions: string[];
  updatingExtensions: OnUpdatingExtensions | undefined;
  checkUpdateInterval: number;

  updatingCards: UpdatingCards;
  updateAvailable: string[];

  pinnedCards: string[];
  recentlyUsedCards: string[];
  runningCard: RunningCard[];
  webViewZoomFactor: {id: string; zoom: number}[];
  homeCategory: string[];
  duplicates: {ogID: string; id: string; title: string}[];
};

type CardsStateTypes = {
  [K in keyof CardsState]: CardsState[K];
};

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
  webViewZoomFactor: [],
  duplicates: [],
  checkUpdateInterval: 30,
};

const cardsSlice = createSlice({
  initialState,
  name: 'cards',
  reducers: {
    updateZoomFactor: (state, action: PayloadAction<{id: string; zoom: number}>) => {
      const factor = state.webViewZoomFactor;
      const existFactor = factor.findIndex(zoom => zoom.id === action.payload.id);

      if (existFactor !== -1) {
        factor[existFactor] = action.payload;
      } else {
        factor.push(action.payload);
      }

      state.webViewZoomFactor = [...factor];

      rendererIpc.storageUtils.updateZoomFactor(action.payload);
    },
    setZoomFactor: (state, action: PayloadAction<{id: string; zoom: number}[]>) => {
      state.webViewZoomFactor = action.payload;
    },

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

    addRunningCard: (state, action: PayloadAction<{tabId: string; id: string}>) => {
      const {tabId, id} = action.payload;
      state.runningCard = [
        ...state.runningCard,
        {tabId, id, webUIAddress: '', currentView: 'terminal', startTime: new Date().toString()},
      ];
    },
    setRunningCardAddress: (state, action: PayloadAction<{tabId: string; address: string}>) => {
      const {tabId, address} = action.payload;
      state.runningCard = state.runningCard.map(card => (card.tabId === tabId ? {...card, address} : card));
    },
    setRunningCardView: (state, action: PayloadAction<{tabId: string; view: 'browser' | 'terminal'}>) => {
      const {tabId, view} = action.payload;
      state.runningCard = state.runningCard.map(card => (card.tabId === tabId ? {...card, currentView: view} : card));
    },
    toggleRunningCardView: (state, action: PayloadAction<{tabId: string}>) => {
      const {tabId} = action.payload;
      state.runningCard = state.runningCard.map(card => {
        const currentView = card.currentView === 'browser' ? 'terminal' : 'browser';
        return card.tabId === tabId ? {...card, currentView} : card;
      });
    },
    stopRunningCard: (state, action: PayloadAction<{tabId: string}>) => {
      state.runningCard = state.runningCard.filter(card => card.tabId !== action.payload.tabId);
    },
  },
});

export const useCardsState = <T extends keyof CardsState>(name: T): CardsStateTypes[T] =>
  useSelector((state: RootState) => state.cards[name]);

export const cardsActions = cardsSlice.actions;

export default cardsSlice.reducer;
