// Import Packages
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {motion, Variants} from 'framer-motion';
import {shell} from 'electron';
// Import Xterm
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {WebglAddon} from 'xterm-addon-webgl';
import {Unicode11Addon} from 'xterm-addon-unicode11';
import {CanvasAddon} from 'xterm-addon-canvas';
import {LigaturesAddon} from 'xterm-addon-ligatures';
import 'xterm/css/xterm.css';
// Import Modules
import {getBlack, getLynxRaisinBlack, getWhite, RendererLogInfo} from '../../../AppState/AppConstants';
import {ipcBackendRuns} from '../RendererIpcHandler';
import StatusContext, {StatusContextType} from '../GlobalStateContext';

// Check if Webgl supported and is available
function isWebglSupported() {
  let result: undefined | boolean = window.WebGL2RenderingContext ? undefined : false;
  if (!result) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const webGl: WebGL2RenderingContext | null = canvas.getContext('webgl2', {depth: false, antialias: false});
    result = webGl instanceof window.WebGL2RenderingContext;
  }
  return result;
}

let renderMode: 'webgl' | 'canvas';

type Props = {
  // Extra class names for the root element
  extraClasses?: string;
};

export default function TerminalOutputUi({extraClasses}: Props) {
  const {isDarkMode, webuiRunning, webuiLaunch, setWebuiLaunch} = useContext(StatusContext) as StatusContextType;

  // Reference to the terminal element
  const terminalRef = useRef<HTMLDivElement>(null);

  // Terminal objects
  const term = useRef(new Terminal());
  const fitAddon = useRef(new FitAddon());

  // Motion animation variants
  const variants: Variants = {
    initial: {
      translateY: 'calc(100% + 50px)',
      opacity: 0,
    },
    animate: {
      translateY: webuiLaunch.currentView === 'terminal' ? '0' : 'calc(100% + 50px)',
      opacity: webuiLaunch.currentView === 'terminal' ? 1 : 0,
      transition: {duration: 0.7, type: 'spring'},
    },
  };

  // Reading the code below is much easier and better to understand than I document it. 😒
  renderMode = isWebglSupported() ? 'webgl' : 'canvas';

  // Showing data from backend to ui
  const showContent = useCallback((_event: any, data: string) => {
    // Check if webui ready to show
    if (data.toLowerCase().includes('Running on'.toLowerCase())) {
      console.log(RendererLogInfo(`Found Launch Here: ${data}`));
      /* Extract ip address of webui running to open in webView */
      const addressRegex: RegExp = /(http:\/\/[\d.:]+)/;
      const match: RegExpMatchArray | null = data.match(addressRegex);
      if (match) {
        console.log(RendererLogInfo(`The Address Is : ${match[1]}`));
        // Load webui after delay to be sure completely is ready.
        setTimeout(() => {
          if (setWebuiLaunch) setWebuiLaunch({webViewRef: webuiLaunch.webViewRef, currentView: 'webView', currentAddress: match[1]});
        }, 1500);
      }
    }
    // Write data from backend pty to ui
    term.current.write(data);
  }, []);

  useEffect(() => {
    if (term.current && terminalRef.current) {
      // Create and initialize the terminal object with a default background and cursor
      term.current = new Terminal({
        theme: {foreground: isDarkMode ? getWhite() : getBlack(), background: isDarkMode ? getLynxRaisinBlack() : getWhite()},
        cursorStyle: 'underline',
        allowProposedApi: true,
        scrollback: 10000,
      });

      // Addon to fitting the terminal's dimensions to a containing element
      term.current.loadAddon(fitAddon.current);

      // Addon to open any link in the terminal in user browser
      term.current.loadAddon(
        new WebLinksAddon((_event, uri) => {
          shell.openExternal(uri);
        }),
      );

      // Based on user render mode, choose addon to load (WebGl if is supported, if not Canvas)
      if (renderMode === 'webgl') {
        const webglAddon: WebglAddon = new WebglAddon();

        // If on webgl content losing switch to canvas
        webglAddon.onContextLoss(() => {
          webglAddon.dispose();
          term.current.loadAddon(new CanvasAddon());
          renderMode = 'canvas';
        });

        term.current.loadAddon(webglAddon);

        renderMode = 'webgl';
      } else {
        term.current.loadAddon(new CanvasAddon());

        renderMode = 'canvas';
      }

      // Unicode version 11 rules for terminal.
      term.current.loadAddon(new Unicode11Addon());
      term.current.unicode.activeVersion = '11';

      // Load terminal ui on the element.
      term.current.open(terminalRef.current);

      if (renderMode === 'canvas') {
        // support for programming ligatures to terminal
        term.current.loadAddon(new LigaturesAddon());
      }

      // Fit terminal to element
      fitAddon.current.fit();

      // Resize pty background cols and rows to the current size of terminal ui
      if (webuiRunning) ipcBackendRuns.resizePty({cols: term.current.cols, rows: term.current.rows});
    }

    // Get output from Pty backend and show in renderer terminal
    ipcBackendRuns.getPtyOutput(showContent);
  }, []);

  // Fitting the terminal's dimensions to the element.
  window.addEventListener('resize', () => {
    if (webuiRunning) {
      fitAddon.current.fit();
      // Resize pty background cols and rows to the current size of terminal ui
      ipcBackendRuns.resizePty({cols: term.current.cols, rows: term.current.rows});
    }
  });

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className={['absolute inset-4 overflow-hidden rounded-2xl bg-white shadow-SideBar dark:bg-[#212121]', extraClasses].join(' ')}>
      <div ref={terminalRef} className="absolute bottom-2 left-4 right-2 top-4" />
    </motion.div>
  );
}
// Default values for props when not provided
TerminalOutputUi.defaultProps = {
  extraClasses: '',
};
