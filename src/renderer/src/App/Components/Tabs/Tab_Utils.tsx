import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../Redux/Reducer/ModalsReducer';
import {tabsActions} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';

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
