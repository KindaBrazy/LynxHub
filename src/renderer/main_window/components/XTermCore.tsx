import parseTerminalColors from '@lynx/features/session/terminal/colorHandler';
import {getRendererMode, getTheme, getWindowPty} from '@lynx/features/session/terminal/utils';
import {lynxTopToast} from '@lynx/hooks/utils';
import {useAppState} from '@lynx/redux/reducers/app';
import {useTerminalStat} from '@lynx/redux/reducers/terminal';
import {AppDispatch} from '@lynx/redux/store';
import applicationIpc from '@lynx_shared/ipc/application';
import ptyIpc from '@lynx_shared/ipc/pty';
import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {LigaturesAddon} from '@xterm/addon-ligatures';
import {IProgressState, ProgressAddon} from '@xterm/addon-progress';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {Unicode11Addon} from '@xterm/addon-unicode11';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {Terminal as XTerminal} from '@xterm/xterm';
import FontFaceObserver from 'fontfaceobserver';
import {isEmpty, isEqual} from 'lodash';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import {useDispatch} from 'react-redux';

const FONT_FAMILY = 'JetBrainsMono';
const MIN_RESIZE_COLS = 95;
const MIN_RESIZE_ROWS = 22;

export interface XTermAPI {
  terminal: XTerminal;
  fitAddon: FitAddon;
  clear: () => void;
  getSelection: () => string;
  clearSelection: () => void;
  write: (data: string) => void;
  fit: () => void;
}

export interface XTermCoreProps {
  id: string;
  onReady?: (api: XTermAPI) => void;
  outputColor?: boolean;
  className?: string;

  // Optional external addons
  serializeAddon?: SerializeAddon;
  searchAddon?: SearchAddon;

  // Optional settings overrides (defaults from terminal settings)
  fontSize?: number;
  scrollBack?: number;
  cursorStyle?: 'block' | 'underline' | 'bar';
  cursorInactiveStyle?: 'none' | 'block' | 'underline' | 'bar' | 'outline';
  blinkCursor?: boolean;
  resizeDelay?: number;

  // Enable PTY write (for interactive terminals)
  enablePtyWrite?: boolean;

  // Enable resize IPC notifications
  enableResizeNotify?: boolean;

  // Minimum resize constraints (set to 0 to disable)
  minResizeCols?: number;
  minResizeRows?: number;

  // Terminal progress callback (ConEmu OSC 9;4 sequence)
  onProgress?: (progress: IProgressState) => void;
}

