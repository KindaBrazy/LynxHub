import {platform} from 'node:os';

import {app, shell} from 'electron';
import {isArray, isEmpty, isNil} from 'lodash';

import {PtyProcessOpt} from '../../../../cross/IpcChannelAndTypes';
import {moduleManager, storageManager} from '../../../index';
import {getAbsolutePath, getExePath, isPortable} from '../../../Utilities/Utils';
import PtyManager from '../../PtyManager';

let ptyManager: PtyManager[] = [];

const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';

/**
 * Runs multiple commands in the PTY.
 * @param id - The unique id of process running
 * @param commands - An array of commands to run.
 */
function runMultiCommand(id: string, commands: string[]): void {
  if (!isEmpty(commands) && ptyManager) {
    commands.forEach(command => ptyWrite(id, `${command}${LINE_ENDING}`));
  }
}

function getExtPreCommands(id: string) {
  return storageManager.getData('cards').cardTerminalPreCommands.find(command => command.id === id)?.commands || [];
}

/**
 * Open pre-open array in desktop's default manner for a given card.
 * @param cardId - The ID of the card.
 */
function runPreOpen(cardId: string): void {
  const preOpens = storageManager.getPreOpenById(cardId);
  if (preOpens) {
    preOpens.data.forEach(toOpen => shell.openPath(toOpen.path));
  }
}

function getPtyByID(id: string) {
  return ptyManager.find(pty => pty.id === id);
}

function stopPty(id: string) {
  getPtyByID(id)?.stop();
  ptyManager = ptyManager.filter(pty => pty.id !== id);
}

export async function stopAllPty(): Promise<void> {
  for (const ptyProcess of ptyManager) {
    await ptyProcess.stopAsync();
  }
  ptyManager = [];
}

export async function emptyPtyProcess(id: string, opt: PtyProcessOpt, dir?: string) {
  if (opt === 'start') {
    const targetDir = dir || app.getPath('home');
    ptyManager.push(new PtyManager(id, targetDir, true));
  } else if (opt === 'stop') {
    stopPty(id);
  }
}

export async function customPtyProcess(id: string, opt: PtyProcessOpt, dir?: string, file?: string) {
  if (opt === 'start') {
    if (!dir || !file) return;

    ptyManager.push(new PtyManager(id, dir, true));

    const extensionPreCommands = getExtPreCommands(id);
    executeCommands(id, extensionPreCommands);

    executeCommands(id, `${platform() === 'win32' ? './' : 'bash ./'}${file}`);
  } else if (opt === 'stop') {
    stopPty(id);
  }
}

export async function customPtyCommands(id: string, opt: PtyProcessOpt, commands?: string | string[], dir?: string) {
  if (opt === 'start') {
    if (isEmpty(commands)) return;
    ptyManager.push(new PtyManager(id, dir, true));

    const extensionPreCommands = getExtPreCommands(id);

    if (!isNil(commands) && !isEmpty(commands)) {
      if (isArray(commands)) {
        extensionPreCommands.push(...commands);
      } else {
        extensionPreCommands.push(commands);
      }
    }

    executeCommands(id, extensionPreCommands);
  } else if (opt === 'stop') {
    stopPty(id);
  }
}

/**
 * Manages the PTY process for a given card.
 * @param id - The unique id of process running
 * @param opt - The operation to perform ('start' or 'stop').
 * @param cardId - The ID of the card.
 */
export async function ptyProcess(id: string, opt: PtyProcessOpt, cardId: string) {
  if (opt === 'start') {
    const card = storageManager.getData('cards').installedCards.find(card => card.id === cardId);
    if (!card) return;
    const dir = isPortable() ? getAbsolutePath(getExePath(), card.dir || '') : card.dir;

    ptyManager.push(new PtyManager(id, dir, true));

    const preCommands = storageManager.getPreCommandById(cardId);

    const extensionPreCommands = getExtPreCommands(id);
    executeCommands(id, extensionPreCommands);

    executeCommands(id, preCommands?.data);

    runPreOpen(cardId);

    const customRun = storageManager.getCustomRunById(cardId)?.data;
    const behavior = storageManager
      .getData('cardsConfig')
      .customRunBehavior.find(custom => custom.cardID === cardId)?.terminal;

    if (!isEmpty(customRun) || behavior === 'empty') {
      executeCommands(id, customRun);
    } else {
      const runCommand = await moduleManager?.getMethodsById(cardId)?.().getRunCommands();
      executeCommands(id, runCommand);
    }
  } else if (opt === 'stop') {
    stopPty(id);
  }
}

function executeCommands(id: string, commands: string | string[] | undefined) {
  if (!isNil(commands) && !isEmpty(commands)) {
    if (isArray(commands)) {
      runMultiCommand(id, commands);
    } else {
      ptyWrite(id, commands + LINE_ENDING);
    }
  }
}

/**
 * Writes data to the PTY.
 * @param id - The unique id of process running
 * @param data - The data to write.
 */
export function ptyWrite(id: string, data: string): void {
  getPtyByID(id)?.write(data);
}

/**
 * Resizes the PTY.
 * @param id - The unique id of process running
 * @param cols - The number of columns.
 * @param rows - The number of rows.
 */
export function ptyResize(id: string, cols: number, rows: number): void {
  getPtyByID(id)?.resize(cols, rows);
}
