import {isEqual} from 'lodash';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Hotkey_Names} from '../../../../cross/HotkeyConstants';
import {appActions} from '../Redux/Reducer/AppReducer';
import {cardsActions} from '../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../Redux/Reducer/HotkeysReducer';
import {tabsActions, useTabsState} from '../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../Redux/Store';
import rendererIpc from '../RendererIpc';
import {defaultTabItem} from './Constants';

export default function useHotkeyPress(keys: {name: string; method: (() => void) | null}[]) {
  const hotkeys = useHotkeysState('hotkeys');
  const input = useHotkeysState('input');

  useEffect(() => {
    hotkeys.forEach(item => {
      const {name, ...hotkey} = item;
      const {type, ...current} = input;

      if (type !== 'keyUp' || !isEqual(current, hotkey)) return;

      keys.find(key => key.name === name)?.method?.();
    });
  }, [input, hotkeys]);
}

/** Register application hotkeys */
export function useRegisterHotkeys() {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();
  const [addEmpty, setAddEmpty] = useState<boolean>(false);
  const [emptyType, setEmptyType] = useState<'browser' | 'terminal' | 'both'>('both');

  const handleFullscreen = useCallback(() => {
    rendererIpc.win.changeWinState('fullscreen');
  }, []);

  const handleToggleNav = useCallback(() => {
    dispatch(appActions.toggleAppState('navBar'));
  }, [dispatch]);

  const handleToggleAIView = useCallback(() => {
    dispatch(cardsActions.toggleRunningCardView({tabId: activeTab}));
  }, [dispatch, activeTab]);

  const handleNewTab = useCallback(() => {
    dispatch(tabsActions.addTab(defaultTabItem));
  }, []);

  const switchTab = useCallback((direction: 'next' | 'prev') => {
    dispatch(tabsActions.switchTab({direction}));
  }, []);

  useEffect(() => {
    if (addEmpty) {
      dispatch(
        cardsActions.addRunningEmpty({
          tabId: activeTab,
          type: emptyType,
        }),
      );
      setAddEmpty(false);
    }
  }, [activeTab]);

  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') => {
    handleNewTab();
    setEmptyType(type);
    setAddEmpty(true);
  };

  const newTerminalTab = () => addRunningEmpty('terminal');

  const newBrowserTab = () => addRunningEmpty('browser');

  const newTerminalBrowserTab = () => addRunningEmpty('both');

  useHotkeyPress([
    {name: Hotkey_Names.fullscreen, method: handleFullscreen},
    {
      name: Hotkey_Names.toggleNav,
      method: handleToggleNav,
    },
    {name: Hotkey_Names.toggleAiView, method: handleToggleAIView},
    {name: Hotkey_Names.newTab, method: handleNewTab},
    {name: Hotkey_Names.switchTab, method: () => switchTab('next')},
    {name: Hotkey_Names.nextTab, method: () => switchTab('next')},
    {name: Hotkey_Names.prevTab, method: () => switchTab('prev')},
    {name: Hotkey_Names.newBrowserTab, method: newBrowserTab},
    {name: Hotkey_Names.newTerminalTab, method: newTerminalTab},
    {name: Hotkey_Names.newBrowserTerminalTab, method: newTerminalBrowserTab},
  ]);
}
