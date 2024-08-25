import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {includes, isEmpty} from 'lodash';
import {useSelector} from 'react-redux';

import {InstalledCards} from '../../../../../cross/StorageTypes';
import {RunningCard, UpdatingCard, UpdatingCards} from '../../Utils/Types';
import {RootState} from '../Store';

//#region Initialization & Types

type CardsState = {
  installedCards: InstalledCards;
  autoUpdate: string[];

  updatingCards: UpdatingCards;
  updateAvailable: string[];

  pinnedCards: string[];
  recentlyUsedCards: string[];
  runningCard: RunningCard;
  homeCategory: string[];
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
  runningCard: {
    isRunning: false,
    id: '',
    address: '',
    currentView: 'terminal',
    browserId: 'LynxBrowser',
  },
  recentlyUsedCards: [],
  homeCategory: [],
};
//#endregion

//#region Slice

const cardsSlice = createSlice({
  initialState,
  name: 'cards',
  reducers: {
    //#region Update Available

    addUpdateAvailable: (state, action: PayloadAction<string>) => {
      if (!includes(state.updateAvailable, action.payload)) {
        state.updateAvailable = [...state.updateAvailable, action.payload];
      }
    },
    removeUpdateAvailable: (state, action: PayloadAction<string>) => {
      state.updateAvailable = state.updateAvailable.filter(card => card !== action.payload);
    },
    //#endregion

    //#region Updating Card

    addUpdatingCard: (state, action: PayloadAction<UpdatingCard>) => {
      if (!includes(state.updatingCards, action.payload)) {
        state.updatingCards = [...state.updatingCards, action.payload];
      }
    },
    removeUpdatingCard: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      state.updatingCards = state.updatingCards.filter(card => card.id !== cardId);
    },
    //#endregion

    setAutoUpdate: (state, action: PayloadAction<string[]>) => {
      state.autoUpdate = action.payload;
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

    //#region Running Card (AI)

    startRunningCard: (state, action: PayloadAction<string>) => {
      state.runningCard.isRunning = true;
      state.runningCard.id = action.payload;
    },
    setRunningCardAddress: (state, action: PayloadAction<string>) => {
      state.runningCard.address = action.payload;
    },
    setRunningCardView: (state, action: PayloadAction<'browser' | 'terminal'>) => {
      state.runningCard.currentView = action.payload;
    },
    toggleRunningCardView: state => {
      if (!isEmpty(state.runningCard.address)) {
        state.runningCard.currentView = state.runningCard.currentView === 'browser' ? 'terminal' : 'browser';
      }
    },
    stopRunningCard: state => {
      state.runningCard = {
        isRunning: false,
        id: '',
        address: '',
        browserId: 'LynxBrowser',
        currentView: 'terminal',
      };
    },
    //#endregion
  },
});
//#endregion

//#region Exports & Utils

export const useCardsState = <T extends keyof CardsState>(name: T): CardsStateTypes[T] =>
  useSelector((state: RootState) => state.cards[name]);

export const cardsActions = cardsSlice.actions;

export default cardsSlice.reducer;
//#endregion
