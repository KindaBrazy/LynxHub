import {configureStore} from '@reduxjs/toolkit';

import cardsReducer from './AI/CardsReducer';
import modalsReducer from './AI/ModalsReducer';
import appReducer from './App/AppReducer';
import settingsReducer from './App/SettingsReducer';

export const store = configureStore({
  reducer: {
    app: appReducer,
    cards: cardsReducer,
    modals: modalsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
