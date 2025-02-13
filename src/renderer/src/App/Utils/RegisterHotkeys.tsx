import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {cardsActions} from '../Redux/AI/CardsReducer';
import {appActions} from '../Redux/App/AppReducer';
import {useSettingsState} from '../Redux/App/SettingsReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';

/** Register application hotkeys */
export default function useRegisterHotkeys() {
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
    dispatch(cardsActions.toggleRunningCardView());
  }, [dispatch]);

  useHotkeys(hotkeys.FULLSCREEN, handleFullscreen, hotkeyOptions, [hotkeys]);
  useHotkeys(hotkeys.TOGGLE_NAV, handleToggleNav, hotkeyOptions, [hotkeys]);
  useHotkeys(hotkeys.TOGGLE_AI_VIEW, handleToggleAIView, hotkeyOptions, [hotkeys]);
}
