import {Button} from '@heroui/react';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject, useCallback, useState} from 'react';

import {BroomDuo_Icon, CheckDuo_Icon, CopyDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import Terminal_Timer from './Terminal_Timer';

type Props = {startTime: string; serializeAddon?: SerializeAddon; clearTerminal: RefObject<(() => void) | undefined>};

const Terminal_TopBar = memo(({startTime, serializeAddon, clearTerminal}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = useCallback(() => {
    const contentToCopy = serializeAddon?.serialize();
    if (!contentToCopy) return;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [serializeAddon]);

  const clearTerm = useCallback(() => {
    if (clearTerminal.current) {
      clearTerminal.current();
    }
  }, [clearTerminal]);

  return (
    <>
      <div className="flex flex-row h-full items-center gap-x-1">
        <Terminal_Timer startTime={startTime} />

        <Button size="sm" variant="light" onPress={handleCopy} className="cursor-default" isIconOnly>
          {copied ? (
            <CheckDuo_Icon className="size-5 animate-appearance-in" />
          ) : (
            <CopyDuo_Icon className="size-4 animate-appearance-in" />
          )}
        </Button>

        <Button size="sm" variant="light" onPress={clearTerm} className="cursor-default" isIconOnly>
          <BroomDuo_Icon className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-row h-full items-center gap-x-1"></div>
    </>
  );
});

export default Terminal_TopBar;
