import {Button, Divider, Kbd} from '@heroui/react';
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
      <div className="mx-1 h-full py-2">
        <Divider orientation="vertical" />
      </div>
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
            variant="bordered"
            key={`terminal_quick_btn_${index}`}
            onPress={() => ptyIpc.write(id, command)}
            className="border-1 border-foreground-100 hover:border-foreground-200">
            <span className="flex flex-row items-center gap-x-1">
              <span>{label}</span>
              {hasHotkey && (
                <Kbd className="text-[10px] rounded-sm! shadow-none! bg-foreground-100">{displayHotkey}</Kbd>
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
