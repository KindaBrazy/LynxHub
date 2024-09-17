import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {PatreonUserData} from '../../../../../cross/CrossTypes';
import {RootState} from '../Store';

//#region Initialization & Types

type UserState = {
  patreonUserData: PatreonUserData;
  patreonLoggedIn: boolean;
  updateChannel: 'ea' | 'public';
};

type UserStateTypes = {
  [K in keyof UserState]: UserState[K];
};

const initialState: UserState = {
  patreonUserData: {
    tier: 'Not available',
    name: 'Guest',
    imageUrl: '',
    earlyAccess: false,
  },
  patreonLoggedIn: false,
  updateChannel: 'public',
};
//#endregion

//#region Slice

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
    setUpdateChannel: (state: UserState, action: PayloadAction<UserState['updateChannel']>) => {
      state.updateChannel = action.payload;
    },
  },
});
//#endregion

//#region Exports & Utils

/**
 * Hook to access app state
 * @param key - The key of the app state to retrieve
 * @returns The value of the specified app state
 */
export const useUserState = <K extends keyof UserState>(key: K): UserStateTypes[K] =>
  useSelector((state: RootState) => state.user[key]);

export const userActions = userSlice.actions;

export default userSlice.reducer;
//#endregion
