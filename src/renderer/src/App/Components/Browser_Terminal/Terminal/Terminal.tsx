import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {isEmpty} from 'lodash';
import {Dispatch, memo, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {toMs} from '../../../../../../cross/CrossUtils';
import {CustomRunBehaviorData} from '../../../../../../cross/IpcChannelAndTypes';
import {getCardMethod, useAllCardMethods} from '../../../Modules/ModuleLoader';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../../Redux/Reducer/HotkeysReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import {lynxTopToast} from '../../../Utils/UtilHooks';
import XTermCore, {XTermAPI} from '../../Reusable/XTermCore';
import {catchTerminalAddress} from './Terminal_Utils';

type Props = {
  runningCard: RunningCard;
  serializeAddon: SerializeAddon;
  searchAddon: SearchAddon;
  clearTerminal: RefObject<(() => void) | undefined>;
  setSelectedTerminalText: Dispatch<SetStateAction<string>>;
};

const Terminal = memo(({runningCard, serializeAddon, searchAddon, clearTerminal, setSelectedTerminalText}: Props) => {
  const copyPressed = useHotkeysState('copyPressed');
  const activeTab = useTabsState('activeTab');
  const allMethods = useAllCardMethods();
  const dispatch = useDispatch<AppDispatch>();

  const {webUIAddress, id, currentView, tabId} = useMemo(() => runningCard, [runningCard]);

  const xtermRef = useRef<XTermAPI | null>(null);

  const [browserBehavior, setBrowserBehavior] = useState<CustomRunBehaviorData['browser']>('appBrowser');
  const [urlCatchBehavior, setUrlCatchBehavior] = useState<CustomRunBehaviorData['urlCatch'] | undefined>(undefined);

  const copySelection = useCallback(() => {
    const selection = xtermRef.current?.getSelection();
    if (selection) {
      try {
        navigator.clipboard.writeText(selection);
        lynxTopToast(dispatch).success(`Copied to clipboard`);
        xtermRef.current?.clearSelection();
      } catch (e) {
        console.log(e);
        lynxTopToast(dispatch).warning(`Failed to copy. Please try again.`);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (copyPressed) copySelection();
  }, [copyPressed, copySelection]);

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
      const custom = result.customRunBehavior.find(customRun => customRun.cardID === id);
      if (custom) {
        setBrowserBehavior(custom.browser);
        setUrlCatchBehavior(custom.urlCatch);
      }
    });
  }, [id]);

  // URL catching and browser behavior
  useEffect(() => {
    const openUrl = (url: string | undefined, delaySeconds?: number) => {
      if (!url) return;

      const effectiveDelaySeconds = typeof delaySeconds === 'number' ? delaySeconds : 0;
      const delayMs = effectiveDelaySeconds > 0 ? toMs(effectiveDelaySeconds, 'seconds') : 0;

      const executeOpen = () => {
        if (browserBehavior === 'appBrowser') {
          dispatch(cardsActions.setRunningCardAddress({address: url, tabId}));
          dispatch(cardsActions.setRunningCardView({view: 'browser', tabId}));
          rendererIpc.storageUtils.addBrowserRecent(url);
        } else {
          rendererIpc.win.openUrlDefaultBrowser(url);
        }
      };

      if (delayMs > 0) {
        setTimeout(executeOpen, delayMs);
      } else {
        executeOpen();
      }
    };

    const offData = rendererIpc.pty.onData((_, dataID, data) => {
      if (dataID === id) {
        const isAddressEmpty = isEmpty(webUIAddress);

        if (isAddressEmpty) {
          const catchUrlByModule = urlCatchBehavior ? urlCatchBehavior.type === 'module' : true;
          const catchLine = urlCatchBehavior ? urlCatchBehavior.type === 'findLine' : false;
          const targetLine = urlCatchBehavior?.findLine;

          if (catchUrlByModule) {
            const catchAddress = getCardMethod(allMethods, id, 'catchAddress');
            const url = catchAddress ? catchAddress(data) : undefined;
            const moduleDelay = urlCatchBehavior?.moduleDelay ?? 0;
            openUrl(url, moduleDelay);
          } else if (catchLine && targetLine) {
            const url = catchTerminalAddress(data, targetLine);
            openUrl(url);
          }
        }
      }
    });

    return () => offData();
  }, [id, webUIAddress, browserBehavior, dispatch, allMethods, tabId, urlCatchBehavior]);

  // Fit terminal when view changes
  useEffect(() => {
    if (currentView === 'terminal') {
      xtermRef.current?.fit();
    }
  }, [currentView, activeTab]);

  // Handle terminal ready callback
  const handleTerminalReady = useCallback(
    (api: XTermAPI) => {
      xtermRef.current = api;

      // Setup clear terminal ref
      clearTerminal.current = () => api.clear();

      // Setup selection change handler
      api.terminal.onSelectionChange(() => setSelectedTerminalText(api.getSelection()));

      // Setup custom key handler
      api.terminal.attachCustomKeyEventHandler(e => {
        const isCmdOrCtrl = e.ctrlKey || e.metaKey;

        if (e.key === 'f' && isCmdOrCtrl) {
          return false;
        }

        const selection = api.getSelection();
        if (!selection) return true;

        const hasSelection = !isEmpty(selection);

        if (e.key === 'c' && isCmdOrCtrl && hasSelection) {
          return false;
        }

        if ((e.key === 'Backspace' || e.key === 'Delete') && hasSelection) {
          const backspaces = '\b'.repeat(selection.length);
          rendererIpc.pty.write(id, backspaces);
          api.clearSelection();
          return false;
        }

        return true;
      });

      // Setup context menu handler
      const terminalContainer = api.terminal.element?.parentElement;
      const handleContextMenu = () => {
        if (!isEmpty(api.getSelection())) {
          copySelection();
        } else {
          navigator.clipboard.readText().then(text => rendererIpc.pty.write(id, text));
        }
      };

      terminalContainer?.addEventListener('contextmenu', handleContextMenu);

      // Return cleanup for context menu (the terminal dispose is handled by XTermCore)
      return () => {
        terminalContainer?.removeEventListener('contextmenu', handleContextMenu);
      };
    },
    [clearTerminal, setSelectedTerminalText, id, copySelection],
  );

  return (
    <div className={`${currentView === 'terminal' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white pl-3 pr-1 shadow-md dark:bg-LynxNearBlack">
        <XTermCore
          id={id}
          ref={xtermRef}
          searchAddon={searchAddon}
          onReady={handleTerminalReady}
          serializeAddon={serializeAddon}
        />
      </div>
    </div>
  );
});

export default Terminal;