const XTermCore = memo(
  forwardRef<XTermAPI, XTermCoreProps>(
    (
      {
        id,
        onReady,
        outputColor = true,
        className = '',
        serializeAddon,
        searchAddon,
        fontSize: fontSizeOverride,
        scrollBack: scrollBackOverride,
        cursorStyle: cursorStyleOverride,
        cursorInactiveStyle: cursorInactiveStyleOverride,
        blinkCursor: blinkCursorOverride,
        resizeDelay: resizeDelayOverride,
        enablePtyWrite = true,
        enableResizeNotify = true,
        minResizeCols = MIN_RESIZE_COLS,
        minResizeRows = MIN_RESIZE_ROWS,
        onProgress,
      },
      ref,
    ) => {
      const terminalContainerRef = useRef<HTMLDivElement | null>(null);
      const terminal = useRef<XTerminal | null>(null);
      const fitAddon = useRef<FitAddon | null>(null);
      const apiRef = useRef<XTermAPI | null>(null);

      const dispatch = useDispatch<AppDispatch>();
      const darkMode = useAppState('darkMode');
      const terminalSettings = useTerminalStat();

      // Use overrides or fall back to settings
      const fontSize = fontSizeOverride ?? terminalSettings.fontSize;
      const scrollBack = scrollBackOverride ?? terminalSettings.scrollBack;
      const cursorStyle = cursorStyleOverride ?? terminalSettings.cursorStyle;
      const cursorInactiveStyle = cursorInactiveStyleOverride ?? terminalSettings.cursorInactiveStyle;
      const blinkCursor = blinkCursorOverride ?? terminalSettings.blinkCursor;
      const resizeDelay = resizeDelayOverride ?? terminalSettings.resizeDelay;
      const useConpty = terminalSettings.useConpty;
      const enableLigatures = terminalSettings.enableLigatures;

      const canResize = useCallback(() => {
        if (minResizeCols === 0 && minResizeRows === 0) return true;
        const dims = fitAddon.current?.proposeDimensions();
        if (!dims) return false;
        return dims.cols > minResizeCols && dims.rows > minResizeRows;
      }, [minResizeCols, minResizeRows]);

      // Expose API via ref - only updates when apiRef is set
      useImperativeHandle(
        ref,
        () =>
          apiRef.current || {
            terminal: null as unknown as XTerminal,
            fitAddon: null as unknown as FitAddon,
            clear: () => {},
            getSelection: () => '',
            clearSelection: () => {},
            write: () => {},
            fit: () => {},
          },
        [],
      );

      // Initialize terminal
      useEffect(() => {
        const terminalContainer = terminalContainerRef.current;
        if (!terminalContainer || terminal.current) return;

        let xTerm: XTerminal | null = null;
        let onResizeDisposable: {dispose: () => void} | null = null;
        let onDataDisposable: {dispose: () => void} | null = null;

        const loadTerminal = async (fontFamily: string = 'monospace') => {
          const sysInfo = await applicationIpc.invoke.getSystemInfo();
          const windowsPty = getWindowPty(sysInfo, useConpty);
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

          fitAddon.current = new FitAddon();
          xTerm.loadAddon(fitAddon.current);
          xTerm.loadAddon(new Unicode11Addon());
          xTerm.unicode.activeVersion = '11';
          xTerm.loadAddon(new ClipboardAddon());
          xTerm.loadAddon(new WebLinksAddon((_, uri) => window.open(uri)));

          // Load optional external addons
          if (serializeAddon) xTerm.loadAddon(serializeAddon);
          if (searchAddon) xTerm.loadAddon(searchAddon);

          xTerm.open(terminalContainer);

          // Store reference for use in requestAnimationFrame callback
          const termRef = xTerm;
          const fitRef = fitAddon.current;

          // Wait for next frame to ensure renderer is initialized before fitting
          requestAnimationFrame(() => {
            if (!termRef) return;

            if (renderMode === 'webgl') {
              try {
                const webglAddon = new WebglAddon();
                webglAddon.onContextLoss(() => webglAddon.dispose());
                termRef.loadAddon(webglAddon);
              } catch (e) {
                console.warn('Failed to load WebGL addon, falling back to canvas:', e);
                termRef.loadAddon(new CanvasAddon());
              }
            } else {
              termRef.loadAddon(new CanvasAddon());
            }

            // Load ligatures addon if enabled
            if (enableLigatures) {
              try {
                termRef.loadAddon(new LigaturesAddon());
              } catch (e) {
                console.warn('Failed to load ligatures addon:', e);
              }
            }

            // Load progress addon for ConEmu OSC 9;4 sequence support
            if (onProgress) {
              const progressAddon = new ProgressAddon();
              termRef.loadAddon(progressAddon);
              progressAddon.onChange(onProgress);
            }

            // Resize notification
            if (enableResizeNotify) {
              let prevSize: {cols: number; rows: number} | undefined;
              onResizeDisposable = termRef.onResize(size => {
                if (isEqual(prevSize, size)) return;
                ptyIpc.resize(id, size.cols, size.rows);
                prevSize = size;
              });
            }

            // Fit after renderer is ready
            try {
              fitRef?.fit();
            } catch (e) {
              console.warn('Failed to fit terminal:', e);
            }

            // PTY write
            if (enablePtyWrite) {
              onDataDisposable = termRef.onData(data => !isEmpty(data) && ptyIpc.write(id, data));
            }

            // Create API
            apiRef.current = {
              terminal: termRef,
              fitAddon: fitRef,
              clear: () => {
                termRef?.clear();
                ptyIpc.clear(id);
              },
              getSelection: () => termRef?.getSelection() || '',
              clearSelection: () => termRef?.clearSelection(),
              write: (data: string) => termRef?.write(outputColor ? parseTerminalColors(data) : data),
              fit: () => {
                try {
                  if (canResize()) fitRef?.fit();
                } catch (e) {
                  console.warn('Failed to fit terminal:', e);
                }
              },
            };

            onReady?.(apiRef.current);
          });
        };

        const font = new FontFaceObserver(FONT_FAMILY);
        font
          .load()
          .then(() => loadTerminal(FONT_FAMILY))
          .catch(() => {
            loadTerminal();
            lynxTopToast(dispatch).warning('Terminal font failed to load. Using fallback.');
          });

        // Resize handler
        let resizeTimeoutId: NodeJS.Timeout;
        const handleResize = () => {
          clearTimeout(resizeTimeoutId);
          resizeTimeoutId = setTimeout(() => {
            if (canResize()) fitAddon.current?.fit();
          }, resizeDelay);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          clearTimeout(resizeTimeoutId);
          onResizeDisposable?.dispose();
          onDataDisposable?.dispose();
          terminal.current?.dispose();
          terminal.current = null;
          apiRef.current = null;
        };
      }, [id]);

      // Handle PTY data
      useEffect(() => {
        const offData = ptyIpc.onData((dataID, data) => {
          if (dataID === id) {
            apiRef.current?.write(data);
          }
        });

        return () => offData();
      }, [id]);

      // Update theme on dark mode change
      useEffect(() => {
        if (terminal.current) terminal.current.options.theme = getTheme(darkMode);
      }, [darkMode]);

      // Update font size
      useEffect(() => {
        if (terminal.current) {
          terminal.current.options.fontSize = fontSize;
          fitAddon.current?.fit();
        }
      }, [fontSize]);

      // Update scrollback
      useEffect(() => {
        if (terminal.current) terminal.current.options.scrollback = scrollBack;
      }, [scrollBack]);

      // Update cursor blink
      useEffect(() => {
        if (terminal.current) terminal.current.options.cursorBlink = blinkCursor;
      }, [blinkCursor]);

      // Update cursor style
      useEffect(() => {
        if (terminal.current) {
          terminal.current.options.cursorStyle = cursorStyle;
          terminal.current.options.cursorInactiveStyle = cursorInactiveStyle;
        }
      }, [cursorStyle, cursorInactiveStyle]);

      return <div ref={terminalContainerRef} className={`size-full ${className}`} />;
    },
  ),
);

export default XTermCore;
