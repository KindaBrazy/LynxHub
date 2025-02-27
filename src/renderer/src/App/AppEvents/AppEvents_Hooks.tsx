import {capitalize, compact, isNil} from 'lodash';
import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router';

import {toMs} from '../../../../cross/CrossUtils';
import StorageTypes from '../../../../cross/StorageTypes';
import {useAllCards, useGetTitleByID} from '../Modules/ModuleLoader';
import {cardsActions, useCardsState} from '../Redux/AI/CardsReducer';
import {appActions, useAppState} from '../Redux/App/AppReducer';
import {settingsActions} from '../Redux/App/SettingsReducer';
import {terminalActions} from '../Redux/App/TerminalReducer';
import {AppDispatch} from '../Redux/Store';
import {userActions} from '../Redux/User/UserReducer';
import rendererIpc from '../RendererIpc';
import {checkEARepos} from './AppEvents_Utils';

export const useCheckCardsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const installedCards = useCardsState('installedCards');
  const allCards = useAllCards();

  useEffect(() => {
    rendererIpc.module.onCardsUpdateAvailable((_e, result) => {
      dispatch(cardsActions.setUpdateAvailable(result));
    });
  }, [dispatch]);

  useEffect(() => {
    const updateMethod = installedCards.map(card => {
      const type = allCards.find(c => c.id === card.id)?.methods?.['manager']?.updater.updateType;
      if (isNil(type)) return undefined;
      return {
        id: card.id,
        type,
      };
    });
    rendererIpc.module.checkCardsUpdateInterval(compact(updateMethod));
  }, [installedCards, allCards]);
};

export const useCheckModulesUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moduleUpdateInterval = useRef<NodeJS.Timeout>(undefined);
  useEffect(() => {
    const checkForUpdate = () => {
      rendererIpc.module.updateAvailableList().then(value => {
        dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value}));
      });
    };

    checkForUpdate();

    clearInterval(moduleUpdateInterval.current);
    moduleUpdateInterval.current = undefined;

    moduleUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));
  }, [dispatch]);
};

export const useCheckExtensionsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const extensionUpdateInterval = useRef<NodeJS.Timeout>(undefined);
  useEffect(() => {
    const checkForUpdate = () => {
      rendererIpc.extension.updateAvailableList().then(value => {
        dispatch(settingsActions.setSettingsState({key: 'extensionsUpdateAvailable', value}));
      });
    };

    checkForUpdate();

    clearInterval(extensionUpdateInterval.current);
    extensionUpdateInterval.current = undefined;

    extensionUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));
  }, [dispatch]);
};

export const useOnlineEvents = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const updateOnlineStatus = () => {
      dispatch(appActions.setAppState({key: 'isOnline', value: navigator.onLine}));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }, [dispatch]);
};

export const useStorageData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    rendererIpc.storage.getAll().then((storage: StorageTypes) => {
      dispatch(cardsActions.setInstalledCards(storage.cards.installedCards));
      dispatch(cardsActions.setAutoUpdate(storage.cards.autoUpdateCards));
      dispatch(cardsActions.setAutoUpdateExtensions(storage.cards.autoUpdateExtensions));
      dispatch(cardsActions.setPinnedCards(storage.cards.pinnedCards));
      dispatch(cardsActions.setRecentlyUsedCards(storage.cards.recentlyUsedCards));
      dispatch(cardsActions.setHomeCategory(storage.app.homeCategory));
      dispatch(cardsActions.setZoomFactor(storage.cards.zoomFactor));
      dispatch(cardsActions.setDuplicates(storage.cards.duplicated));

      dispatch(terminalActions.initState(storage.terminal));

      if (storage.app.darkMode === 'dark') {
        dispatch(appActions.setAppState({key: 'darkMode', value: true}));
      } else if (storage.app.darkMode === 'light') {
        dispatch(appActions.setAppState({key: 'darkMode', value: false}));
      } else {
        rendererIpc.win.getSystemDarkMode().then(result => {
          dispatch(appActions.setAppState({key: 'darkMode', value: result === 'dark'}));
        });
      }

      dispatch(settingsActions.setSettingsState({key: 'cardsCompactMode', value: storage.cards.cardCompactMode}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDevImage', value: storage.cards.cardsDevImage}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDevName', value: storage.cards.cardsDevName}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDesc', value: storage.cards.cardsDesc}));
      dispatch(settingsActions.setSettingsState({key: 'cardsRepoInfo', value: storage.cards.cardsRepoInfo}));

      dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value: storage.app.tooltipStatus}));
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: storage.app.closeConfirm}));
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: storage.app.terminateAIConfirm}));
      dispatch(settingsActions.setSettingsState({key: 'openLastSize', value: storage.app.openLastSize}));
      dispatch(settingsActions.setSettingsState({key: 'dynamicAppTitle', value: storage.app.dynamicAppTitle}));

      if (storage.app.startupLastActivePage) {
        dispatch(appActions.setAppState({key: 'currentPage', value: storage.app.lastPage}));
        navigate(storage.app.lastPage);
      }

      dispatch(settingsActions.setHotkeys(storage.app.hotkeys));
    });
  }, [dispatch, navigate]);
};

