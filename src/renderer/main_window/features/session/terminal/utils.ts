import {SystemInfo, TerminalUseConpty} from '@lynx_common/types/ipc';
import {ITheme, IWindowsPty} from '@xterm/xterm';

import {isWebgl2Supported} from '../../../utils';
import {getColor} from '../../../utils/constants';

/**
 * Determines the Windows PTY backend based on system info and user settings.
 * @param sysInfo - System information.
 * @param useConpty - User preference for using ConPTY.
 * @returns The IWindowsPty configuration or undefined if not on Windows.
 */
export function getWindowPty(sysInfo: SystemInfo, useConpty: TerminalUseConpty): IWindowsPty | undefined {
  if (sysInfo.os !== 'win32') {
    return undefined;
  }

  const conptyAvailable = (sysInfo.buildNumber as number) >= 18309;
  const useConptyResolved = useConpty === 'yes' || (useConpty === 'auto' && conptyAvailable);

  return {
    backend: useConptyResolved ? 'conpty' : 'winpty',
    buildNumber: sysInfo.buildNumber as number,
  };
}

/**
 * Determines the best available renderer for xterm.js.
 * @returns 'webgl' if supported, otherwise 'canvas'.
 */
export function getRendererMode(): 'webgl' | 'canvas' {
  return isWebgl2Supported() ? 'webgl' : 'canvas';
}

/**
 * Generates the theme object for xterm.js based on the application's dark mode state.
 * @param darkMode - Whether dark mode is enabled.
 * @returns The ITheme object for xterm.js.
 */
export function getTheme(darkMode: boolean): ITheme {
  if (darkMode) {
    return {
      background: getColor('nearBlack'),
      foreground: getColor('white'),
      cursor: getColor('white'),
      cursorAccent: getColor('white'),
      selectionForeground: getColor('black'),
      selectionBackground: getColor('white', 0.7),
    };
  }

  // Light mode with adjusted ANSI colors for better visibility
  return {
    background: getColor('white'),
    foreground: getColor('black'),
    cursor: getColor('black'),
    cursorAccent: getColor('black'),
    selectionForeground: getColor('white'),
    selectionBackground: getColor('black', 0.7),
    // ANSI colors adjusted for light backgrounds
    black: '#1a1a1a',
    red: '#c41a16',
    green: '#007400',
    yellow: '#a06000',
    blue: '#0451a5',
    magenta: '#bc05bc',
    cyan: '#0598bc',
    white: '#767676',
    brightBlack: '#5c5c5c',
    brightRed: '#c41a16',
    brightGreen: '#007400',
    brightYellow: '#a06000',
    brightBlue: '#0451a5',
    brightMagenta: '#bc05bc',
    brightCyan: '#0598bc',
    brightWhite: '#1a1a1a',
  };
}

/**
 * Escapes special characters in a string for use in a regular expression.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts a URL from terminal output that follows a specific keyword.
 * @param input - The raw string data from the terminal.
 * @param keyword - The keyword to search for (e.g., "Local URL:").
 * @returns The captured URL string or undefined if not found.
 */
export function catchTerminalAddress(input: string, keyword: string): string | undefined {
  const escapedKeyword = escapeRegExp(keyword);
  const pattern = new RegExp(`${escapedKeyword}.*?:\\s*.*?(https?:\\/\\/.*?)(?=\\s|\\u001b|$)`, 'i');

  const match: RegExpMatchArray | null = input.match(pattern);
  if (match) {
    return match[1];
  }

  return undefined;
}
