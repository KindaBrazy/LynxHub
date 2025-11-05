import {Button} from '@heroui/react';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject, useCallback} from 'react';

import {BroomDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import CopyAll from './CopyAll';
import SearchBy from './SearchBy';
import Timer from './Timer';

type Props = {
  startTime: string;
  serializeAddon?: SerializeAddon;
  clearTerminal: RefObject<(() => void) | undefined>;
  selectedTerminalText: string;
};

const Terminal_TopBar = memo(({startTime, serializeAddon, clearTerminal, selectedTerminalText}: Props) => {
  const clearTerm = useCallback(() => {
    if (clearTerminal.current) {
      clearTerminal.current();
    }
  }, [clearTerminal]);

  return (
    <>
      <div className="flex flex-row h-full items-center gap-x-1">
        <Timer startTime={startTime} />

        <CopyAll serializeAddon={serializeAddon} />

        <Button size="sm" variant="light" onPress={clearTerm} isIconOnly>
          <BroomDuo_Icon className="size-3.5" />
        </Button>

        <SearchBy selectedTerminalText={selectedTerminalText} />
      </div>
      <div className="flex flex-row h-full items-center gap-x-1"></div>
    </>
  );
});

export default Terminal_TopBar;
