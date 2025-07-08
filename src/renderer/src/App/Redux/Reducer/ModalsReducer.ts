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
};

const modalSlice = createSlice({
  initialState,
  name: 'modals',
  reducers: {
    openCardExtensions: (state, action: PayloadAction<{title: string; dir: string; id: string; tabID: string}>) => {
      state.cardExtensions = [...state.cardExtensions, {...action.payload, isOpen: true}];
    },
    closeCardExtensions: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardExtensions = state.cardExtensions.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeCardExtensions: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.cardExtensions = state.cardExtensions.filter(modal => modal.tabID !== tabID);
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
      state.cardLaunchConfig = [...state.cardLaunchConfig, {...action.payload, isOpen: true}];
    },
    closeCardLaunchConfig: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardLaunchConfig = state.cardLaunchConfig.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeCardLaunchConfig: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.cardLaunchConfig = state.cardLaunchConfig.filter(modal => modal.tabID !== tabID);
    },

    openUninstallCard: (state, action: PayloadAction<{cardId: string; tabID: string}>) => {
      state.cardUninstallModal = [...state.cardUninstallModal, {...action.payload, isOpen: true}];
    },
    closeUninstallCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUninstallModal = state.cardUninstallModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeUninstallCard: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.cardUninstallModal = state.cardUninstallModal.filter(modal => modal.tabID !== tabID);
    },

    openUnassignCard: (state, action: PayloadAction<{cardId: string; tabID: string}>) => {
      state.cardUnassignModal = [...state.cardUnassignModal, {...action.payload, isOpen: true}];
    },
    closeUnassignCard: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardUnassignModal = state.cardUnassignModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeUnassignCard: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.cardUnassignModal = state.cardUnassignModal.filter(modal => modal.tabID !== tabID);
    },

    openUpdateDetails: (state, action: PayloadAction<{title: string; details: PullResult; tabID: string}>) => {
      state.updateDetails = {...action.payload, isOpen: true};
    },
    closeUpdateDetails: state => {
      state.updateDetails = initialState.updateDetails;
    },

    openGitManager: (state, action: PayloadAction<{title: string; dir: string; tabID: string}>) => {
      state.gitManager = [...state.gitManager, {...action.payload, isOpen: true}];
    },
    closeGitManager: (state, action: PayloadAction<{tabID: string}>) => {
      state.gitManager = state.gitManager.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeGitManager: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.gitManager = state.gitManager.filter(modal => modal.tabID !== tabID);
    },

    openCardInfo: (state, action: PayloadAction<CardInfoData>) => {
      state.cardInfoModal = [...state.cardInfoModal, {...action.payload, isOpen: true}];
    },
    closeCardInfo: (state, action: PayloadAction<{tabID: string}>) => {
      state.cardInfoModal = state.cardInfoModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeCardInfo: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.cardInfoModal = state.cardInfoModal.filter(modal => modal.tabID !== tabID);
    },
    setInfoCardId: (state, action: PayloadAction<{cardID: string; tabID: string}>) => {
      state.cardInfoModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              cardId: action.payload.cardID,
            }
          : modal,
      );
    },

    openReadme: (state, action: PayloadAction<{url: string; title: string; tabID: string}>) => {
      state.readmeModal = [...state.readmeModal, {...action.payload, isOpen: true}];
    },
    closeReadme: (state, action: PayloadAction<{tabID: string}>) => {
      state.readmeModal = state.readmeModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeReadme: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.readmeModal = state.readmeModal.filter(modal => modal.tabID !== tabID);
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
      state.installUIModal = [...state.installUIModal, {...action.payload, isOpen: true}];
    },

    closeInstallUICard: (state, action: PayloadAction<{tabID: string}>) => {
      state.installUIModal = state.installUIModal.map(modal =>
        modal.tabID === action.payload.tabID
          ? {
              ...modal,
              isOpen: false,
            }
          : modal,
      );
    },
    removeInstallUICard: (state, action: PayloadAction<{tabID: string}>) => {
      const {tabID} = action.payload;
      state.installUIModal = state.installUIModal.filter(modal => modal.tabID !== tabID);
    },

    openUpdateApp: state => {
      state.updateApp.isOpen = true;
    },
    closeUpdateApp: state => {
      state.updateApp.isOpen = false;
    },

    openWarning: state => {
      state.warningModal.isOpen = true;
    },
    closeWarning: state => {
      state.warningModal.isOpen = false;
    },

    setWarningContentId: (state, action: PayloadAction<ModalsState['warningModal']['contentId']>) => {
      state.warningModal.contentId = action.payload;
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

export const useModalsState = <T extends keyof ModalsState>(name: T): ModalsStateTypes[T] =>
  useSelector((state: RootState) => state.modals[name]);

export const modalActions = modalSlice.actions;

export default modalSlice.reducer;
