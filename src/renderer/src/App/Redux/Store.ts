import {configureStore} from '@reduxjs/toolkit';

import cardsReducer from './AI/CardsReducer';
import modalsReducer from './AI/ModalsReducer';
import appReducer from './App/AppReducer';
import settingsReducer from './App/SettingsReducer';
import userReducer from './User/UserReducer';

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    cards: cardsReducer,
    modals: modalsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
