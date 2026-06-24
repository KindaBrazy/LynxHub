import {SubscribeStages, UserAccountData} from '@lynx_common/types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type UserState = {
  userData: UserAccountData;
  isLoggedIn: boolean;
  updateChannel: SubscribeStages;
};

type UserStateValueByKey = {
  [K in keyof UserState]: UserState[K];
};

const initialState: UserState = {
  userData: {
    tier: 'Not available',
    name: 'Guest',
    imageUrl: '',
    subscribeStage: 'public',
  },
  isLoggedIn: false,
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
 * @param key - The key of the user state to retrieve
 * @returns The value of the specified user state field
 */
export const useUserState = <K extends keyof UserState>(key: K): UserStateValueByKey[K] =>
  useSelector((state: RootState) => state.user[key]);

export const userActions = userSlice.actions;

export default userSlice.reducer;
