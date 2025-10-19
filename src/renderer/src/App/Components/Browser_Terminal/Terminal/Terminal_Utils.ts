import {ITheme, IWindowsPty} from '@xterm/xterm';

import {SystemInfo, TerminalUseConpty} from '../../../../../../cross/IpcChannelAndTypes';
import {getColor} from '../../../Utils/Constants';
import {isWebgl2Supported} from '../../../Utils/UtilFunctions';

export function getWindowPty(sysInfo: SystemInfo, useConpty: TerminalUseConpty): IWindowsPty | undefined {
  return sysInfo.os === 'win32'
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
}

export function getRendererMode() {
  return isWebgl2Supported() ? 'webgl' : 'canvas';
}

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

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function catchTerminalAddress(input: string, keyword: string): string | undefined {
  const escapedKeyword = escapeRegExp(keyword);

  const pattern = new RegExp(`${escapedKeyword}.*?:\\s*.*?(https?:\\/\\/.*?)(?=\\s|\\u001b|$)`, 'i');

  const match: RegExpMatchArray | null = input.match(pattern);
  if (match) {
    return match[1];
  }

  return undefined;
}
