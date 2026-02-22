import {useRemoveTab} from '@lynx/layouts/tabs/utils';
import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import ptyIpc from '@lynx_shared/ipc/pty';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Handles context menu actions for running processes.
 */
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
          ptyIpc.process(runningCard.id, runningCard.id);
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
