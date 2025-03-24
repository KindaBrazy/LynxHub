import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {ITheme, IWindowsPty, Terminal as XTerminal} from '@xterm/xterm';
import {message} from 'antd';
import FontFaceObserver from 'fontfaceobserver';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {getCardMethod, useAllCards} from '../../../Modules/ModuleLoader';
import {useAppState} from '../../../Redux/Reducer/AppReducer';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {useTerminalState} from '../../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {getColor} from '../../../Utils/Constants';
import {RunningCard} from '../../../Utils/Types';
import {isWebgl2Supported} from '../../../Utils/UtilFunctions';
import parseTerminalColors from './TerminalColorHandler';

let resizeTimeout: any;

const FONT_FAMILY = 'JetBrainsMono';

type Props = {runningCard: RunningCard};
export default function Terminal({runningCard}: Props) {
  const activeTab = useTabsState('activeTab');
  const allCards = useAllCards();

  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const unicode11Addon = useRef<Unicode11Addon | null>(null);

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

  const getTheme = useCallback(
    (): ITheme => ({
      background: darkMode ? getColor('raisinBlack') : getColor('white'),
      foreground: darkMode ? getColor('white') : getColor('black'),
      cursor: darkMode ? getColor('white') : getColor('black'),
      cursorAccent: darkMode ? getColor('white') : getColor('black'),
      selectionForeground: darkMode ? getColor('black') : getColor('white'),
      selectionBackground: darkMode ? getColor('white', 0.7) : getColor('black', 0.7),
    }),
    [darkMode],
  );

  const copyText = useCallback(() => {
    if (!isEmpty(selectedText)) {
      navigator.clipboard.writeText(selectedText);
      message.success(`Copied to clipboard`);
      terminal.current?.clearSelection();
    }
  }, [selectedText, terminal]);

  useHotkeys('ctrl+c', copyText, {
    keyup: true,
    enableOnFormTags: true,
    enableOnContentEditable: true,
  });

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
      terminal.current.options.theme = getTheme();
    }
  }, [getTheme, terminal.current]);

  useEffect(() => {
    setTheme();
  }, [darkMode]);

  const writeData = useCallback(
    (data: string) => {
      if (isEmpty(webUIAddress) && browserBehavior !== 'doNothing') {
        const catchAddress = getCardMethod(allCards, id, 'catchAddress');
        const url = catchAddress?.(data) || '';
        if (!isEmpty(url)) {
          if (browserBehavior === 'appBrowser') {
            setTimeout(() => {
              dispatch(cardsActions.setRunningCardAddress({address: url, tabId: activeTab}));
              dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: activeTab}));
            }, 1500);
          } else {
            window.open(url);
          }
        }
      }
      terminal.current?.write(outputColor ? parseTerminalColors(data) : data);
    },
    [webUIAddress, id, browserBehavior, outputColor, dispatch, allCards, activeTab],
  );

  const onRightClickRef = useRef<((e: MouseEvent) => void) | null>(null);

  useEffect(() => {
    onRightClickRef.current = () => {
      const isSelectedText = !isEmpty(terminal.current?.getSelection());
      if (isSelectedText) {
        copyText();
      } else {
        navigator.clipboard.readText().then(text => {
          rendererIpc.pty.write(runningCard.id, text);
        });
      }
    };
  }, [copyText, terminal, runningCard]);

  const stableEventHandler = useCallback(e => {
    onRightClickRef.current?.(e);
  }, []);

  useEffect(() => {
    terminalRef.current?.removeEventListener('contextmenu', stableEventHandler);
    terminalRef.current?.addEventListener('contextmenu', stableEventHandler);
  }, [terminalRef, stableEventHandler]);

  useEffect(() => {
    if (currentView === 'terminal') fitAddon.current?.fit();
  }, [currentView, fitAddon]);

  useEffect(() => {
    async function loadTerminal() {
      console.log(runningCard);
      const JetBrainsMono = new FontFaceObserver(FONT_FAMILY);

      const sysInfo = await rendererIpc.win.getSystemInfo();
      const windowsPty: IWindowsPty | undefined =
        sysInfo.os === 'win32'
          ? {
              backend:
                useConpty === 'auto'
                  ? (sysInfo.buildNumber as number) >= 18309
                    ? 'conpty'
                    : 'winpty'
                  : useConpty === 'yes'
                    ? 'conpty'
                    : 'winpty',
              buildNumber: sysInfo.buildNumber as number,
            }
          : undefined;

      JetBrainsMono.load().then(() => {
        let renderMode: 'webgl' | 'canvas' = isWebgl2Supported() ? 'webgl' : 'canvas';

        // Create and initialize the terminal object with a default background and cursor
        terminal.current = new XTerminal({
          allowProposedApi: true,
          rows: 150,
          cols: 150,
          scrollback,
          cursorBlink,
          fontFamily: 'JetBrainsMono',
          fontSize: fontSize,
          scrollOnUserInput: true,
          cursorStyle,
          cursorInactiveStyle,
          windowsPty,
        });

        setTheme();

        fitAddon.current = new FitAddon();
        unicode11Addon.current = new Unicode11Addon();

        terminal.current.loadAddon(fitAddon.current);

        terminal.current.loadAddon(unicode11Addon.current);
        terminal.current.unicode.activeVersion = '11';

        terminal.current.loadAddon(new ClipboardAddon());

        terminal.current.loadAddon(
          new WebLinksAddon((_event, uri) => {
            window.open(uri);
          }),
        );

        // Load terminal ui on the element.
        if (terminalRef.current) terminal.current.open(terminalRef.current);

        if (renderMode === 'webgl') {
          const webglAddon: WebglAddon = new WebglAddon();

          // If on webgl content losing switch to canvas
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

        terminal.current.onResize(size => {
          {
            rendererIpc.pty.resize(runningCard.id, size.cols, size.rows);
          }
        });

        // Fit terminal to element
        fitAddon.current.fit();

        terminal.current.onSelectionChange(() => {
          setSelectedText(terminal.current?.getSelection() || '');
        });

        terminal.current.attachCustomKeyEventHandler(e => {
          const isSelectedText = !isEmpty(terminal.current?.getSelection());
          return !(e.key === 'c' && e.ctrlKey && isSelectedText);
        });

        terminal.current.onData(data => {
          if (!isEmpty(data)) rendererIpc.pty.write(runningCard.id, data);
        });
      });
    }

    if (terminalRef.current && !terminal.current) {
      loadTerminal();
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        fitAddon.current?.fit();
      }, resizeDelay);
    });

    rendererIpc.pty.onData((_, dataID, data) => {
      if (dataID === runningCard.id) writeData(data);
    });

    return () => {
      window.removeEventListener('resize', () => {});
      rendererIpc.pty.offData();
    };
  }, [terminalRef.current]);

  return (
    <div className={`${currentView === 'terminal' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white pl-3 pr-1 shadow-md dark:bg-LynxRaisinBlack">
        <div ref={terminalRef} className="relative size-full" />
      </div>
    </div>
  );
}
