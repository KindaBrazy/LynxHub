import {appActions} from '@lynx/redux/reducers/app';
import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {hotkeysActions, useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {tabsActions, useTabsState} from '@lynx/redux/reducers/tabs';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import {defaultTabItem} from '@lynx/utils/constants';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {LynxHotkey} from '@lynx_common/types/ipc';
import {terminalLineEnding} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import ptyIpc from '@lynx_shared/ipc/pty';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

/**
 * Creates a fast lookup key from hotkey properties.
 */
function createHotkeyKey(key: string, control: boolean, shift: boolean, alt: boolean, meta: boolean): string {
  return `${key}|${control ? 1 : 0}${shift ? 1 : 0}${alt ? 1 : 0}${meta ? 1 : 0}`;
}

/**
 * Builds a Map for O(1) hotkey lookup instead of O(n) array iteration.
 */
function buildHotkeyMap(hotkeys: LynxHotkey[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const {name, key, control, shift, alt, meta} of hotkeys) {
    if (!key) continue; // Skip hotkeys without a key assigned
    const lookupKey = createHotkeyKey(key, control, shift, alt, meta);
    map.set(lookupKey, name);
  }
  return map;
}

/**
 * Hook to handle hotkey presses based on the registered configuration.
 * @param keys Array of hotkey names and their corresponding callback methods.
 */
export default function useHotkeyPress(keys: {name: string; method: (() => void) | null}[]) {
  const hotkeys = useHotkeysState('hotkeys');
  const input = useHotkeysState('input');
  const lastExecutedRef = useRef<string>('');
  const lastExecutedTimeRef = useRef<number>(0);
  const keysRef = useRef(keys);
  const dispatch = useDispatch();

  // Update ref in useLayoutEffect (runs synchronously after render, before effects)
  useLayoutEffect(() => {
    keysRef.current = keys;
  });

  // Memoize the hotkey lookup map - only rebuilds when hotkeys change
  const hotkeyMap = useMemo(() => buildHotkeyMap(hotkeys), [hotkeys]);

  useEffect(() => {
    // Only process keyDown events
    if (input.type !== 'keyDown' || !input.key) return;

    const lookupKey = createHotkeyKey(input.key, input.control, input.shift, input.alt, input.meta);
    const hotkeyName = hotkeyMap.get(lookupKey);

    if (!hotkeyName) return;

    // Debounce: prevent duplicate executions within 50ms
    const now = Date.now();
    if (lookupKey === lastExecutedRef.current && now - lastExecutedTimeRef.current < 50) return;

    // Find method from current keys ref
    const keyConfig = keysRef.current.find(k => k.name === hotkeyName);
    if (keyConfig?.method) {
      lastExecutedRef.current = lookupKey;
      lastExecutedTimeRef.current = now;
      dispatch(hotkeysActions.clearInput());
      keyConfig.method();
    }
  }, [input, hotkeyMap]);
}

/**
 * Registers application-wide hotkeys and their actions.
 */
export function useRegisterHotkeys() {
  const activeTab = useTabsState('activeTab');
  const runningCards = useCardsState('runningCard');
  const quickCommands = useTerminalState('quickCommands');
  const dispatch = useDispatch<AppDispatch>();
  const [addEmpty, setAddEmpty] = useState<boolean>(false);
  const [emptyType, setEmptyType] = useState<'browser' | 'terminal' | 'both'>('both');

  const handleFullscreen = useCallback(() => {
    applicationIpc.send.changeWinState('fullscreen');
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

  // Handle adding a running card after a new tab is created
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
  }, [activeTab, addEmpty, emptyType, dispatch]);

  const addRunningEmpty = (type: 'browser' | 'terminal' | 'both') => {
    handleNewTab();
    setEmptyType(type);
    setAddEmpty(true);
  };

  const newTerminalTab = () => addRunningEmpty('terminal');
  const newBrowserTab = () => addRunningEmpty('browser');
  const newTerminalBrowserTab = () => addRunningEmpty('both');

  const runQuickCommand = useCallback(
    (index: number) => {
      const quick = quickCommands[index];
      if (!quick || !quick.command) return;

      const card = runningCards.find(c => c.tabId === activeTab && (c.type === 'terminal' || c.type === 'both'));
      if (!card) return;

      ptyIpc.write(card.id, quick.command + terminalLineEnding);
    },
    [activeTab, quickCommands, runningCards],
  );

  useHotkeyPress([
    {name: Hotkey_Names.fullscreen, method: handleFullscreen},
    {name: Hotkey_Names.toggleNav, method: handleToggleNav},
    {name: Hotkey_Names.toggleAiView, method: handleToggleAIView},
    {name: Hotkey_Names.newTab, method: handleNewTab},
    {name: Hotkey_Names.switchTab, method: () => switchTab('next')},
    {name: Hotkey_Names.nextTab, method: () => switchTab('next')},
    {name: Hotkey_Names.prevTab, method: () => switchTab('prev')},
    {name: Hotkey_Names.newBrowserTab, method: newBrowserTab},
    {name: Hotkey_Names.newTerminalTab, method: newTerminalTab},
    {name: Hotkey_Names.newBrowserTerminalTab, method: newTerminalBrowserTab},
    {name: Hotkey_Names.terminalQuick1, method: () => runQuickCommand(0)},
    {name: Hotkey_Names.terminalQuick2, method: () => runQuickCommand(1)},
    {name: Hotkey_Names.terminalQuick3, method: () => runQuickCommand(2)},
    {name: Hotkey_Names.terminalQuick4, method: () => runQuickCommand(3)},
    {name: Hotkey_Names.terminalQuick5, method: () => runQuickCommand(4)},
    {name: Hotkey_Names.terminalQuick6, method: () => runQuickCommand(5)},
  ]);
}
