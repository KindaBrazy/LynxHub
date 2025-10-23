import {ITheme, IWindowsPty} from '@xterm/xterm';

import {SystemInfo, TerminalUseConpty} from '../../../../../../cross/IpcChannelAndTypes';
import {getColor} from '../../../Utils/Constants';
import {isWebgl2Supported} from '../../../Utils/UtilFunctions';

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
  return {
    background: darkMode ? getColor('nearBlack') : getColor('white'),
    foreground: darkMode ? getColor('white') : getColor('black'),
    cursor: darkMode ? getColor('white') : getColor('black'),
    cursorAccent: darkMode ? getColor('white') : getColor('black'),
    selectionForeground: darkMode ? getColor('black') : getColor('white'),
    selectionBackground: darkMode ? getColor('white', 0.7) : getColor('black', 0.7),
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
