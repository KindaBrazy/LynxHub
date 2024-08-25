import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';
import {PullResult, SimpleGitProgressEvent} from 'simple-git';

import {initGitProgress} from '../../Utils/Constants';
import {RootState} from '../Store';

//#region Initialization & Types

type ModalsState = {
  installModal: {
    isOpen: boolean;

    cardId: string;
    url: string;
    directory: string;
    title: string;

    downloading: boolean;
    downloadProgress: SimpleGitProgressEvent;
  };
  warningModal: {
    isOpen: boolean;

    contentId: 'LOCATE_REPO' | 'CLONE_REPO';
  };
  cardInfoModal: {
    isOpen: boolean;

    cardId: string;
    title: string;
    devName: string;
    url: string;
    extensionsDir?: string;
  };
  cardUninstallModal: {
    isOpen: boolean;
    cardId: string;
  };
  updateDetails: {
    isOpen: boolean;
    title: string;
    details: PullResult;
  };
  cardExtensions: {
    isOpen: boolean;

    title: string;
    dir: string;
  };
  cardLaunchConfig: {
    haveArguments: boolean;
    isOpen: boolean;
    title: string;
    id: string;
  };
  updateApp: {
    isOpen: boolean;
  };
};

type ModalsStateTypes = {
  [K in keyof ModalsState]: ModalsState[K];
};

type InstallCardData = {
  cardId: string;
  url: string;
  directory: string;
  title: string;
};

type CardInfoData = {
  cardId: string;
  title: string;
  devName: string;
  url: string;
  extensionsDir?: string;
};

const initialState: ModalsState = {
  cardExtensions: {
    dir: '',
    isOpen: false,
    title: '',
  },
  cardInfoModal: {
    cardId: '',

    devName: '',
    extensionsDir: '',
    isOpen: false,
    title: '',
    url: '',
  },
  cardLaunchConfig: {
    id: '',
    isOpen: false,
    title: '',
    haveArguments: false,
  },
  cardUninstallModal: {cardId: '', isOpen: false},
  installModal: {
    cardId: '',
    directory: '',
    downloadProgress: initGitProgress,
    downloading: false,
    isOpen: false,
    url: '',
    title: '',
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
  },
  warningModal: {
    contentId: 'CLONE_REPO',
    isOpen: false,
  },
  updateApp: {
    isOpen: false,
  },
};
//#endregion

//#region Slice

const modalSlice = createSlice({
  initialState,
  name: 'modals',
  reducers: {
    //#region General

    openModal: (state, action: PayloadAction<keyof ModalsState>) => {
      state[action.payload].isOpen = true;
    },
    closeModal: (state, action: PayloadAction<keyof ModalsState>) => {
      state[action.payload].isOpen = false;
    },
    setIsOpen: (state, action: PayloadAction<{modalName: keyof ModalsState; isOpen: boolean}>) => {
      state[action.payload.modalName].isOpen = action.payload.isOpen;
    },
    //#endregion

    //#region Open Specif Modal

    openCardExtensions: (state, action: PayloadAction<{title: string; dir: string}>) => {
      state.cardExtensions.title = action.payload.title;
      state.cardExtensions.dir = action.payload.dir;

      state.cardExtensions.isOpen = true;
    },
    openCardLaunchConfig: (state, action: PayloadAction<{haveArguments: boolean; title: string; id: string}>) => {
      state.cardLaunchConfig.haveArguments = action.payload.haveArguments;
      state.cardLaunchConfig.title = action.payload.title;
      state.cardLaunchConfig.id = action.payload.id;

      state.cardLaunchConfig.isOpen = true;
    },
    openUninstallCard: (state, action: PayloadAction<string>) => {
      state.cardUninstallModal.cardId = action.payload;
      state.cardUninstallModal.isOpen = true;
    },
    openUpdateDetails: (state, action: PayloadAction<{title: string; details: PullResult}>) => {
      state.updateDetails.title = action.payload.title;
      state.updateDetails.details = action.payload.details;
      state.updateDetails.isOpen = true;
    },
    //#endregion

    //#region Card Info

    openCardInfo: (state, action: PayloadAction<CardInfoData>) => {
      state.cardInfoModal.cardId = action.payload.cardId;
      state.cardInfoModal.devName = action.payload.devName;
      state.cardInfoModal.title = action.payload.title;
      state.cardInfoModal.url = action.payload.url;
      state.cardInfoModal.extensionsDir = action.payload.extensionsDir;
      state.cardInfoModal.isOpen = true;
    },
    setInfoCardId: (state, action: PayloadAction<string>) => {
      state.cardInfoModal.cardId = action.payload;
    },
    //#endregion

    //#region Install Card
    openInstallCard: (state, action: PayloadAction<InstallCardData>) => {
      state.installModal.cardId = action.payload.cardId;
      state.installModal.url = action.payload.url;
      state.installModal.directory = action.payload.directory;
      state.installModal.title = action.payload.title;
      state.installModal.isOpen = true;
    },
    setInstallDirectory: (state, action: PayloadAction<string>) => {
      state.installModal.directory = action.payload;
    },
    setInstallDownloading: (state, action: PayloadAction<boolean>) => {
      state.installModal.downloading = action.payload;
    },
    setInstallProgress: (state, action: PayloadAction<SimpleGitProgressEvent>) => {
      state.installModal.downloadProgress = action.payload;
    },
    //#endregion

    setWarningContentId: (state, action: PayloadAction<ModalsState['warningModal']['contentId']>) => {
      state.warningModal.contentId = action.payload;
    },
  },
});
//#endregion

//#region Exports & Utils

export const useModalsState = <T extends keyof ModalsState>(name: T): ModalsStateTypes[T] =>
  useSelector((state: RootState) => state.modals[name]);

export const modalActions = modalSlice.actions;

export default modalSlice.reducer;
//#endregion
