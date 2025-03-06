import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';
import {PullResult} from 'simple-git';

import {RootState} from '../Store';

type ModalsState = {
  installUIModal: {
    isOpen: boolean;
    tabID: string;

    type: 'install' | 'update';
    cardId: string;
    title: string;
  };
  warningModal: {
    isOpen: boolean;

    contentId: 'LOCATE_REPO' | 'CLONE_REPO';
  };
  cardInfoModal: {
    isOpen: boolean;
    tabID: string;

    cardId: string;
    title: string;
    devName: string;
    url: string;
    extensionsDir?: string;
  };
  cardUninstallModal: {
    isOpen: boolean;
    tabID: string;

    cardId: string;
  };
  updateDetails: {
    isOpen: boolean;
    tabID: string;

    title: string;
    details: PullResult;
  };
  cardExtensions: {
    isOpen: boolean;
    tabID: string;

    title: string;
    dir: string;
    id: string;
  };
  cardLaunchConfig: {
    isOpen: boolean;
    tabID: string;

    haveArguments: boolean;
    title: string;
    id: string;
  };
  updateApp: {
    isOpen: boolean;
  };
  readmeModal: {
    isOpen: boolean;
    tabID: string;

    title: string;
    url: string;
  };
  gitManager: {
    isOpen: boolean;
    tabID: string;

    title: string;
    dir: string;
  };
};

type ModalsStateTypes = {
  [K in keyof ModalsState]: ModalsState[K];
};

type CardInfoData = {
  cardId: string;
  title: string;
  devName: string;
  url: string;
  extensionsDir?: string;
  tabID: string;
};

const initialState: ModalsState = {
  cardExtensions: {
    dir: '',
    isOpen: false,
    title: '',
    id: '',
    tabID: '',
  },
  cardInfoModal: {
    cardId: '',

    devName: '',
    extensionsDir: '',
    isOpen: false,
    title: '',
    url: '',
    tabID: '',
  },
  cardLaunchConfig: {
    id: '',
    isOpen: false,
    title: '',
    haveArguments: false,
    tabID: '',
  },
  cardUninstallModal: {
    cardId: '',
    isOpen: false,
    tabID: '',
  },
  updateDetails: {
    details: {
      created: [],
      deleted: [],
      deletions: {},
      files: [],
      insertions: {},
      remoteMessages: {
        all: [],
      },
      summary: {
        changes: 0,
        deletions: 0,
        insertions: 0,
      },
    },
    isOpen: false,
    title: '',
    tabID: '',
  },
  warningModal: {
    contentId: 'CLONE_REPO',
    isOpen: false,
  },
  updateApp: {
    isOpen: false,
  },
  installUIModal: {
    isOpen: false,
    cardId: '',
    title: '',
    type: 'install',
    tabID: '',
  },
  readmeModal: {
    isOpen: false,
    url: '',
    title: '',
    tabID: '',
  },
  gitManager: {
    isOpen: false,
    title: '',
    dir: '',
    tabID: '',
  },
};

const modalSlice = createSlice({
  initialState,
  name: 'modals',
  reducers: {
    openModal: (state, action: PayloadAction<keyof ModalsState>) => {
      state[action.payload].isOpen = true;
    },
    closeModal: (state, action: PayloadAction<keyof ModalsState>) => {
      state[action.payload].isOpen = false;
    },
    setIsOpen: (state, action: PayloadAction<{modalName: keyof ModalsState; isOpen: boolean}>) => {
      state[action.payload.modalName].isOpen = action.payload.isOpen;
    },

    openCardExtensions: (state, action: PayloadAction<{title: string; dir: string; id: string; tabID: string}>) => {
      state.cardExtensions = {...action.payload, isOpen: true};
    },
    openCardLaunchConfig: (
      state,
      action: PayloadAction<{
        haveArguments: boolean;
        title: string;
        id: string;
        tabID: string;
      }>,
    ) => {
      state.cardLaunchConfig = {...action.payload, isOpen: true};
    },
    openUninstallCard: (state, action: PayloadAction<{cardId: string; tabID: string}>) => {
      state.cardUninstallModal = {...action.payload, isOpen: true};
    },
    openUpdateDetails: (state, action: PayloadAction<{title: string; details: PullResult; tabID: string}>) => {
      state.updateDetails = {...action.payload, isOpen: true};
    },
    openGitManager: (state, action: PayloadAction<{title: string; dir: string; tabID: string}>) => {
      state.gitManager = {...action.payload, isOpen: true};
    },
    closeGitManager: state => {
      state.gitManager = initialState.gitManager;
    },

    openCardInfo: (state, action: PayloadAction<CardInfoData>) => {
      state.cardInfoModal = {...action.payload, isOpen: true};
    },
    setInfoCardId: (state, action: PayloadAction<string>) => {
      state.cardInfoModal.cardId = action.payload;
    },
    openReadme: (state, action: PayloadAction<{url: string; title: string; tabID: string}>) => {
      state.readmeModal = {...action.payload, isOpen: true};
    },

    openInstallUICard: (
      state,
      action: PayloadAction<{
        cardId: string;
        type: 'install' | 'update';
        title: string;
        tabID: string;
      }>,
    ) => {
      state.installUIModal = {...action.payload, isOpen: true};
    },

    setWarningContentId: (state, action: PayloadAction<ModalsState['warningModal']['contentId']>) => {
      state.warningModal.contentId = action.payload;
    },
  },
});

export const useModalsState = <T extends keyof ModalsState>(name: T): ModalsStateTypes[T] =>
  useSelector((state: RootState) => state.modals[name]);

export const modalActions = modalSlice.actions;

export default modalSlice.reducer;
