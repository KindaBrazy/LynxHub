import {capitalize, compact, isNil} from 'lodash';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {APP_BUILD_NUMBER, PageTitleByPageId} from '../../../../cross/CrossConstants';
import {toMs} from '../../../../cross/CrossUtils';
import AddBreadcrumb_Renderer from '../../../Breadcrumbs';
import {useAllCardMethods} from '../Modules/ModuleLoader';
import {appActions, useAppState} from '../Redux/Reducer/AppReducer';
import {cardsActions, useCardsState} from '../Redux/Reducer/CardsReducer';
import {hotkeysActions} from '../Redux/Reducer/HotkeysReducer';
import {modalActions} from '../Redux/Reducer/ModalsReducer';
import {pluginsActions} from '../Redux/Reducer/PluginsReducer';
import {settingsActions} from '../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../Redux/Reducer/TabsReducer';
import {userActions, useUserState} from '../Redux/Reducer/UserReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';
import {defaultTabItem} from '../Utils/Constants';
import {lynxTopToast} from '../Utils/UtilHooks';

export const useCheckCardsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const installedCards = useCardsState('installedCards');
  const allMethods = useAllCardMethods();

  useEffect(() => {
    const removeListener = rendererIpc.module.onCardsUpdateAvailable((_e, result) => {
      dispatch(cardsActions.setUpdateAvailable(result));
    });

    return () => removeListener();
  }, [dispatch]);

  useEffect(() => {
    const updateMethod = installedCards.map(card => {
      const type = allMethods.find(c => c.id === card.id)?.methods?.['manager']?.updater.updateType;
      if (isNil(type)) return undefined;
      return {
        id: card.id,
        type,
      };
    });
    rendererIpc.module.checkCardsUpdateInterval(compact(updateMethod));
  }, [installedCards, allMethods]);
};

export const useCheckPluginsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moduleUpdateInterval = useRef<NodeJS.Timeout>(undefined);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    const checkForUpdate = () => {
      rendererIpc.plugins.checkForSync(updateChannel);
    };

    checkForUpdate();
    clearInterval(moduleUpdateInterval.current);
    moduleUpdateInterval.current = undefined;
    moduleUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));

    const removeListener = rendererIpc.plugins.onSyncAvailable((_, list) => {
      dispatch(pluginsActions.setPluginsState({key: 'syncList', value: list}));
    });

    return () => removeListener();
  }, [dispatch, updateChannel, moduleUpdateInterval]);
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
  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      if (app.startupLastActivePage) {
        const lastPage = app.lastPage;
        dispatch(
          tabsActions.setActivePage({
            pageID: lastPage,
            title: PageTitleByPageId[lastPage],
            isTerminal: false,
          }),
        );
      }
    });
  }, [dispatch]);
};

export const usePatreon = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useAppState('isOnline');

  useEffect(() => {
    rendererIpc.patreon
      .getInfo()
      .then(userData => {
        dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
        dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
      })
      .catch(console.info);

    const offReleaseChannel = rendererIpc.patreon.onReleaseChannel((_, stage) =>
      dispatch(userActions.setUpdateChannel(stage)),
    );

    return () => offReleaseChannel();
  }, [dispatch, isOnline]);
};

export const useIpcEvents = () => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const removeListener_onInstalledCards = rendererIpc.storageUtils.onInstalledCards((_, cards) => {
      dispatch(cardsActions.setInstalledCards(cards));
    });
    const removeListener_onAutoUpdateCards = rendererIpc.storageUtils.onAutoUpdateCards((_, cards) => {
      dispatch(cardsActions.setAutoUpdate(cards));
    });
    const removeListener_onAutoUpdateExtensions = rendererIpc.storageUtils.onAutoUpdateExtensions((_, cards) => {
      dispatch(cardsActions.setAutoUpdateExtensions(cards));
    });
    const removeListener_onPinnedCardsChange = rendererIpc.storageUtils.onPinnedCardsChange((_, cards) => {
      dispatch(cardsActions.setPinnedCards(cards));
    });
    const removeListener_onRecentlyUsedCardsChange = rendererIpc.storageUtils.onRecentlyUsedCardsChange((_, cards) => {
      dispatch(cardsActions.setRecentlyUsedCards(cards));
    });
    const removeListener_onHomeCategory = rendererIpc.storageUtils.onHomeCategory((_, data) => {
      dispatch(cardsActions.setHomeCategory(data));
    });

    const removeListener_onDarkMode = rendererIpc.win.onDarkMode((_, result) => {
      if (result === 'dark') {
        dispatch(appActions.setAppState({key: 'darkMode', value: true}));
      } else if (result === 'light') {
        dispatch(appActions.setAppState({key: 'darkMode', value: false}));
      }
    });

    const removeListener_onChangeState = rendererIpc.win.onChangeState((_e, result) => {
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

    const removeListener_onConfirmChange = rendererIpc.storageUtils.onConfirmChange((_, type, enable) => {
      dispatch(settingsActions.setSettingsState({key: type, value: enable}));
    });

    return () => {
      removeListener_onInstalledCards();
      removeListener_onAutoUpdateCards();
      removeListener_onAutoUpdateExtensions();
      removeListener_onPinnedCardsChange();
      removeListener_onRecentlyUsedCardsChange();
      removeListener_onHomeCategory();
      removeListener_onDarkMode();
      removeListener_onChangeState();
      removeListener_onConfirmChange();
    };
  }, [dispatch]);

  useEffect(() => {
    const removeListener = rendererIpc.utils.onUpdateAllExtensions((_e, result) => {
      if (result.step === 'done') {
        rendererIpc.pty.process(result.id, 'start', result.id);
        rendererIpc.storageUtils.recentlyUsedCards('update', result.id);
        dispatch(cardsActions.addRunningCard({id: result.id, tabId: activeTab}));
        dispatch(cardsActions.setUpdatingExtensions(undefined));
      }
      dispatch(cardsActions.setUpdatingExtensions(result));
    });

    return () => removeListener();
  }, [dispatch, activeTab]);
};

