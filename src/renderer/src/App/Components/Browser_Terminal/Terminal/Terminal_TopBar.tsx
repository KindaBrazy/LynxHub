import {Button} from '@heroui/react';
import {SerializeAddon} from '@xterm/addon-serialize';
import {useCallback, useState} from 'react';

import {CheckDuo_Icon, CopyDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import Terminal_Timer from './Terminal_Timer';

type Props = {startTime: string; serializeAddon?: SerializeAddon};
export default function Terminal_TopBar({startTime, serializeAddon}: Props) {
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
      </div>
      <div className="flex flex-row h-full items-center gap-x-1"></div>
    </>
  );
}
