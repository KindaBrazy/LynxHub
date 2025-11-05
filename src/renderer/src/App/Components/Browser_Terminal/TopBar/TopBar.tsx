import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject} from 'react';

import {RunningCard} from '../../../Utils/Types';
import Browser_TopBar from '../Browser/Browser_TopBar';
import Terminal_TopBar from '../Terminal/top-bar/TopBar';
import SharedTopBar from './SharedTopBar';

type Props = {
  runningCard: RunningCard;
  serializeAddon: SerializeAddon;
  searchAddon: SearchAddon;
  tabID: string;
  clearTerminal: RefObject<(() => void) | undefined>;
  selectedTerminalText: string;
};

const TopBar = memo(({runningCard, serializeAddon, searchAddon, tabID, clearTerminal, selectedTerminalText}: Props) => {
  return (
    <div
      className={
        'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxNearBlack' +
        ' flex flex-row gap-x-1 px-2 py-1 items-center justify-between'
      }>
      {runningCard.currentView === 'terminal' ? (
        <Terminal_TopBar
          id={runningCard.id}
          searchAddon={searchAddon}
          clearTerminal={clearTerminal}
          serializeAddon={serializeAddon}
          startTime={runningCard.startTime}
          selectedTerminalText={selectedTerminalText}
        />
      ) : (
        <Browser_TopBar tabID={tabID} runningCard={runningCard} />
      )}

      <SharedTopBar runningCard={runningCard} />
    </div>
  );
});

export default TopBar;
