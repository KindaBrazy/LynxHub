import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {SerializeAddon} from '@xterm/addon-serialize';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {Terminal as XTerminal} from '@xterm/xterm';
import FontFaceObserver from 'fontfaceobserver';
import {isEmpty, isEqual} from 'lodash';
import {Dispatch, memo, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {CustomRunBehaviorData, SystemInfo} from '../../../../../../cross/IpcChannelAndTypes';
import {getCardMethod, useAllCardMethods} from '../../../Modules/ModuleLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../../Redux/Reducer/HotkeysReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {useTerminalStat} from '../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import {lynxTopToast} from '../../../Utils/UtilHooks';
import {catchTerminalAddress, getRendererMode, getTheme, getWindowPty} from './Terminal_Utils';
import parseTerminalColors from './TerminalColorHandler';

const FONT_FAMILY = 'JetBrainsMono';
const MIN_RESIZE_COLS = 95;
const MIN_RESIZE_ROWS = 22;

type Props = {
  runningCard: RunningCard;
  serializeAddon?: SerializeAddon;
  clearTerminal: RefObject<(() => void) | undefined>;
  setSelectedTerminalText: Dispatch<SetStateAction<string>>;
};

const Terminal = memo(({runningCard, serializeAddon, clearTerminal, setSelectedTerminalText}: Props) => {
  const copyPressed = useHotkeysState('copyPressed');
  const activeTab = useTabsState('activeTab');
  const allMethods = useAllCardMethods();

  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const {outputColor, useConpty, scrollBack, fontSize, cursorStyle, cursorInactiveStyle, blinkCursor, resizeDelay} =
    useTerminalStat();

  const {webUIAddress, id, currentView, tabId} = useMemo(() => runningCard, [runningCard]);

  const darkMode = useAppState('darkMode');
  const dispatch = useDispatch<AppDispatch>();

  const [browserBehavior, setBrowserBehavior] = useState<CustomRunBehaviorData['browser']>('appBrowser');
  const [urlCatchBehavior, setUrlCatchBehavior] = useState<CustomRunBehaviorData['urlCatch'] | undefined>(undefined);

  const canResize = useCallback(() => {
    const dims = fitAddon.current?.proposeDimensions();
    if (!dims) return false;
    return dims.cols > MIN_RESIZE_COLS && dims.rows > MIN_RESIZE_ROWS;
  }, []);

  const copySelection = useCallback(() => {
    const selection = terminal.current?.getSelection();
    if (selection) {
      try {
        navigator.clipboard.writeText(selection);
        lynxTopToast(dispatch).success(`Copied to clipboard`);
        terminal.current?.clearSelection();
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

  useEffect(() => {
    const openUrl = (url: string | undefined) => {
      if (url) {
        if (browserBehavior === 'appBrowser') {
          dispatch(cardsActions.setRunningCardAddress({address: url, tabId}));
          dispatch(cardsActions.setRunningCardView({view: 'browser', tabId}));
          rendererIpc.storageUtils.addBrowserRecent(url);
        } else {
          rendererIpc.win.openUrlDefaultBrowser(url);
        }
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
            openUrl(url);
          } else if (catchLine && targetLine) {
            const url = catchTerminalAddress(data, targetLine);
            openUrl(url);
          }
        }

        terminal.current?.write(outputColor ? parseTerminalColors(data) : data);
      }
    });

    return () => offData();
  }, [id, webUIAddress, browserBehavior, outputColor, dispatch, allMethods, tabId, urlCatchBehavior]);

  useEffect(() => {
    if (currentView === 'terminal' && canResize()) {
      fitAddon.current?.fit();
    }
  }, [currentView, activeTab, canResize]);

  useEffect(() => {
    const terminalContainer = terminalContainerRef.current;
    if (!terminalContainer || terminal.current) return;

    let xTerm: XTerminal | null = null;

    const loadTerminal = (sysInfo?: SystemInfo, fontFamily: string = 'monospace') => {
      const windowsPty = sysInfo ? getWindowPty(sysInfo, useConpty) : undefined;
      const renderMode = getRendererMode();

      xTerm = new XTerminal({
        allowProposedApi: true,
        fontFamily,
        scrollOnUserInput: true,
        scrollback: scrollBack,
        cursorBlink: blinkCursor,
        fontSize,
        cursorStyle,
        cursorInactiveStyle,
        windowsPty,
        theme: getTheme(darkMode),
      });

      terminal.current = xTerm;

      clearTerminal.current = () => {
        xTerm?.clear();
        rendererIpc.pty.clear(id);
      };

      fitAddon.current = new FitAddon();
      xTerm.loadAddon(fitAddon.current);
      xTerm.loadAddon(new Unicode11Addon());
      xTerm.unicode.activeVersion = '11';
      xTerm.loadAddon(new ClipboardAddon());
      xTerm.loadAddon(new WebLinksAddon((_, uri) => window.open(uri)));
      if (serializeAddon) xTerm.loadAddon(serializeAddon);

      xTerm.open(terminalContainer);

      if (renderMode === 'webgl') {
        const webglAddon = new WebglAddon();
        webglAddon.onContextLoss(() => webglAddon.dispose());
        xTerm.loadAddon(webglAddon);
      } else {
        xTerm.loadAddon(new CanvasAddon());
      }

      let prevSize: {cols: number; rows: number} | undefined;
      xTerm.onResize(size => {
        if (isEqual(prevSize, size)) return;
        rendererIpc.pty.resize(id, size.cols, size.rows);
        prevSize = size;
      });

      fitAddon.current.fit();

      xTerm.onSelectionChange(() => setSelectedTerminalText(xTerm?.getSelection() || ''));

      xTerm.attachCustomKeyEventHandler(e => {
        const selection = xTerm?.getSelection();
        if (!selection) return true;

        const hasSelection = !isEmpty(selection);

        if (e.key === 'c' && e.ctrlKey && hasSelection) {
          return false;
        }

        if ((e.key === 'Backspace' || e.key === 'Delete') && hasSelection) {
          const backspaces = '\b'.repeat(selection.length);
          rendererIpc.pty.write(id, backspaces);
          xTerm?.clearSelection();
          return false;
        }

        return true;
      });

      xTerm.onData(data => !isEmpty(data) && rendererIpc.pty.write(id, data));
    };

    const font = new FontFaceObserver(FONT_FAMILY);
    Promise.all([rendererIpc.win.getSystemInfo(), font.load()])
      .then(([sysInfo]) => loadTerminal(sysInfo, FONT_FAMILY))
      .catch(() => {
        rendererIpc.win.getSystemInfo().then(sysInfo => loadTerminal(sysInfo));
        lynxTopToast(dispatch).warning('Terminal font failed to load. Using fallback.');
      });

    let resizeTimeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        if (canResize()) fitAddon.current?.fit();
      }, resizeDelay);
    };

    const handleContextMenu = (_e: MouseEvent) => {
      if (!isEmpty(terminal.current?.getSelection())) {
        copySelection();
      } else {
        navigator.clipboard.readText().then(text => rendererIpc.pty.write(id, text));
      }
    };

    let resizeTimeout: any;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, resizeDelay);
    };

    window.addEventListener('resize', debouncedResize);
    terminalContainer.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      terminalContainer?.removeEventListener('contextmenu', handleContextMenu);
      terminal.current?.dispose();
      terminal.current = null;
    };
  }, [clearTerminal, id, serializeAddon, setSelectedTerminalText, dispatch, copySelection, canResize]);

  useEffect(() => {
    if (terminal.current) terminal.current.options.theme = getTheme(darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (terminal.current) {
      terminal.current.options.fontSize = fontSize;
      fitAddon.current?.fit();
    }
  }, [fontSize]);

  useEffect(() => {
    if (terminal.current) terminal.current.options.scrollback = scrollBack;
  }, [scrollBack]);

  useEffect(() => {
    if (terminal.current) terminal.current.options.cursorBlink = blinkCursor;
  }, [blinkCursor]);

  useEffect(() => {
    if (terminal.current) {
      terminal.current.options.cursorStyle = cursorStyle;
      terminal.current.options.cursorInactiveStyle = cursorInactiveStyle;
    }
  }, [cursorStyle, cursorInactiveStyle]);

  return (
    <div className={`${currentView === 'terminal' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white pl-3 pr-1 shadow-md dark:bg-LynxNearBlack">
        <div ref={terminalContainerRef} className="relative size-full" />
      </div>
    </div>
  );
});

export default Terminal;
