import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';

import {RootState} from '../store';

type ModalsState = {
  updateApp: {
    isOpen: boolean;
  };
  restartModal: {
    isOpen: boolean;
    message: string;
  };
};

type ModalsStateValueByKey = {
  [K in keyof ModalsState]: ModalsState[K];
};

const initialState: ModalsState = {
  updateApp: {
    isOpen: false,
  },
  restartModal: {
    isOpen: false,
    message: '',
  },
};

const modalSlice = createSlice({
  initialState,
  name: 'modals',
  reducers: {
    openUpdateApp: state => {
      state.updateApp.isOpen = true;
    },
    closeUpdateApp: state => {
      state.updateApp.isOpen = false;
    },

    openRestartModal: (state, action: PayloadAction<{message: string}>) => {
      state.restartModal.isOpen = true;
      state.restartModal.message = action.payload.message;
    },
    closeRestartModal: state => {
      state.restartModal.isOpen = false;
      state.restartModal.message = '';
    },
  },
});

/**
 * Hook to access a single modals state field with key-safe typing.
 */
export const useModalsState = <T extends keyof ModalsState>(name: T): ModalsStateValueByKey[T] =>
  useSelector((state: RootState) => state.modals[name]);

export const modalActions = modalSlice.actions;

export default modalSlice.reducer;
