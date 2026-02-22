import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {useMemo} from 'react';

export function useTerminalHotkeys() {
  const hotkeys = useHotkeysState('hotkeys');
  const quickCommands = useTerminalState('quickCommands');

  const quickHotkeySet = useMemo(() => {
    const quickNames = [
      Hotkey_Names.terminalQuick1,
      Hotkey_Names.terminalQuick2,
      Hotkey_Names.terminalQuick3,
      Hotkey_Names.terminalQuick4,
      Hotkey_Names.terminalQuick5,
      Hotkey_Names.terminalQuick6,
    ];
    const set = new Set<string>();

    for (let index = 0; index < quickNames.length; index += 1) {
      const quick = quickCommands[index];
      if (!quick?.command) continue;

      const hotkey = hotkeys.find(item => item.name === quickNames[index]);
      if (!hotkey?.key) continue;

      const key = hotkey.key.toLowerCase();
      set.add(`${key}|${hotkey.control ? 1 : 0}${hotkey.shift ? 1 : 0}${hotkey.alt ? 1 : 0}${hotkey.meta ? 1 : 0}`);
    }

    return set;
  }, [hotkeys, quickCommands]);

  return {quickHotkeySet};
}
