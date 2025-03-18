import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {appActions} from '../Redux/Reducer/AppReducer';
import {cardsActions} from '../Redux/Reducer/CardsReducer';
import {useSettingsState} from '../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';

/** Register application hotkeys */
export default function useRegisterHotkeys() {
  const activeTab = useTabsState('activeTab');
  const hotkeys = useSettingsState('hotkeys');
  const dispatch = useDispatch<AppDispatch>();

  const hotkeyOptions = useMemo(
    () => ({
      keyup: true,
      enabled: hotkeys.isEnabled,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    }),
    [hotkeys.isEnabled],
  );

  const handleFullscreen = useCallback(() => {
    rendererIpc.win.changeWinState('fullscreen');
  }, []);

  const handleToggleNav = useCallback(() => {
    dispatch(appActions.toggleAppState('navBar'));
  }, [dispatch]);

  const handleToggleAIView = useCallback(() => {
    dispatch(cardsActions.toggleRunningCardView({tabId: activeTab}));
  }, [dispatch, activeTab]);

  useHotkeys(hotkeys.FULLSCREEN, handleFullscreen, hotkeyOptions, [hotkeys]);
  useHotkeys(hotkeys.TOGGLE_NAV, handleToggleNav, hotkeyOptions, [hotkeys]);
  useHotkeys(hotkeys.TOGGLE_AI_VIEW, handleToggleAIView, hotkeyOptions, [hotkeys]);
}
