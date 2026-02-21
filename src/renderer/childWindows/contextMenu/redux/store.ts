import {configureStore} from '@reduxjs/toolkit';

import context from './reducer';

export const store = configureStore({reducer: {context}});

/**
 * The root state type of the context menu store.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * The dispatch type of the context menu store.
 */
export type ContextDispatch = typeof store.dispatch;
