import {Button, Kbd, Separator} from '@heroui/react';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {formatHotkey} from '@lynx/utils';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {terminalLineEnding} from '@lynx_common/utils';
import ptyIpc from '@lynx_shared/ipc/pty';
import {memo} from 'react';

type Props = {
  /**
   * The ID of the terminal/card.
   */
  id: string;
};

/**
 * Quick command buttons for the terminal.
 */
const TerminalQuickCommands = memo(({id}: Props) => {
  const quickCommands = useTerminalState('quickCommands');
  const hotkeys = useHotkeysState('hotkeys');

  const hasAnyQuick = quickCommands.slice(0, 6).some(item => item && item.command);
  if (!hasAnyQuick) return null;

  return (
    <>
      <Separator variant="secondary" className="my-2 mx-1" orientation="vertical" />

      {quickCommands.slice(0, 6).map((item, index) => {
        if (!item || !item.command) return null;

        const label = item.label || `Cmd ${index + 1}`;
        const command = item.command + terminalLineEnding;

        const hotkeyNameMap: Record<number, string> = {
          0: Hotkey_Names.terminalQuick1,
          1: Hotkey_Names.terminalQuick2,
          2: Hotkey_Names.terminalQuick3,
          3: Hotkey_Names.terminalQuick4,
          4: Hotkey_Names.terminalQuick5,
          5: Hotkey_Names.terminalQuick6,
        };

        const hotkeyEntry = hotkeys.find(h => h.name === hotkeyNameMap[index]);
        const displayHotkey = hotkeyEntry ? formatHotkey(hotkeyEntry) : '';
        const hasHotkey = displayHotkey !== 'Not Set';

        return (
          <Button
            size="sm"
            variant="outline"
            key={`terminal_quick_btn_${index}`}
            onPress={() => ptyIpc.write(id, command)}>
            <span className="flex flex-row items-center gap-x-1">
              <span className="font-semibold tracking-tight">{label}</span>
              {hasHotkey && (
                <Kbd className="h-5">
                  <Kbd.Content className="text-[8pt]">{displayHotkey}</Kbd.Content>
                </Kbd>
              )}
            </span>
          </Button>
        );
      })}
    </>
  );
});

TerminalQuickCommands.displayName = 'TerminalQuickCommands';

export default TerminalQuickCommands;
