import {useAllCardMethods} from '@lynx/plugins/modules';
import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {modalActions} from '@lynx/redux/reducers/modals';
import {pluginsActions} from '@lynx/redux/reducers/plugins';
import {settingsActions} from '@lynx/redux/reducers/settings';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {APP_BUILD_NUMBER} from '@lynx_common/consts';
import {toMs} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import staticsIpc from '@lynx_shared/ipc/statics';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {compact, isNil} from 'lodash-es';
import {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {topToast} from '../../layouts/ToastProviders';

/**
 * Checks for updates for installed cards.
 */
export const useCheckCardsUpdate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const installedCards = useCardsState('installedCards');
  const allMethods = useAllCardMethods();

  useEffect(() => {
    const offCardUpdate = moduleIpc.onCardsUpdateAvailable(cards => {
      dispatch(cardsActions.setUpdateAvailable(cards));
    });
    const offCardCheck = moduleIpc.onCardUpdateChecking(card => {
      dispatch(cardsActions.setUpdateChecking(card));
    });

    return () => {
      offCardUpdate();
      offCardCheck();
    };
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

/**
 * Checks for updates for plugins.
 */
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

/**
 * Listens for update errors and checks for updates manually if needed.
 */
export const useListenForUpdateError = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const runningCard = useCardsState('runningCard');

  useEffect(() => {
    const statusError = async () => {
      AddBreadcrumb_Renderer(`Update error 403`);
      dispatch(settingsActions.setSettingsState({key: 'checkCustomUpdate', value: true}));

      try {
        const insider = await staticsIpc.getInsider();
        const releases = await staticsIpc.getReleases();

        if (!insider || !releases) return;

        if (
          insider.currentBuild > APP_BUILD_NUMBER ||
          releases.earlyAccess.build > APP_BUILD_NUMBER ||
          releases.currentBuild > APP_BUILD_NUMBER
        ) {
          dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: true}));
          topToast.info('New Update Available!');

          const isRunningAI = runningCard.some(card => card.tabId === activeTab);
          if (!isRunningAI) {
            dispatch(modalActions.openUpdateApp());
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    const offStatusError = applicationIpc.on.updateError(() => statusError());

    return () => offStatusError();
  }, [dispatch, activeTab, runningCard]);
};
