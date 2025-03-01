import {configureStore} from '@reduxjs/toolkit';

import {extensionsData} from '../Extensions/ExtensionLoader';
import cardsReducer from './Reducer/CardsReducer';
import modalsReducer from './Reducer/ModalsReducer';
import appReducer from './Reducer/AppReducer';
import settingsReducer from './Reducer/SettingsReducer';
import terminalReducer from './Reducer/TerminalReducer';
import userReducer from './Reducer/UserReducer';

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
