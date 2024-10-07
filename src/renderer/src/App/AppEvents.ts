import {useModules} from '@renderer/App/Modules/ModulesContext';
import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import {toMs} from '../../../cross/CrossUtils';
import StorageTypes from '../../../cross/StorageTypes';
import {cardsActions, useCardsState} from './Redux/AI/CardsReducer';
import {appActions} from './Redux/App/AppReducer';
import {settingsActions} from './Redux/App/SettingsReducer';
import {AppDispatch} from './Redux/Store';
import {userActions} from './Redux/User/UserReducer';
import rendererIpc from './RendererIpc';

/** Listening for various app events and modify redux states */
export default function useAppEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const installedCards = useCardsState('installedCards');
  const appUpdateInterval = useRef<NodeJS.Timeout>();
  const moduleUpdateInterval = useRef<NodeJS.Timeout>();

  const {getMethod} = useModules();

  useEffect(() => {
    const checkForUpdate = async () => {
      for (const card of installedCards) {
        const {id, dir} = card;
        const updater = getMethod(id, 'manager')?.updater;
        const updateType = updater?.updateType;
        if (!updater || updateType === 'git') {
          const isAvailable = await rendererIpc.git.bCardUpdateAvailable(dir);
          if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        } else {
          const isAvailable = getMethod(id, 'manager')?.updater.updateAvailable?.();
          if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        }
      }
    };

    checkForUpdate();

    clearInterval(appUpdateInterval.current);
    appUpdateInterval.current = undefined;

    appUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));
  }, [installedCards, getMethod]);

  useEffect(() => {
    const checkForUpdate = () => {
      rendererIpc.module.anyUpdateAvailable().then(value => {
        dispatch(settingsActions.setSettingsState({key: 'moduleUpdateAvailable', value}));
      });
    };

    checkForUpdate();

    clearInterval(moduleUpdateInterval.current);
    moduleUpdateInterval.current = undefined;

    moduleUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));
  }, []);

  useEffect(() => {
    //#region Online Status

    const updateOnlineStatus = () => {
      dispatch(appActions.setAppState({key: 'isOnline', value: navigator.onLine}));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    //#endregion

    //#region All Storage Data

    rendererIpc.storage.getAll().then((storage: StorageTypes) => {
      //#region Cards States

      dispatch(cardsActions.setInstalledCards(storage.cards.installedCards));
      dispatch(cardsActions.setAutoUpdate(storage.cards.autoUpdateCards));
      dispatch(cardsActions.setAutoUpdateExtensions(storage.cards.autoUpdateExtensions));
      dispatch(cardsActions.setPinnedCards(storage.cards.pinnedCards));
      dispatch(cardsActions.setRecentlyUsedCards(storage.cards.recentlyUsedCards));
      dispatch(cardsActions.setHomeCategory(storage.app.homeCategory));
      dispatch(cardsActions.setZoomFactor(storage.cards.zoomFactor));
      //#endregion

      //#region Dark Mode

      if (storage.app.darkMode === 'dark') {
        dispatch(appActions.setAppState({key: 'darkMode', value: true}));
      } else if (storage.app.darkMode === 'light') {
        dispatch(appActions.setAppState({key: 'darkMode', value: false}));
      } else {
        rendererIpc.win.getSystemDarkMode().then(result => {
          dispatch(appActions.setAppState({key: 'darkMode', value: result === 'dark'}));
        });
      }
      //#endregion

      //#region App Settings

      dispatch(settingsActions.setSettingsState({key: 'cardsCompactMode', value: storage.cards.cardCompactMode}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDevImage', value: storage.cards.cardsDevImage}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDevName', value: storage.cards.cardsDevName}));
      dispatch(settingsActions.setSettingsState({key: 'cardsDesc', value: storage.cards.cardsDesc}));
      dispatch(settingsActions.setSettingsState({key: 'cardsRepoInfo', value: storage.cards.cardsRepoInfo}));

      dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value: storage.app.tooltipStatus}));
      dispatch(settingsActions.setSettingsState({key: 'closeConfirm', value: storage.app.closeConfirm}));
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: storage.app.terminateAIConfirm}));
      //#endregion

      //#region Others

      if (storage.app.startupLastActivePage) {
        dispatch(appActions.setAppState({key: 'currentPage', value: storage.app.lastPage}));
        navigate(storage.app.lastPage);
      }

      dispatch(settingsActions.setHotkeys(storage.app.hotkeys));
      //#endregion
    });
    //#endregion

    window.electron.ipcRenderer.invoke('patreon-get-info').then(result => {
      dispatch(userActions.setUserState({key: 'patreonUserData', value: result}));
      dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
    });

    window.electron.ipcRenderer.on('release-channel-change', (_, result) => {
      dispatch(userActions.setUpdateChannel(result));
    });

    //#region Other Events

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

    //#endregion
  }, [dispatch, navigate]);
}
