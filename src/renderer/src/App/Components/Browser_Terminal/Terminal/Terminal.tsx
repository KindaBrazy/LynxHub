import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {Terminal as XTerminal} from '@xterm/xterm';
import FontFaceObserver from 'fontfaceobserver';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {getCardMethod, useAllCards} from '../../../Modules/ModuleLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../../Redux/Reducer/HotkeysReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {useTerminalState} from '../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import {lynxTopToast} from '../../../Utils/UtilHooks';
import {getRendererMode, getTheme, getWindowPty} from './Terminal_Utils';
import parseTerminalColors from './TerminalColorHandler';

let resizeTimeout: any;

const FONT_FAMILY = 'JetBrainsMono';

type Props = {runningCard: RunningCard; setTerminalContent?: Dispatch<SetStateAction<string>>};
export default function Terminal({runningCard, setTerminalContent}: Props) {
  const copyPressed = useHotkeysState('copyPressed');
  const activeTab = useTabsState('activeTab');
  const allCards = useAllCards();

  const terminal = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const outputColor = useTerminalState('outputColor');
  const useConpty = useTerminalState('useConpty');
  const scrollback = useTerminalState('scrollBack');
  const fontSize = useTerminalState('fontSize');
  const cursorStyle = useTerminalState('cursorStyle');
  const cursorInactiveStyle = useTerminalState('cursorInactiveStyle');
  const cursorBlink = useTerminalState('blinkCursor');
  const resizeDelay = useTerminalState('resizeDelay');

  const [selectedText, setSelectedText] = useState<string>('');

  const {webUIAddress, id, currentView} = runningCard;
  const darkMode = useAppState('darkMode');
  const dispatch = useDispatch<AppDispatch>();

  const [browserBehavior, setBrowserBehavior] = useState<'appBrowser' | 'defaultBrowser' | 'doNothing' | string>(
    'appBrowser',
  );

  const copyText = useCallback(() => {
    if (!isEmpty(selectedText)) {
      navigator.clipboard.writeText(selectedText);
      lynxTopToast.success(`Copied to clipboard`);
      terminal.current?.clearSelection();
    }
  }, [selectedText, terminal]);

  useEffect(() => {
    if (copyPressed) copyText();
  }, [copyPressed]);

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
      const custom = result.customRunBehavior.find(customRun => customRun.cardID === id);
      if (custom) {
        setBrowserBehavior(custom.browser);
      }
    });
  }, [id]);

  const setTheme = useCallback(() => {
    if (terminal.current) {
      terminal.current.options.theme = getTheme(darkMode);
    }
  }, [terminal, darkMode]);

  useEffect(() => {
    setTheme();
  }, [darkMode]);

  const writeData = useCallback(
    (data: string) => {
      const xTerminal = terminal.current;
      if (!xTerminal) return;

      if (isEmpty(webUIAddress) && browserBehavior !== 'doNothing') {
        const catchAddress = getCardMethod(allCards, id, 'catchAddress');
        const url = catchAddress?.(data) || '';
        if (!isEmpty(url)) {
          if (browserBehavior === 'appBrowser') {
            dispatch(cardsActions.setRunningCardAddress({address: url, tabId: activeTab}));
            dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: activeTab}));
            rendererIpc.storageUtils.addBrowserRecent({url, favIcon: ''});
          } else {
            rendererIpc.win.openUrlDefaultBrowser(url);
          }
        }
      }
      xTerminal.write(outputColor ? parseTerminalColors(data) : data);

      let fullText = '';
      const buffer = xTerminal.buffer.active;
      for (let i = 0; i < buffer.length; i++) {
        const line = buffer.getLine(i)?.translateToString(true);
        if (line) {
          fullText += line + '\n';
        }
      }

      setTerminalContent?.(fullText);
    },
    [webUIAddress, id, terminal, browserBehavior, outputColor, dispatch, allCards, activeTab],
  );

  const onRightClickRef = useRef<((e: MouseEvent) => void) | null>(null);

  useEffect(() => {
    onRightClickRef.current = () => {
      const isSelectedText = !isEmpty(terminal.current?.getSelection());
      if (isSelectedText) {
        copyText();
      } else {
        navigator.clipboard.readText().then(text => {
          rendererIpc.pty.write(id, text);
        });
      }
    };
  }, [copyText, terminal, id]);

  const stableEventHandler = useCallback(e => {
    onRightClickRef.current?.(e);
  }, []);

  useEffect(() => {
    if (currentView === 'terminal') fitAddon.current?.fit();
  }, [currentView]);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const initialTerminal = (terminalRef: HTMLDivElement | null) => {
    if (!terminalRef || isLoaded) return;
    setIsLoaded(true);

    const JetBrainsMono = new FontFaceObserver(FONT_FAMILY);

    Promise.all([rendererIpc.win.getSystemInfo(), JetBrainsMono.load()]).then(result => {
      const [sysInfo] = result;

      const windowsPty = getWindowPty(sysInfo, useConpty);
      let renderMode = getRendererMode();

      terminal.current = new XTerminal({
        allowProposedApi: true,
        rows: 150,
        cols: 150,
        fontFamily: 'JetBrainsMono',
        scrollOnUserInput: true,
        scrollback,
        cursorBlink,
        fontSize,
        cursorStyle,
        cursorInactiveStyle,
        windowsPty,
      });

      setTheme();

      fitAddon.current = new FitAddon();
      terminal.current.loadAddon(fitAddon.current);

      terminal.current.loadAddon(new Unicode11Addon());
      terminal.current.unicode.activeVersion = '11';

      terminal.current.loadAddon(new ClipboardAddon());

      terminal.current.loadAddon(
        new WebLinksAddon((_event, uri) => {
          window.open(uri);
        }),
      );

      terminal.current.open(terminalRef);

      if (renderMode === 'webgl') {
        const webglAddon: WebglAddon = new WebglAddon();

        webglAddon.onContextLoss(() => {
          webglAddon.dispose();
          terminal.current?.loadAddon(new CanvasAddon());
          renderMode = 'canvas';
        });

        terminal.current.loadAddon(webglAddon);

        renderMode = 'webgl';
      } else {
        terminal.current.loadAddon(new CanvasAddon());
        renderMode = 'canvas';
      }

      terminal.current.onResize(size => rendererIpc.pty.resize(id, size.cols, size.rows));

      fitAddon.current.fit();

      terminal.current.onSelectionChange(() => {
        setSelectedText(terminal.current?.getSelection() || '');
      });

      terminal.current.attachCustomKeyEventHandler(e => {
        const isSelectedText = !isEmpty(terminal.current?.getSelection());
        return !(e.key === 'c' && e.ctrlKey && isSelectedText);
      });

      terminal.current.onData(data => {
        if (!isEmpty(data)) rendererIpc.pty.write(id, data);
      });
    });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        fitAddon.current?.fit();
      }, resizeDelay);
    });

    rendererIpc.pty.onData((_, dataID, data) => {
      if (dataID === id) writeData(data);
    });

    terminalRef.removeEventListener('contextmenu', stableEventHandler);
    terminalRef.addEventListener('contextmenu', stableEventHandler);
  };

  return (
    <div className={`${currentView === 'terminal' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white pl-3 pr-1 shadow-md dark:bg-LynxRaisinBlack">
        <div ref={initialTerminal} className="relative size-full" />
      </div>
    </div>
  );
}
