import {configureStore} from '@reduxjs/toolkit';

import {extensionsData} from '../Extensions/ExtensionLoader';
import cardsReducer from './AI/CardsReducer';
import modalsReducer from './AI/ModalsReducer';
import appReducer from './App/AppReducer';
import settingsReducer from './App/SettingsReducer';
import terminalReducer from './App/TerminalReducer';
import userReducer from './User/UserReducer';

const staticReducers = {
  app: appReducer,
  user: userReducer,
  cards: cardsReducer,
  modals: modalsReducer,
  settings: settingsReducer,
  terminal: terminalReducer,
};

let store = configureStore({
  reducer: staticReducers,
});

export const createStore = () => {
  const extensionReducers = extensionsData.addReducer.reduce((acc, reducer) => {
    acc[reducer.name] = reducer.reducer;
    return acc;
  }, {});

  store = configureStore({
    reducer: {
      ...staticReducers,
      ...extensionReducers,
    },
  });

  return store;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
