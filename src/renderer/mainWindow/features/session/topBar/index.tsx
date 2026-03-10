import {RunningCard} from '@lynx/types';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject} from 'react';

import {XTermAPI} from '../../../components/useXTerm';
import BrowserTopBar from './browser';
import SharedTopBar from './shared';
import TerminalTopBar from './terminal';

type Props = {
  /**
   * The running card data.
   */
  runningCard: RunningCard;
  /**
   * The serialize addon for xterm.js.
   */
  serializeAddon: SerializeAddon;
  /**
   * The search addon for xterm.js.
   */
  searchAddon: SearchAddon;
  /**
   * The ID of the tab.
   */
  tabID: string;
  /**
   * Reference to the clear terminal function.
   */
  clearTerminal: RefObject<(() => void) | undefined>;
  /**
   * The selected text in the terminal.
   */
  selectedTerminalText: string;
  xtermRef: RefObject<XTermAPI | null>;
};

/**
 * The main top bar component for the session view.
 * Switches between browser and terminal top bars based on the current view.
 */
const SessionTopBar = memo(
  ({runningCard, serializeAddon, searchAddon, tabID, clearTerminal, selectedTerminalText, xtermRef}: Props) => {
    return (
      <div
        className={
          'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxNearBlack' +
          ' flex flex-row gap-x-1 px-2 py-1 items-center justify-between'
        }>
        {runningCard.currentView === 'terminal' ? (
          <TerminalTopBar
            id={runningCard.id}
            xtermRef={xtermRef}
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
  },
);

SessionTopBar.displayName = 'SessionTopBar';

export default SessionTopBar;
