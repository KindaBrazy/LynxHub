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
import {settingsActions} from '../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../Redux/Reducer/TabsReducer';
import {userActions} from '../Redux/Reducer/UserReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';
import {defaultTabItem} from '../Utils/Constants';
import {lynxTopToast} from '../Utils/UtilHooks';
import {checkSubscribeStage} from './AppEvents_Utils';

export const useCheckCardsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const installedCards = useCardsState('installedCards');
  const allMethods = useAllCardMethods();

  useEffect(() => {
    rendererIpc.module.onCardsUpdateAvailable((_e, result) => {
      dispatch(cardsActions.setUpdateAvailable(result));
    });
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

  useEffect(() => {
    const checkForUpdate = () => {
      rendererIpc.plugins.checkForUpdates('insider');
    };

    checkForUpdate();
    clearInterval(moduleUpdateInterval.current);
    moduleUpdateInterval.current = undefined;
    moduleUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));

    const removeListener = rendererIpc.plugins.onUpdateAvailableList((_, list) => {
      dispatch(settingsActions.setSettingsState({key: 'pluginUpdateAvailableList', value: list}));
    });

    return () => removeListener();
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
    window.electron.ipcRenderer
      .invoke('patreon-get-info')
      .then(result => {
        dispatch(userActions.setUserState({key: 'patreonUserData', value: result}));
        dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));

        checkSubscribeStage(result.earlyAccess, result.insider);
      })
      .catch(console.info);

    window.electron.ipcRenderer.on('release-channel-change', (_, result) => {
      dispatch(userActions.setUpdateChannel(result));
    });
  }, [dispatch, isOnline]);
};

export const useIpcEvents = () => {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
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

    rendererIpc.storageUtils.onConfirmChange((_, type, enable) => {
      dispatch(settingsActions.setSettingsState({key: type, value: enable}));
    });
  }, [dispatch]);

  useEffect(() => {
    rendererIpc.utils.offUpdateAllExtensions();
    rendererIpc.utils.onUpdateAllExtensions((_e, result) => {
      if (result.step === 'done') {
        rendererIpc.pty.process(result.id, 'start', result.id);
        rendererIpc.storageUtils.recentlyUsedCards('update', result.id);
        dispatch(cardsActions.addRunningCard({id: result.id, tabId: activeTab}));
        dispatch(cardsActions.setUpdatingExtensions(undefined));
      }
      dispatch(cardsActions.setUpdatingExtensions(result));
    });
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
    rendererIpc.appWindow.onHotkeysChange((_, input) => {
      dispatch(hotkeysActions.setInput(input));
    });

    return () => {
      rendererIpc.appWindow.offHotkeysChange();
    };
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
    rendererIpc.tab.onNewTab((_, url) => {
      dispatch(tabsActions.addTab(defaultTabItem));
      setAddEmpty(true);
      setTargetUrl(url);
    });

    return () => {
      rendererIpc.tab.offNewTab();
    };
  }, []);
};

export const useBrowserEvents = () => {
  const runningCards = useCardsState('runningCard');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    rendererIpc.browser.offIsLoading();
    rendererIpc.browser.onIsLoading((_, id, isLoading) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabLoading({tabID, isLoading}));
    });

    rendererIpc.browser.offTitleChange();
    rendererIpc.browser.onTitleChange((_, id, title) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) {
        dispatch(tabsActions.setTabTitle({tabID, title}));
        dispatch(cardsActions.setRunningCardBrowserTitle({tabId: tabID, title}));
      }
    });

    rendererIpc.browser.offFavIconChange();
    rendererIpc.browser.onFavIconChange((_, id, url) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabFavIcon({tabID, show: true, url}));
    });

    rendererIpc.browser.offUrlChange();
    rendererIpc.browser.onUrlChange((_, id, url) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(cardsActions.setRunningCardCurrentAddress({tabId: tabID, address: url}));
    });

    return () => {
      rendererIpc.browser.offIsLoading();
      rendererIpc.browser.offTitleChange();
      rendererIpc.browser.offFavIconChange();
      rendererIpc.browser.offUrlChange();
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

    rendererIpc.contextMenu.offStopAI();
    rendererIpc.contextMenu.onStopAI((_, id) => stopAI(id));

    rendererIpc.contextMenu.offRelaunchAI();
    rendererIpc.contextMenu.onRelaunchAI((_, id) => {
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
      rendererIpc.contextMenu.offRelaunchAI();
      rendererIpc.contextMenu.offStopAI();
    };
  }, [runningCards, dispatch, activeTab]);
};

export const useShowToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    rendererIpc.appWindow.offShowToast();
    rendererIpc.appWindow.onShowToast((_, message, type) => {
      lynxTopToast(dispatch, 'bottom-right')[type](message);
    });

    return () => rendererIpc.appWindow.offShowToast();
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

    rendererIpc.appUpdate.statusError(() => statusError());

    return () => rendererIpc.appUpdate.offStatusError();
  }, [dispatch, activeTab, runningCard]);
};
