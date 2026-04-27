import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';
import {PullResult} from 'simple-git';

import {RootState} from '../store';

type ModalsState = {
  installUIModal: {
    isOpen: boolean;
    tabID: string;

    type: 'install' | 'update';
    cardId: string;
    title: string;
  }[];
  cardInfoModal: {
    isOpen: boolean;
    tabID: string;

    cardId: string;
    title: string;
    devName: string;
    url: string;
    extensionsDir?: string;
  }[];
  cardUninstallModal: {
    isOpen: boolean;
    tabID: string;

    cardId: string;
  }[];
  cardUnassignModal: {
    isOpen: boolean;
    tabID: string;

    cardId: string;
  }[];
  updateDetails: {
    isOpen: boolean;

    title: string;
    details: PullResult;
    tabID: string;
  };
  cardExtensions: {
    isOpen: boolean;
    tabID: string;

    title: string;
    dir: string;
    id: string;
  }[];
  cardLaunchConfig: {
    isOpen: boolean;
    tabID: string;

    haveArguments: boolean;
    title: string;
    id: string;
  }[];
  readmeModal: {
    isOpen: boolean;
    tabID: string;

    title: string;
    url: string;
  }[];
  gitManager: {
    isOpen: boolean;
    tabID: string;

    title: string;
    dir: string;
  }[];
  updateApp: {
    isOpen: boolean;
  };
  warningModal: {
    isOpen: boolean;
    contentId: 'LOCATE_REPO' | 'CLONE_REPO';
  };
  restartModal: {
    isOpen: boolean;
    message: string;
  };
};

type ModalsStateValueByKey = {
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

type ModalWithTabId = {
  isOpen: boolean;
  tabID: string;
};

const closeTabModal = <T extends ModalWithTabId>(items: T[], tabID: string): T[] =>
  items.map(modal => (modal.tabID === tabID ? {...modal, isOpen: false} : modal));

const removeTabModal = <T extends ModalWithTabId>(items: T[], tabID: string): T[] =>
  items.filter(modal => modal.tabID !== tabID);

const initialState: ModalsState = {
  cardExtensions: [],
  cardInfoModal: [],
  cardLaunchConfig: [],
  cardUninstallModal: [],
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
  installUIModal: [],
  readmeModal: [],
  gitManager: [],
  warningModal: {
    contentId: 'CLONE_REPO',
    isOpen: false,
  },
  updateApp: {
    isOpen: false,
  },
  cardUnassignModal: [],
  restartModal: {
    isOpen: false,
    message: '',
  },
};

const modalSlice = createSlice({
  initialState,
  name: 'modals',
  reducers: {
    openCardExtensions: (state, action: PayloadAction<{title: string; dir: string; id: string; tabID: string}>) => {
      state.cardExtensions.push({...action.payload, isOpen: true});
    },
    closeCardExtensions: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardExtensions = closeTabModal(state.cardExtensions, action.payload.tabID);
    },
    removeCardExtensions: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardExtensions = removeTabModal(state.cardExtensions, action.payload.tabID);
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
      state.cardLaunchConfig.push({...action.payload, isOpen: true});
    },
    closeCardLaunchConfig: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardLaunchConfig = closeTabModal(state.cardLaunchConfig, action.payload.tabID);
    },
    removeCardLaunchConfig: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardLaunchConfig = removeTabModal(state.cardLaunchConfig, action.payload.tabID);
    },

    openUninstallCard: (state, action: PayloadAction<{cardId: string; tabID: string}>) => {
      state.cardUninstallModal.push({...action.payload, isOpen: true});
    },
    closeUninstallCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUninstallModal = closeTabModal(state.cardUninstallModal, action.payload.tabID);
    },
    removeUninstallCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUninstallModal = removeTabModal(state.cardUninstallModal, action.payload.tabID);
    },

    openUnassignCard: (state, action: PayloadAction<{cardId: string; tabID: string}>) => {
      state.cardUnassignModal.push({...action.payload, isOpen: true});
    },
    closeUnassignCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUnassignModal = closeTabModal(state.cardUnassignModal, action.payload.tabID);
    },
    removeUnassignCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUnassignModal = removeTabModal(state.cardUnassignModal, action.payload.tabID);
    },

    openUpdateDetails: (state, action: PayloadAction<{title: string; details: PullResult; tabID: string}>) => {
      state.updateDetails = {...action.payload, isOpen: true};
    },
    closeUpdateDetails: state => {
      state.updateDetails = initialState.updateDetails;
    },

    openGitManager: (state, action: PayloadAction<{title: string; dir: string; tabID: string}>) => {
      state.gitManager.push({...action.payload, isOpen: true});
    },
    closeGitManager: (state, action: PayloadAction<{tabID: string}>) => {
      state.gitManager = closeTabModal(state.gitManager, action.payload.tabID);
    },
    removeGitManager: (state, action: PayloadAction<{tabID: string}>) => {
      state.gitManager = removeTabModal(state.gitManager, action.payload.tabID);
    },

    openCardInfo: (state, action: PayloadAction<CardInfoData>) => {
      state.cardInfoModal.push({...action.payload, isOpen: true});
    },
    closeCardInfo: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardInfoModal = closeTabModal(state.cardInfoModal, action.payload.tabID);
    },
    removeCardInfo: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardInfoModal = removeTabModal(state.cardInfoModal, action.payload.tabID);
    },
    setInfoCardId: (state, action: PayloadAction<{cardID: string; tabID: string}>) => {
      state.cardInfoModal = state.cardInfoModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              cardId: action.payload.cardID,
            }
          : modal,
      );
    },

    openReadme: (state, action: PayloadAction<{url: string; title: string; tabID: string}>) => {
      state.readmeModal.push({...action.payload, isOpen: true});
    },
    closeReadme: (state, action: PayloadAction<{tabID: string}>) => {
      state.readmeModal = closeTabModal(state.readmeModal, action.payload.tabID);
    },
    removeReadme: (state, action: PayloadAction<{tabID: string}>) => {
      state.readmeModal = removeTabModal(state.readmeModal, action.payload.tabID);
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
      state.installUIModal.push({...action.payload, isOpen: true});
    },

    closeInstallUICard: (state, action: PayloadAction<{tabID: string}>) => {
      state.installUIModal = closeTabModal(state.installUIModal, action.payload.tabID);
    },
    removeInstallUICard: (state, action: PayloadAction<{tabID: string}>) => {
      state.installUIModal = removeTabModal(state.installUIModal, action.payload.tabID);
    },

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

    removeAllModalsForTabId: (state, action: PayloadAction<{tabId: string}>) => {
      state.cardExtensions = state.cardExtensions.filter(modal => modal.tabID !== action.payload.tabId);
      state.cardLaunchConfig = state.cardLaunchConfig.filter(modal => modal.tabID !== action.payload.tabId);
      state.cardUninstallModal = state.cardUninstallModal.filter(modal => modal.tabID !== action.payload.tabId);
      state.gitManager = state.gitManager.filter(modal => modal.tabID !== action.payload.tabId);
      state.cardInfoModal = state.cardInfoModal.filter(modal => modal.tabID !== action.payload.tabId);
      state.readmeModal = state.readmeModal.filter(modal => modal.tabID !== action.payload.tabId);
      state.installUIModal = state.installUIModal.filter(modal => modal.tabID !== action.payload.tabId);
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
