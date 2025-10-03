import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {PatreonUserData, SubscribeStages} from '../../../../../cross/CrossTypes';
import {RootState} from '../Store';

type UserState = {
  patreonUserData: PatreonUserData;
  patreonLoggedIn: boolean;
  updateChannel: SubscribeStages;
};

type UserStateTypes = {
  [K in keyof UserState]: UserState[K];
};

const initialState: UserState = {
  patreonUserData: {
    tier: 'Not available',
    name: 'Guest',
    imageUrl: '',
    subscribeStage: 'public',
  },
  patreonLoggedIn: false,
  updateChannel: 'public',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserState: <K extends keyof UserState>(
      state: UserState,
      action: PayloadAction<{
        key: K;
        value: UserState[K];
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    resetUserState: <K extends keyof UserState>(state: UserState, action: PayloadAction<K>) => {
      state[action.payload] = initialState[action.payload];
    },
    setUpdateChannel: (state: UserState, action: PayloadAction<SubscribeStages>) => {
      state.updateChannel = action.payload;
    },
  },
});

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useUserState = <K extends keyof UserState>(key: K): UserStateTypes[K] =>
  useSelector((state: RootState) => state.user[key]);

export const userActions = userSlice.actions;

export default userSlice.reducer;
