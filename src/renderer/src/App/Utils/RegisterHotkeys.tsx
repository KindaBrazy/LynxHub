import {isEqual} from 'lodash';
import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {Hotkey_Names} from '../../../../cross/HotkeyConstants';
import {appActions} from '../Redux/Reducer/AppReducer';
import {cardsActions} from '../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../Redux/Reducer/HotkeysReducer';
import {useTabsState} from '../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';

/** Register application hotkeys */
export default function useRegisterHotkeys() {
  const activeTab = useTabsState('activeTab');
  const hotkeys = useHotkeysState('hotkeys');
  const input = useHotkeysState('input');
  const dispatch = useDispatch<AppDispatch>();

  const handleFullscreen = useCallback(() => {
    rendererIpc.win.changeWinState('fullscreen');
  }, []);

  const handleToggleNav = useCallback(() => {
    dispatch(appActions.toggleAppState('navBar'));
  }, [dispatch]);

  const handleToggleAIView = useCallback(() => {
    dispatch(cardsActions.toggleRunningCardView({tabId: activeTab}));
  }, [dispatch, activeTab]);

  useEffect(() => {
    hotkeys.map(item => {
      const {name, ...hotkey} = item;
      const {type, ...current} = input;

      if (type !== 'keyUp') return;

      switch (name) {
        case Hotkey_Names.fullscreen:
          if (isEqual(current, hotkey)) handleFullscreen();
          break;
        case Hotkey_Names.toggleNav:
          if (isEqual(current, hotkey)) handleToggleNav();
          break;
        case Hotkey_Names.toggleAiView:
          if (isEqual(current, hotkey)) handleToggleAIView();
          break;
      }
    });
  }, [input, hotkeys]);
}
