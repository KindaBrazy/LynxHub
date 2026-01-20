import {APP_BUILD_NUMBER, PageTitleByPageId} from '@lynx_cross/consts';
import {toMs} from '@lynx_cross/utils';
import rendererIpc from '@lynx_shared/ipc';
import applicationIpc from '@lynx_shared/ipc/application';
import browserIpc from '@lynx_shared/ipc/browser';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {capitalize, compact, isNil} from 'lodash';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../shared/sentry/Breadcrumbs';
import {useRemoveTab} from '../layouts/tabs/utils';
import {useAllCardMethods} from '../plugins/modules';
import {appActions, useAppState} from '../redux/reducers/app';
import {cardsActions, useCardsState} from '../redux/reducers/cards';
import {hotkeysActions} from '../redux/reducers/hotkeys';
import {modalActions} from '../redux/reducers/modals';
import {pluginsActions} from '../redux/reducers/plugins';
import {settingsActions} from '../redux/reducers/settings';
import {tabsActions, useTabsState} from '../redux/reducers/tabs';
import {userActions, useUserState} from '../redux/reducers/user';
import {AppDispatch} from '../redux/store';
import {defaultTabItem} from '../utils/constants';
import {lynxTopToast} from './utils';

export const useCheckCardsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const installedCards = useCardsState('installedCards');
  const allMethods = useAllCardMethods();

  useEffect(() => {
    const removeListener = moduleIpc.onCardsUpdateAvailable(cards => {
      dispatch(cardsActions.setUpdateAvailable(cards));
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
    moduleIpc.checkCardsUpdateInterval(compact(updateMethod));
  }, [installedCards, allMethods]);
};

export const useCheckPluginsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const moduleUpdateInterval = useRef<NodeJS.Timeout>(undefined);
  const updateChannel = useUserState('updateChannel');

  useEffect(() => {
    const checkForUpdate = () => {
      pluginsIpc.checkForSync(updateChannel);
    };

    checkForUpdate();
    clearInterval(moduleUpdateInterval.current);
    moduleUpdateInterval.current = setInterval(checkForUpdate, toMs(30, 'minutes'));

    const removeListener = pluginsIpc.onSyncAvailable(list => {
      dispatch(pluginsActions.setPluginsState({key: 'syncList', value: list}));
    });

    return () => {
      clearInterval(moduleUpdateInterval.current);
      moduleUpdateInterval.current = undefined;
      removeListener();
    };
  }, [dispatch, updateChannel]);
};

export const useOnlineEvents = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const offOnline = rendererIpc.others.onOnline((_, isOnline) => {
      dispatch(appActions.setAppState({key: 'isOnline', value: isOnline}));
    });

    return () => offOnline();
  }, [dispatch]);
};