export const useAppTitleEvents = () => {
  const dispatch = useDispatch<AppDispatch>();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const runningCard = useCardsState('runningCard');

  useEffect(() => {
    const currentView = capitalize(runningCard.find(card => card.tabId === activeTab)?.currentView);
    const title = tabs.find(tab => tab.id === activeTab)?.title;
    dispatch(appActions.setAppTitle(title && `${title} - ${currentView}`));
  }, [runningCard, activeTab, tabs]);
};

export const useHotkeyEvents = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const removeListener = rendererIpc.appWindow.onHotkeysChange((_, input) => {
      dispatch(hotkeysActions.setInput(input));
    });

    return () => removeListener();
  }, []);
};

export const useNewTabEvents = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const [addEmpty, setAddEmpty] = useState<boolean>(false);
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    if (addEmpty) {
      dispatch(
        cardsActions.addRunningEmpty({
          tabId: activeTab,
          type: 'browser',
        }),
      );
      dispatch(
        cardsActions.setRunningCardCustomAddress({
          tabId: activeTab,
          address: targetUrl,
        }),
      );
      setAddEmpty(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const offNewTab = rendererIpc.tab.onNewTab((_, url) => {
      dispatch(tabsActions.addTab(defaultTabItem));
      setAddEmpty(true);
      setTargetUrl(url);
    });

    return () => offNewTab();
  }, []);
};

export const useBrowserEvents = () => {
  const runningCards = useCardsState('runningCard');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const offIsLoading = rendererIpc.browser.onIsLoading((_, id, isLoading) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabLoading({tabID, isLoading}));
    });

    const offTitleChange = rendererIpc.browser.onTitleChange((_, id, title) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) {
        dispatch(tabsActions.setTabTitle({tabID, title}));
        dispatch(cardsActions.setRunningCardBrowserTitle({tabId: tabID, title}));
      }
    });

    const offFavIconChange = rendererIpc.browser.onFavIconChange((_, id, url) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabFavIcon({tabID, show: true, url}));
    });

    const offUrlChange = rendererIpc.browser.onUrlChange((_, id, url) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(cardsActions.setRunningCardCurrentAddress({tabId: tabID, address: url}));
    });

    return () => {
      offIsLoading();
      offTitleChange();
      offFavIconChange();
      offUrlChange();
    };
  }, [runningCards]);
};

export const useContextEvents = () => {
  const runningCards = useCardsState('runningCard');
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const stopAI = (id: string) => {
      const runningCard = runningCards.find(card => card.id === id);
      if (!runningCard) return;

      if (runningCard.isEmptyRunning) {
        rendererIpc.pty.emptyProcess(runningCard.id, 'stop');
      } else {
        rendererIpc.pty.process(runningCard.id, 'stop', runningCard.id);
      }

      dispatch(tabsActions.setActiveTabLoading(false));
      dispatch(tabsActions.setTabIsTerminal({tabID: activeTab, isTerminal: false}));
      dispatch(cardsActions.stopRunningCard({tabId: activeTab}));
      rendererIpc.win.setDiscordRpAiRunning({running: false});
    };

    const offStopAI = rendererIpc.contextMenu.onStopAI((_, id) => stopAI(id));

    const offRelaunchAI = rendererIpc.contextMenu.onRelaunchAI((_, id) => {
      const runningCard = runningCards.find(card => card.id === id);
      if (!runningCard) return;

      stopAI(id);
      setTimeout(() => {
        if (runningCard.isEmptyRunning) {
          dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: runningCard.type}));
        } else {
          rendererIpc.pty.process(runningCard.id, 'start', runningCard.id);
          dispatch(cardsActions.addRunningCard({id: runningCard.id, tabId: activeTab}));
        }
      }, 50);
    });

    return () => {
      offRelaunchAI();
      offStopAI();
    };
  }, [runningCards, dispatch, activeTab]);
};

export const useShowToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const removeListener = rendererIpc.appWindow.onShowToast((_, message, type) => {
      lynxTopToast(dispatch, 'bottom-right')[type](message);
    });

    return () => removeListener();
  }, [dispatch]);
};

export const useListenForUpdateError = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const runningCard = useCardsState('runningCard');

  useEffect(() => {
    const statusError = async () => {
      AddBreadcrumb_Renderer(`Update error 403`);
      dispatch(settingsActions.setSettingsState({key: 'checkCustomUpdate', value: true}));

      const insider = await rendererIpc.statics.getInsider();
      const releases = await rendererIpc.statics.getReleases();

      if (
        insider.currentBuild > APP_BUILD_NUMBER ||
        releases.earlyAccess.build > APP_BUILD_NUMBER ||
        releases.currentBuild > APP_BUILD_NUMBER
      ) {
        dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: true}));
        lynxTopToast(dispatch).info('New Update Available!');

        const isRunningAI = runningCard.some(card => card.tabId === activeTab);
        if (!isRunningAI) {
          dispatch(modalActions.openUpdateApp());
        }
      }
    };

    const offStatusError = rendererIpc.appUpdate.statusError(() => statusError());

    return () => offStatusError();
  }, [dispatch, activeTab, runningCard]);
};
