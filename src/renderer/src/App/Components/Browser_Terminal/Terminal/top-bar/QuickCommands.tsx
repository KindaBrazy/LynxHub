import {Button, Divider, Kbd} from '@heroui/react';

import {Hotkey_Names} from '../../../../../../../cross/HotkeyConstants';
import {useHotkeysState} from '../../../../Redux/Reducer/HotkeysReducer';
import {useTerminalState} from '../../../../Redux/Reducer/TerminalReducer';
import rendererIpc from '../../../../RendererIpc';
import {formatHotkey} from '../../../../Utils/UtilFunctions';

type Props = {id: string};

export default function QuickCommands({id}: Props) {
  const quickCommands = useTerminalState('quickCommands');
  const hotkeys = useHotkeysState('hotkeys');
  const LINE_ENDING = window.osPlatform === 'win32' ? '\r' : '\n';

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
        const command = item.command + LINE_ENDING;

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
            variant="flat"
            key={`terminal_quick_btn_${index}`}
            onPress={() => rendererIpc.pty.write(id, command)}>
            <span className="flex flex-row items-center gap-x-1">
              <span>{label}</span>
              {hasHotkey && (
                <Kbd className="text-[10px] rounded-sm! shadow-none! bg-foreground-200">{displayHotkey}</Kbd>
              )}
            </span>
          </Button>
        );
      })}
    </>
  );
}
