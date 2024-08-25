import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';

import {toMs} from '../../../cross/CrossUtils';
import StorageTypes from '../../../cross/StorageTypes';
import {cardsActions, useCardsState} from './Redux/AI/CardsReducer';
import {appActions} from './Redux/App/AppReducer';
import {settingsActions} from './Redux/App/SettingsReducer';
import {AppDispatch} from './Redux/Store';
import rendererIpc from './RendererIpc';

/** Listening for various app events and modify redux states */
export default function useAppEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const installedCards = useCardsState('installedCards');
  const appUpdateInterval = useRef<NodeJS.Timeout>();
  const moduleUpdateInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkForUpdate = async () => {
      for (const card of installedCards) {
        const {id, dir} = card;
        const isAvailable = await rendererIpc.git.bCardUpdateAvailable(dir);
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
      }
    };

    checkForUpdate();

    clearInterval(appUpdateInterval.current);
    appUpdateInterval.current = undefined;

    appUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));
  }, [installedCards]);

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
      dispatch(cardsActions.setPinnedCards(storage.cards.pinnedCards));
      dispatch(cardsActions.setRecentlyUsedCards(storage.cards.recentlyUsedCards));
      dispatch(cardsActions.setHomeCategory(storage.app.homeCategory));
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

      dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value: storage.app.tooltipStatus}));
      dispatch(settingsActions.setSettingsState({key: 'cardsCompactMode', value: storage.cards.cardCompactMode}));
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
    //#endregion
  }, [dispatch, navigate]);
}