export const useStorageData = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    storageIpc.get('app').then(app => {
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
    rendererIpc.patreon.getInfo().then(userData => {
      if (userData) {
        dispatch(userActions.setUserState({key: 'patreonUserData', value: userData}));
        dispatch(userActions.setUserState({key: 'patreonLoggedIn', value: true}));
      }
    });

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
    const removeListener_onInstalledCards = storageUtilsIpc.on.onInstalledCards(cards => {
      dispatch(cardsActions.setInstalledCards(cards));
    });
    const removeListener_onAutoUpdateCards = storageUtilsIpc.on.onAutoUpdateCards(cards => {
      dispatch(cardsActions.setAutoUpdate(cards));
    });
    const removeListener_onAutoUpdateExtensions = storageUtilsIpc.on.onAutoUpdateExtensions(cards => {
      dispatch(cardsActions.setAutoUpdateExtensions(cards));
    });
    const removeListener_onPinnedCardsChange = storageUtilsIpc.on.onPinnedCardsChange(cards => {
      dispatch(cardsActions.setPinnedCards(cards));
    });
    const removeListener_onRecentlyUsedCardsChange = storageUtilsIpc.on.onRecentlyUsedCardsChange(cards => {
      dispatch(cardsActions.setRecentlyUsedCards(cards));
    });
    const removeListener_onHomeCategory = storageUtilsIpc.on.onHomeCategory(data => {
      dispatch(cardsActions.setHomeCategory(data));
    });

    const removeListener_onDarkMode = applicationIpc.on.darkMode(isDark => {
      dispatch(appActions.setAppState({key: 'darkMode', value: isDark}));
    });

    const removeListener_onChangeState = applicationIpc.on.windowStateChange(state => {
      const {name, value} = state;
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

    const removeListener_onConfirmChange = storageUtilsIpc.on.onConfirmChange((type, enable) => {
      dispatch(settingsActions.setSettingsState({key: type, value: enable}));
    });

    const offDomReady = browserIpc.on.domReady((id, isReady) => {
      if (isReady) dispatch(cardsActions.addDomReady(id));
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
      offDomReady();
    };
  }, [dispatch]);

  useEffect(() => {
    const removeListener = rendererIpc.utils.onUpdateAllExtensions((_e, result) => {
      if (result.step === 'done') {
        rendererIpc.pty.process(result.id, result.id);
        storageUtilsIpc.invoke.recentlyUsedCards('update', result.id);
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
  const tabs = useTabsState('tabs');

  const [pendingTab, setPendingTab] = useState<{url: string; background: boolean} | null>(null);
  const prevTabsLength = useRef(tabs.length);

  // When tabs array grows, find the new tab and set up the running card
  useEffect(() => {
    if (pendingTab && tabs.length > prevTabsLength.current) {
      // Find the newly added tab (last one in the array)
      const newTab = tabs[tabs.length - 1];
      if (newTab) {
        dispatch(
          cardsActions.addRunningEmpty({
            tabId: newTab.id,
            type: 'browser',
          }),
        );
        dispatch(
          cardsActions.setRunningCardCustomAddress({
            tabId: newTab.id,
            address: pendingTab.url,
          }),
        );
      }
      setPendingTab(null);
    }
    prevTabsLength.current = tabs.length;
  }, [tabs.length]);

  useEffect(() => {
    const offNewTab = rendererIpc.tab.onNewTab((_, url, background = false) => {
      setPendingTab({url, background});
      dispatch(tabsActions.addTab({...defaultTabItem, background}));
    });

    return () => offNewTab();
  }, []);
};

export const useBrowserEvents = () => {
  const runningCards = useCardsState('runningCard');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const offIsLoading = browserIpc.on.loading((id, isLoading) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabLoading({tabID, isLoading}));
    });

    const offTitleChange = browserIpc.on.titleChanged((id, title) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) {
        dispatch(tabsActions.setTabTitle({tabID, title}));
        dispatch(cardsActions.setRunningCardBrowserTitle({tabId: tabID, title}));
      }
    });

    const offFavIconChange = browserIpc.on.favIconChanged((id, url) => {
      const tabID = runningCards.find(card => card.id === id)?.tabId;
      if (tabID) dispatch(tabsActions.setTabFavIcon({tabID, show: true, url}));
    });

    const offUrlChange = browserIpc.on.urlChanged((id, url) => {
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
  const removeTab = useRemoveTab();

  useEffect(() => {
    const offStopAI = contextMenuIpc.on.stopProcess(id => removeTab({id}));

    const offRelaunchAI = contextMenuIpc.on.relaunchProcess(id => {
      const runningCard = runningCards.find(card => card.id === id);
      if (!runningCard) return;

      removeTab({id});
      setTimeout(() => {
        if (runningCard.isEmptyRunning) {
          dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: runningCard.type}));
        } else {
          rendererIpc.pty.process(runningCard.id, runningCard.id);
          dispatch(cardsActions.addRunningCard({id: runningCard.id, tabId: activeTab}));
        }
      }, 1000);
    });

    return () => {
      offRelaunchAI();
      offStopAI();
    };
  }, [runningCards, dispatch, activeTab, removeTab]);
};

export const useShowToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const removeListener = rendererIpc.appWindow.onShowToast((_, message, type, placement) => {
      lynxTopToast(dispatch, placement || 'bottom-right')[type](message);
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

      try {
        const insider = await rendererIpc.statics.getInsider();
        const releases = await rendererIpc.statics.getReleases();

        if (!insider || !releases) return;

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
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    const offStatusError = rendererIpc.appUpdate.statusError(() => statusError());

    return () => offStatusError();
  }, [dispatch, activeTab, runningCard]);
};
