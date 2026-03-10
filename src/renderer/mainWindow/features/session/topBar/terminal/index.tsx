import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {memo, RefObject} from 'react';

import {XTermAPI} from '../../../../components/useXTerm';
import TerminalCDTo from './TerminalCDTo';
import TerminalClearAll from './TerminalClearAll';
import TerminalCopyAll from './TerminalCopyAll';
import TerminalQuickCommands from './TerminalQuickCommands';
import TerminalScroll from './TerminalScroll';
import TerminalSearchBy from './TerminalSearchBy';
import TerminalSearchText from './TerminalSearchText';
import TerminalTimer from './TerminalTimer';

type Props = {
  /**
   * The start time string.
   */
  startTime: string;
  /**
   * The serialize addon for xterm.js.
   */
  serializeAddon: SerializeAddon;
  /**
   * The search addon for xterm.js.
   */
  searchAddon: SearchAddon;
  /**
   * Reference to the clear terminal function.
   */
  clearTerminal: RefObject<(() => void) | undefined>;
  /**
   * The selected text in the terminal.
   */
  selectedTerminalText: string;
  /**
   * The ID of the terminal/card.
   */
  id: string;
  /**
   * The ID of the tab.
   */
  tabId: string;
  xtermRef: RefObject<XTermAPI | null>;
};

/**
 * Top bar for the terminal view, containing timer, copy/save, cd, search, and quick commands.
 */
const TerminalTopBar = memo(
  ({startTime, serializeAddon, searchAddon, clearTerminal, id, selectedTerminalText, tabId, xtermRef}: Props) => {
    return (
      <>
        <div className="flex flex-row h-full items-center gap-x-1">
          <TerminalTimer startTime={startTime} />

          <TerminalCopyAll serializeAddon={serializeAddon} />

          <TerminalClearAll clearTerminal={clearTerminal} />

          <TerminalCDTo id={id} />

          <TerminalSearchText tabId={tabId} searchAddon={searchAddon} />

          <TerminalSearchBy selectedTerminalText={selectedTerminalText} />

          <TerminalQuickCommands id={id} />
        </div>

        <div className="flex h-full items-center gap-x-1 w-full justify-end">
          <TerminalScroll xtermRef={xtermRef} />
        </div>
      </>
    );
  },
);

TerminalTopBar.displayName = 'TerminalTopBar';

export default TerminalTopBar;
