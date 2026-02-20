import {configureStore} from '@reduxjs/toolkit';

import context from './reducer';

export const store = configureStore({reducer: {context}});
export type RootState = ReturnType<typeof store.getState>;
export type ContextDispatch = typeof store.dispatch;
