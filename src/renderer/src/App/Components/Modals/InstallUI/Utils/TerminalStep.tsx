import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {ITheme, IWindowsPty, Terminal} from '@xterm/xterm';
import FontFaceObserver from 'fontfaceobserver';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useRef} from 'react';

import {useAppState} from '../../../../Redux/App/AppReducer';
import rendererIpc from '../../../../RendererIpc';
import {getColor} from '../../../../Utils/Constants';
import {isWebgl2Supported} from '../../../../Utils/UtilFunctions';

let resizeTimeout: any;

const RESIZE_DELAY = 77;
const FONT_FAMILY = 'JetBrainsMono';
const FONT_SIZE = 14;

export default function TerminalStep() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const unicode11Addon = useRef<Unicode11Addon | null>(null);
  const darkMode = useAppState('darkMode');

  const getTheme = useCallback(
    (): ITheme => ({
      background: darkMode ? '#18181B' : '#ffffff',
      foreground: darkMode ? getColor('white') : getColor('black'),
      cursor: darkMode ? getColor('white') : getColor('black'),
      cursorAccent: darkMode ? getColor('white') : getColor('black'),
      selectionForeground: darkMode ? getColor('black') : getColor('white'),
      selectionBackground: darkMode ? getColor('white', 0.7) : getColor('black', 0.7),
    }),
    [darkMode],
  );

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
      terminal.current?.write(data);
    },
    [terminal.current],
  );

  useEffect(() => {
    async function loadTerminal() {
      const JetBrainsMono = new FontFaceObserver(FONT_FAMILY);

      const sysInfo = await rendererIpc.win.getSystemInfo();
      const windowsPty: IWindowsPty | undefined =
        sysInfo.os === 'win32'
          ? {
              backend: (sysInfo.buildNumber as number) >= 18309 ? 'conpty' : 'winpty',
              buildNumber: sysInfo.buildNumber as number,
            }
          : undefined;

      JetBrainsMono.load().then(() => {
        let renderMode: 'webgl' | 'canvas' = isWebgl2Supported() ? 'webgl' : 'canvas';

        // Create and initialize the terminal object with a default background and cursor
        terminal.current = new Terminal({
          allowProposedApi: true,
          rows: 150,
          cols: 150,
          scrollback: 10000,
          cursorBlink: true,
          fontFamily: 'JetBrainsMono',
          fontSize: FONT_SIZE,
          scrollOnUserInput: true,
          cursorStyle: 'bar',
          cursorInactiveStyle: 'none',
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
            console.log('onContextLoss');
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
            rendererIpc.pty.resize(size.cols, size.rows);
          }
        });

        // Fit terminal to element
        fitAddon.current.fit();

        terminal.current.onData(data => {
          if (!isEmpty(data)) rendererIpc.pty.write(data);
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
      }, RESIZE_DELAY);
    });

    rendererIpc.pty.onData((_, data) => {
      writeData(data);
    });

    return () => {
      window.removeEventListener('resize', () => {});
      rendererIpc.pty.offData();
    };
  }, [terminalRef]);

  return <div ref={terminalRef} className={'my-2 overflow-hidden'} />;
}
