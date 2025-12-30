import {configureStore} from '@reduxjs/toolkit';
import {createReduxEnhancer} from '@sentry/react';

import {extensionsData} from '../Extensions/ExtensionLoader';
import rendererIpc from '../RendererIpc';
import appReducer from './Reducer/AppReducer';
import cardsReducer from './Reducer/CardsReducer';
import hotkeysReducer from './Reducer/HotkeysReducer';
import modalsReducer from './Reducer/ModalsReducer';
import pluginsReducer from './Reducer/PluginsReducer';
import settingsReducer from './Reducer/SettingsReducer';
import tabsReducer from './Reducer/TabsReducer';
import terminalReducer from './Reducer/TerminalReducer';
import userReducer from './Reducer/UserReducer';
import volumeReducer from './Reducer/VolumeReducer';
import {getStorageData, getSystemDarkMode} from './StorageInit';

const staticReducers = {
  app: appReducer,
  tabs: tabsReducer,
  user: userReducer,
  cards: cardsReducer,
  modals: modalsReducer,
  settings: settingsReducer,
  terminal: terminalReducer,
  hotkeys: hotkeysReducer,
  plugins: pluginsReducer,
  volume: volumeReducer,
};

const sentryReduxEnhancer = createReduxEnhancer({});

const buildPreloadedState = () => {
  const storage = getStorageData();
  if (!storage) return undefined;

  // Compute dark mode
  let darkMode: boolean;
  if (storage.app.darkMode === 'dark') {
    darkMode = true;
  } else if (storage.app.darkMode === 'light') {
    darkMode = false;
  } else {
    darkMode = getSystemDarkMode() === 'dark';
  }

  // Compute wizard state
  let showWizard: boolean;
  let isUpgradeFlow: boolean = false;
  const oldSetupDone = storage.app.initialized;
  const newSetupDone = storage.app.inited;
  const isWindows = window.osPlatform === 'win32';

  if (newSetupDone) {
    showWizard = false;
  } else {
    if (oldSetupDone && !isWindows) {
      rendererIpc.storage.update('app', {inited: true});
      showWizard = false;
    } else {
      isUpgradeFlow = oldSetupDone;
      showWizard = true;
    }
  }

  return {
    app: {
      darkMode,
      fullscreen: false,
      isOnline: false,
      maximized: false,
      onFocus: true,
      navBar: true,
      appTitle: undefined,
      toastPlacement: 'top-center' as const,
      initializer: {showWizard, isUpgradeFlow},
    },
    cards: {
      autoUpdate: storage.cards.autoUpdateCards,
      installedCards: storage.cards.installedCards,
      pinnedCards: storage.cards.pinnedCards,
      updateAvailable: [],
      updatingCards: [],
      runningCard: [],
      recentlyUsedCards: storage.cards.recentlyUsedCards,
      homeCategory: storage.app.homeCategory,
      autoUpdateExtensions: storage.cards.autoUpdateExtensions,
      updatingExtensions: undefined,
      duplicates: storage.cards.duplicated,
      checkUpdateInterval: storage.cards.checkUpdateInterval,
      activeTab: '',
      browserDomReadyIds: [],
    },
    hotkeys: {
      input: {key: '', shift: false, control: false, alt: false, meta: false, type: ''},
      isCtrlPressed: false,
      isShiftPressed: false,
      isAltPressed: false,
      isMetaPressed: false,
      key: '',
      type: '',
      copyPressed: false,
      hotkeys: storage.app.hotkeys,
    },
    settings: {
      tooltipLevel: storage.app.tooltipStatus,
      closeConfirm: storage.app.closeConfirm,
      closeTabConfirm: storage.app.closeTabConfirm,
      terminateAIConfirm: storage.app.terminateAIConfirm,
      openLastSize: storage.app.openLastSize,
      updatedModules: [],
      newModules: [],
      updateAvailable: false,
      dynamicAppTitle: storage.app.dynamicAppTitle,
      openLinkExternal: storage.app.openLinkExternal,
      hardwareAcceleration: storage.app.hardwareAcceleration,
      disableLoadingAnimations: storage.app.disableLoadingAnimations,
      checkCustomUpdate: false,
    },
    terminal: storage.terminal,
    volume: {
      tabVolumes: storage.browser.volumeSettings?.tabVolumes || {},
      tabMuted: {},
      tabAudioPlaying: {},
      globalMuted: storage.browser.volumeSettings?.globalMuted ?? false,
    },
  };
};

let store = configureStore({
  reducer: staticReducers,
});

export const createStore = (collectError: boolean) => {
  const extensionReducers = extensionsData.addReducer.reduce((acc, reducer) => {
    acc[reducer.name] = reducer.reducer;
    return acc;
  }, {});

  const preloadedState = buildPreloadedState();

  store = configureStore({
    reducer: {
      ...staticReducers,
      ...extensionReducers,
    },
    preloadedState,
    enhancers: collectError
      ? getDefaultEnhancers => {
          return getDefaultEnhancers().concat(sentryReduxEnhancer);
        }
      : undefined,
  });

  return store;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
