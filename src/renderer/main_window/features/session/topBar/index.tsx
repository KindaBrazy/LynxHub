import {RunningCard} from '@lynx/types';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject} from 'react';

import BrowserTopBar from './browser';
import SharedTopBar from './shared';
import TerminalTopBar from './terminal';

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
        <TerminalTopBar
          id={runningCard.id}
          tabId={runningCard.tabId}
          searchAddon={searchAddon}
          clearTerminal={clearTerminal}
          serializeAddon={serializeAddon}
          startTime={runningCard.startTime}
          selectedTerminalText={selectedTerminalText}
        />
      ) : (
        <BrowserTopBar tabID={tabID} runningCard={runningCard} />
      )}

      <SharedTopBar runningCard={runningCard} />
    </div>
  );
});

export default TopBar;