export const usePatreon = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useAppState('isOnline');

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke('patreon-get-info')
      .then(result => {
        dispatch(userActions.setUserState({key: 'patreonUserData', value: result}));
        dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));

        checkEARepos(result.earlyAccess);
      })
      .catch(() => {
        if (isOnline) checkEARepos(false);
      });

    window.electron.ipcRenderer.on('release-channel-change', (_, result) => {
      dispatch(userActions.setUpdateChannel(result));
    });
  }, [dispatch, isOnline]);
};

export const useIpcEvents = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    rendererIpc.module.onUpdatedModules((_, updated) => {
      dispatch(settingsActions.addUpdatedModule(updated));
    });
    rendererIpc.storageUtils.onInstalledCards((_, cards) => {
      dispatch(cardsActions.setInstalledCards(cards));
    });
    rendererIpc.storageUtils.onAutoUpdateCards((_, cards) => {
      dispatch(cardsActions.setAutoUpdate(cards));
    });
    rendererIpc.storageUtils.onAutoUpdateExtensions((_, cards) => {
      dispatch(cardsActions.setAutoUpdateExtensions(cards));
    });
    rendererIpc.storageUtils.onPinnedCardsChange((_, cards) => {
      dispatch(cardsActions.setPinnedCards(cards));
    });
    rendererIpc.storageUtils.onRecentlyUsedCardsChange((_, cards) => {
      dispatch(cardsActions.setRecentlyUsedCards(cards));
    });
    rendererIpc.storageUtils.onHomeCategory((_, data) => {
      dispatch(cardsActions.setHomeCategory(data));
    });

    rendererIpc.win.onDarkMode((_, result) => {
      if (result === 'dark') {
        dispatch(appActions.setAppState({key: 'darkMode', value: true}));
      } else if (result === 'light') {
        dispatch(appActions.setAppState({key: 'darkMode', value: false}));
      }
    });

    rendererIpc.win.onChangeState((_e, result) => {
      const {name, value} = result;
      switch (name) {
        case 'focus':
          dispatch(appActions.setAppState({key: 'onFocus', value}));
          break;
        case 'maximize':
          dispatch(appActions.setAppState({key: 'maximized', value}));
          break;
        case 'full-screen':
          dispatch(appActions.setAppState({key: 'fullscreen', value}));
          break;
      }
    });

    rendererIpc.utils.onUpdateAllExtensions((_e, result) => {
      if (result.step === 'done') {
        rendererIpc.pty.process('start', result.id);
        rendererIpc.storageUtils.recentlyUsedCards('update', result.id);
        dispatch(cardsActions.startRunningCard(result.id));
        dispatch(cardsActions.setUpdatingExtensions(undefined));
      }
      dispatch(cardsActions.setUpdatingExtensions(result));
    });
  }, [dispatch]);
};

export const useAppTitleEvents = () => {
  const dispatch = useDispatch<AppDispatch>();
  const runningCard = useCardsState('runningCard');
  const title = useGetTitleByID(runningCard.id);

  useEffect(() => {
    const currentView = capitalize(runningCard.currentView);
    dispatch(appActions.setAppTitle(title && `${title} - ${currentView}`));
  }, [title, runningCard]);
};
