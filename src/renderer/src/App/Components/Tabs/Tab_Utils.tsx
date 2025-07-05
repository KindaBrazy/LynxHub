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
    (tabID: string) => {
      const running = runningCards.find(card => card.tabId === tabID);
      if (running && running.type !== 'browser') {
        rendererIpc.pty.process(running.id, 'stop', running.id);
        rendererIpc.pty.customProcess(running.id, 'stop', running.id);
        rendererIpc.pty.emptyProcess(running.id, 'stop', running.id);
      }

      dispatch(tabsActions.removeTab(tabID));
      dispatch(modalActions.removeAllModalsForTabId({tabId: tabID}));
      dispatch(cardsActions.stopRunningCard({tabId: tabID}));
      rendererIpc.win.setDiscordRpAiRunning({running: false});
    },
    [runningCards, dispatch],
  );
}
