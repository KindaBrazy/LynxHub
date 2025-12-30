import {IProgressState} from '@xterm/addon-progress';
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
import {tabsActions, useTabsState} from '../../../Redux/Reducer/TabsReducer';
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
  const tabs = useTabsState('tabs');
  const allMethods = useAllCardMethods();
  const dispatch = useDispatch<AppDispatch>();

  const {webUIAddress, id, currentView, tabId} = useMemo(() => runningCard, [runningCard]);

  const xtermRef = useRef<XTermAPI | null>(null);
  const contextMenuCleanupRef = useRef<(() => void) | null>(null);

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

  // Store refs for values needed in setTimeout
  const browserBehaviorRef = useRef(browserBehavior);
  const tabIdRef = useRef(tabId);

  useEffect(() => {
    browserBehaviorRef.current = browserBehavior;
  }, [browserBehavior]);

  useEffect(() => {
    tabIdRef.current = tabId;
  }, [tabId]);

  // URL catching and browser behavior
  useEffect(() => {
    const openUrl = (url: string | undefined, delaySeconds?: number) => {
      if (!url) return;

      const effectiveDelaySeconds = typeof delaySeconds === 'number' ? delaySeconds : 0;
      const delayMs = effectiveDelaySeconds > 0 ? toMs(effectiveDelaySeconds, 'seconds') : 0;

      const executeOpen = () => {
        if (browserBehaviorRef.current === 'appBrowser') {
          dispatch(cardsActions.setRunningCardAddress({address: url, tabId: tabIdRef.current}));
          dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: tabIdRef.current}));
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

  // Handle terminal progress (ConEmu OSC 9;4 sequence)
  const handleProgress = useCallback(
    (progress: IProgressState) => {
      const {state, value} = progress;

      // Update tab progress state in Redux
      dispatch(
        tabsActions.setTabProgress({
          tabID: tabId,
          progress: state === 0 ? undefined : {state: state as 0 | 1 | 2 | 3 | 4, value},
        }),
      );

      // Update Electron window progress bar (only for active tab)
      if (tabId === activeTab) {
        if (state === 0) {
          // Remove progress bar
          rendererIpc.win.setProgressBar(-1);
        } else if (state === 1) {
          // Normal progress
          rendererIpc.win.setProgressBar(value / 100, {mode: 'normal'});
        } else if (state === 2) {
          // Error state
          rendererIpc.win.setProgressBar(value / 100, {mode: 'error'});
        } else if (state === 3) {
          // Indeterminate
          rendererIpc.win.setProgressBar(2, {mode: 'indeterminate'});
        } else if (state === 4) {
          // Paused/Warning
          rendererIpc.win.setProgressBar(value / 100, {mode: 'paused'});
        }
      }
    },
    [dispatch, tabId, activeTab],
  );

  // Sync window progress bar when this tab becomes active
  useEffect(() => {
    if (tabId !== activeTab) return;

    // Get current tab's progress from tabs state
    const currentTab = tabs.find(t => t.id === tabId);
    const currentProgress = currentTab?.progress;
    if (!currentProgress || currentProgress.state === 0) {
      rendererIpc.win.setProgressBar(-1);
    } else {
      const {state, value} = currentProgress;
      if (state === 1) {
        rendererIpc.win.setProgressBar(value / 100, {mode: 'normal'});
      } else if (state === 2) {
        rendererIpc.win.setProgressBar(value / 100, {mode: 'error'});
      } else if (state === 3) {
        rendererIpc.win.setProgressBar(2, {mode: 'indeterminate'});
      } else if (state === 4) {
        rendererIpc.win.setProgressBar(value / 100, {mode: 'paused'});
      }
    }
  }, [activeTab, tabId, tabs]);

  // Cleanup context menu listener on unmount
  useEffect(() => {
    return () => {
      contextMenuCleanupRef.current?.();
    };
  }, []);

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
          // Clipboard readText requires document focus - wrap in try-catch to handle NotAllowedError
          navigator.clipboard
            .readText()
            .then(text => {
              if (text) rendererIpc.pty.write(id, text);
            })
            .catch(() => {
              // Silently ignore - document may not be focused or clipboard permission denied
            });
        }
      };

      terminalContainer?.addEventListener('contextmenu', handleContextMenu);

      // Store cleanup function in ref
      contextMenuCleanupRef.current = () => {
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
          onProgress={handleProgress}
          onReady={handleTerminalReady}
          serializeAddon={serializeAddon}
        />
      </div>
    </div>
  );
});

export default Terminal;
