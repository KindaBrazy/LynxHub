import {configureStore} from '@reduxjs/toolkit';
import {createReduxEnhancer} from '@sentry/react';

import {extensionsData} from '../Extensions/ExtensionLoader';
import appReducer from './Reducer/AppReducer';
import cardsReducer from './Reducer/CardsReducer';
import hotkeysReducer from './Reducer/HotkeysReducer';
import modalsReducer from './Reducer/ModalsReducer';
import settingsReducer from './Reducer/SettingsReducer';
import tabsReducer from './Reducer/TabsReducer';
import terminalReducer from './Reducer/TerminalReducer';
import userReducer from './Reducer/UserReducer';

const staticReducers = {
  app: appReducer,
  tabs: tabsReducer,
  user: userReducer,
  cards: cardsReducer,
  modals: modalsReducer,
  settings: settingsReducer,
  terminal: terminalReducer,
  hotkeys: hotkeysReducer,
};

let store = configureStore({
  reducer: staticReducers,
});

const sentryReduxEnhancer = createReduxEnhancer({});

export const createStore = (collectError: boolean) => {
  const extensionReducers = extensionsData.addReducer.reduce((acc, reducer) => {
    acc[reducer.name] = reducer.reducer;
    return acc;
  }, {});

  store = configureStore({
    reducer: {
      ...staticReducers,
      ...extensionReducers,
    },
    enhancers: collectError
      ? getDefaultEnhancers => {
          return getDefaultEnhancers().concat(sentryReduxEnhancer);
        }
      : undefined,
  });

  return store;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
