import XTermCore, {XTermAPI} from '@lynx/components/XTermCore';
import {RunningCard} from '@lynx/types';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {Dispatch, memo, MutableRefObject, RefObject, SetStateAction, useMemo, useRef} from 'react';

import {useTerminalBrowserIntegration} from './hooks/useTerminalBrowserIntegration';
import {useTerminalClipboard} from './hooks/useTerminalClipboard';
import {useTerminalHotkeys} from './hooks/useTerminalHotkeys';
import {useTerminalProgress} from './hooks/useTerminalProgress';
import {useTerminalResize} from './hooks/useTerminalResize';
import {useTerminalSetup} from './hooks/useTerminalSetup';

type Props = {
  runningCard: RunningCard;
  serializeAddon: SerializeAddon;
  searchAddon: SearchAddon;
  clearTerminal: RefObject<(() => void) | undefined>;
  setSelectedTerminalText: Dispatch<SetStateAction<string>>;
};

const Terminal = memo(({runningCard, serializeAddon, searchAddon, clearTerminal, setSelectedTerminalText}: Props) => {
  const {webUIAddress, id, currentView, tabId} = useMemo(() => runningCard, [runningCard]);
  const xtermRef = useRef<XTermAPI | null>(null);

  // 1. Hotkeys
  const {quickHotkeySet} = useTerminalHotkeys();

  // 2. Clipboard
  const {copySelection} = useTerminalClipboard(xtermRef);

  // 3. Browser Integration
  useTerminalBrowserIntegration(id, tabId, webUIAddress);

  // 4. Progress
  const {handleProgress} = useTerminalProgress(tabId);

  // 5. Resize
  useTerminalResize(xtermRef, currentView);

  // 6. Setup (Ready handler)
  const {handleTerminalReady} = useTerminalSetup({
    id,
    xtermRef: xtermRef as MutableRefObject<XTermAPI | null>,
    clearTerminal,
    setSelectedTerminalText,
    quickHotkeySet,
    copySelection,
  });

  return (
    <div className={`${currentView === 'terminal' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 top-10! overflow-hidden bg-white pl-3 pr-1 shadow-md dark:bg-LynxNearBlack">
        <XTermCore
          id={id}
          ref={xtermRef}
          searchAddon={searchAddon}
          onProgress={handleProgress}
          onReady={handleTerminalReady}
          serializeAddon={serializeAddon}
        />
      </div>
    </div>
  );
});

export default Terminal;
