import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject} from 'react';

import ClearAll from './ClearAll';
import CopyAll from './CopyAll';
import SearchBy from './SearchBy';
import SearchText from './SearchText';
import Timer from './Timer';

type Props = {
  startTime: string;
  serializeAddon: SerializeAddon;
  searchAddon: SearchAddon;
  clearTerminal: RefObject<(() => void) | undefined>;
  selectedTerminalText: string;
};

const Terminal_TopBar = memo(({startTime, serializeAddon, searchAddon, clearTerminal, selectedTerminalText}: Props) => {
  return (
    <>
      <div className="flex flex-row h-full items-center gap-x-1">
        <Timer startTime={startTime} />

        <CopyAll serializeAddon={serializeAddon} />

        <ClearAll clearTerminal={clearTerminal} />

        <SearchText searchAddon={searchAddon} />

        <SearchBy selectedTerminalText={selectedTerminalText} />
      </div>
      <div className="flex flex-row h-full items-center gap-x-1"></div>
    </>
  );
});

export default Terminal_TopBar;
