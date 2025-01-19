import {platform} from 'node:os';

import {shell} from 'electron';
import lodash from 'lodash';

import {PtyProcessOpt} from '../../../../cross/IpcChannelAndTypes';
import {moduleManager, storageManager} from '../../../index';
import {getAppDataPath} from '../../AppDataManager';
import PtyManager from '../../PtyManager';

let ptyManager: PtyManager | undefined;

const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';

/**
 * Runs multiple commands in the PTY.
 * @param commands - An array of commands to run.
 */
function runMultiCommand(commands: string[]): void {
  if (!lodash.isEmpty(commands) && ptyManager) {
    commands.forEach(command => ptyManager?.write(`${command}${LINE_ENDING}`));
  }
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

export async function customPtyProcess(opt: PtyProcessOpt, dir?: string, file?: string) {
  if (opt === 'start') {
    if (!dir || !file) return;

    ptyManager = new PtyManager();
    ptyManager.start(dir, true);
    ptyManager.write(`${platform() === 'win32' ? './' : 'bash ./'}${file}${LINE_ENDING}`);
  } else if (opt === 'stop') {
    ptyManager?.stop();
    ptyManager = undefined;
  }
}

export async function customPtyCommands(opt: PtyProcessOpt, commands?: string | string[], dir?: string) {
  if (opt === 'start') {
    if (lodash.isEmpty(commands)) return;
    ptyManager = new PtyManager();

    ptyManager.start(dir, true);
    if (lodash.isArray(commands)) {
      runMultiCommand(commands);
    } else {
      ptyManager.write(`${commands}${LINE_ENDING}`);
    }
  } else if (opt === 'stop') {
    ptyManager?.stop();
    ptyManager = undefined;
  }
}

/**
 * Manages the PTY process for a given card.
 * @param opt - The operation to perform ('start' or 'stop').
 * @param cardId - The ID of the card.
 */
export async function ptyProcess(opt: PtyProcessOpt, cardId: string) {
  if (opt === 'start') {
    const card = storageManager.getData('cards').installedCards.find(card => card.id === cardId);
    if (!card) return;

    ptyManager = new PtyManager();
    ptyManager.start(card.dir, true);

    const preCommands = storageManager.getPreCommandById(cardId);
    runMultiCommand(preCommands?.data || []);

    runPreOpen(cardId);

    const customRun = storageManager.getCustomRunById(cardId)?.data;
    const behavior = storageManager
      .getData('cardsConfig')
      .customRunBehavior.find(custom => custom.cardID === cardId)?.terminal;

    if (!lodash.isEmpty(customRun) || behavior === 'empty') {
      runMultiCommand(customRun || []);
    } else {
      const configPath = getAppDataPath();
      const storage = {
        get: (key: string) => storageManager.getCustomData(key),
        set: (key: string, data: any) => storageManager.setCustomData(key, data),
      };
      const runCommand = await moduleManager.getMethodsById(cardId)?.getRunCommands(card.dir, configPath, storage);
      ptyManager.write(runCommand || '');
    }
  } else if (opt === 'stop') {
    ptyManager?.stop();
    ptyManager = undefined;
  }
}

/**
 * Writes data to the PTY.
 * @param data - The data to write.
 */
export function ptyWrite(data: string): void {
  ptyManager?.write(data);
}

/**
 * Resizes the PTY.
 * @param cols - The number of columns.
 * @param rows - The number of rows.
 */
export function ptyResize(cols: number, rows: number): void {
  ptyManager?.resize(cols, rows);
}
