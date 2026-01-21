// PTY (Pseudo Terminal) IPC methods - Manages terminal processes for cards and custom commands
import {platform} from 'node:os';

import {app, shell} from 'electron';
import {isArray, isEmpty, isNil} from 'lodash';

import classHolder from '../../core/class_holder';
import LynxTerminal from '../../core/lynx_terminal';
import {getAbsolutePath, getExePath, isPortable} from '../../utils';
import {applicationIpc} from '../application';

/**
 * Creates a PTY manager with error handling.
 * Shows user-friendly error message if terminal creation fails.
 */
function createPtyManager(id: string, dir: string, useConpty: boolean): LynxTerminal | null {
  try {
    return new LynxTerminal(id, dir, useConpty);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to create terminal process [${id}]:`, error);

    let userMessage = 'Failed to start terminal.';
    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      userMessage = 'Terminal shell not found. Please check your system shell configuration.';
    } else if (errorMessage.includes('EACCES') || errorMessage.includes('permission')) {
      userMessage = 'Permission denied when starting terminal. Try running as administrator.';
    } else if (errorMessage.includes('spawn')) {
      userMessage = 'Failed to spawn terminal process. Your shell may be misconfigured.';
    }

    applicationIpc.send.showToast(userMessage, 'error');
    return null;
  }
}

let ptyManager: LynxTerminal[] = [];

const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';

/**
 * Validates and returns a valid directory path, falling back to home if invalid.
 */
function getValidDir(dir?: string): string {
  return dir && dir.trim().length > 0 ? dir : app.getPath('home');
}

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
  const {storageManager} = classHolder;
  return storageManager.getData('cards').cardTerminalPreCommands.find(command => command.id === id)?.commands || [];
}

/**
 * Open pre-open array in desktop's default manner for a given card.
 * @param cardId - The ID of the card.
 */
function runPreOpen(cardId: string): void {
  const {storageManager} = classHolder;
  const preOpens = storageManager.getPreOpenById(cardId);
  if (preOpens) {
    preOpens.data.forEach(toOpen => shell.openPath(toOpen.path));
  }
}

function getPtyByID(id: string) {
  return ptyManager.find(pty => pty.id === id);
}

export function stopPty(id: string) {
  getPtyByID(id)?.stop();
  ptyManager = ptyManager.filter(pty => pty.id !== id);
}

export async function stopAllPty(): Promise<void> {
  for (const ptyProcess of ptyManager) {
    await ptyProcess.stopAsync();
  }
  ptyManager = [];
}

export async function emptyPtyProcess(id: string, dir?: string) {
  const pty = createPtyManager(id, getValidDir(dir), true);
  if (pty) ptyManager.push(pty);
}

export async function customPtyProcess(id: string, dir?: string, file?: string) {
  if (!file) return;

  const pty = createPtyManager(id, getValidDir(dir), true);
  if (!pty) return;

  ptyManager.push(pty);

  const extensionPreCommands = getExtPreCommands(id);
  executeCommands(id, extensionPreCommands);

  executeCommands(id, `${platform() === 'win32' ? './' : 'bash ./'}${file}`);
}

export async function customPtyCommands(id: string, commands?: string | string[], dir?: string) {
  if (isEmpty(commands)) return;

  const pty = createPtyManager(id, getValidDir(dir), true);
  if (!pty) return;

  ptyManager.push(pty);

  const extensionPreCommands = getExtPreCommands(id);
  let finalCommands = [...extensionPreCommands];

  if (!isNil(commands) && !isEmpty(commands)) {
    if (isArray(commands)) {
      finalCommands = [...finalCommands, ...commands];
    } else {
      finalCommands = [...finalCommands, commands];
    }
  }

  executeCommands(id, finalCommands);
}

/**
 * Manages the PTY process for a given card.
 * @param id - The unique id of process running
 * @param cardId - The ID of the card.
 */
export async function ptyProcess(id: string, cardId: string) {
  const {storageManager, moduleManager} = classHolder;
  const card = storageManager.getData('cards').installedCards.find(card => card.id === cardId);
  if (!card) return;

  const cardDir = isPortable() ? getAbsolutePath(getExePath(), card.dir || '') : card.dir;
  const pty = createPtyManager(id, getValidDir(cardDir), true);
  if (!pty) return;

  ptyManager.push(pty);

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

export function ptyClear(id: string): void {
  getPtyByID(id)?.clear();
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
