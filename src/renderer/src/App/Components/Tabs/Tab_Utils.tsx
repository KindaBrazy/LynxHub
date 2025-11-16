import type {ActionCreatorWithPayload} from '@reduxjs/toolkit';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../Redux/Reducer/ModalsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {defaultTabItem, REMOVE_MODAL_DELAY} from '../../Utils/Constants';

export function useRemoveTab() {
  const runningCards = useCardsState('runningCard');
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    ({tabId, id}: {tabId?: string; id?: string}) => {
      const running = runningCards.find(card => card.tabId === tabId || card.id === id);

      if (running && running.type !== 'browser') rendererIpc.pty.stop(running.id);

      const tId = tabId || running?.tabId;

      if (tId) {
        dispatch(tabsActions.removeTab(tId));
        dispatch(modalActions.removeAllModalsForTabId({tabId: tId}));
        dispatch(cardsActions.stopRunningCard({tabId: tId}));
        rendererIpc.win.setDiscordRpAiRunning({running: false});
      }
    },
    [runningCards, dispatch],
  );
}

export function useIsActiveTab(tabID: string) {
  const activeTab = useTabsState('activeTab');

  return useMemo(() => activeTab === tabID, [activeTab, tabID]);
}

export function useTabVisibility(tabID: string) {
  const isActiveTab = useIsActiveTab(tabID);

  return useMemo(() => (isActiveTab ? 'flex' : 'hidden'), [isActiveTab]);
}

type TabIdPayload = {tabID: string};

export function useTabModalOpen<P extends TabIdPayload>(openAction: ActionCreatorWithPayload<P>) {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const getNewTabId = useCallback(() => {
    let newID = defaultTabItem.id;
    let idNumber = 1;

    const exists = (id: string) => tabs.some(tab => tab.id === id);

    while (exists(newID)) {
      newID = `${defaultTabItem.id}_${idNumber}`;
      idNumber++;
    }

    return newID;
  }, [tabs]);

  const openInActiveTab = useCallback(
    (payload: Omit<P, 'tabID'>) => {
      dispatch(openAction({...payload, tabID: activeTab} as P));
    },
    [dispatch, openAction, activeTab],
  );

  const openInNewTab = useCallback(
    (payload: Omit<P, 'tabID'>) => {
      const newID = getNewTabId();
      dispatch(tabsActions.addTab({...defaultTabItem, id: newID}));
      dispatch(openAction({...payload, tabID: newID} as P));
    },
    [dispatch, openAction, getNewTabId],
  );

  return {openInActiveTab, openInNewTab};
}

export function useTabModalClose(
  closeAction: ActionCreatorWithPayload<{tabID: string}>,
  removeAction?: ActionCreatorWithPayload<{tabID: string}>,
  removeDelay: number = REMOVE_MODAL_DELAY,
) {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const close = useCallback(() => {
    dispatch(closeAction({tabID: activeTab}));

    if (removeAction) {
      setTimeout(() => {
        dispatch(removeAction({tabID: activeTab}));
      }, removeDelay);
    }
  }, [dispatch, closeAction, removeAction, removeDelay, activeTab]);

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) close();
    },
    [close],
  );

  return {onOpenChange, close};
}
