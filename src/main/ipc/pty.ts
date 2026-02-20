
import ptyChannels from '@lynx_common/consts/ipcChannels/pty';

import lynxIpc from './ipcWrapper';
import {
  customPtyCommands,
  customPtyProcess,
  emptyPtyProcess,
  ptyClear,
  ptyProcess,
  ptyResize,
  ptyWrite,
  stopPty,
} from './methods/pty';
import {sendToMain} from './sender';

/**
 * Initializes listeners for PTY events.
 */
export default function listenPty() {
  // Starts PTY process for card with pre-commands and run commands
  ptyIpc.on.process((id, cardId) => ptyProcess(id, cardId));

  // Starts custom PTY process with specific file to execute
  ptyIpc.on.customProcess((id, dir, file) => customPtyProcess(id, dir, file));

  // Starts empty PTY process (no commands executed)
  ptyIpc.on.emptyProcess((id, dir) => emptyPtyProcess(id, dir));

  // Stops PTY process by ID
  ptyIpc.on.stopProcess(id => stopPty(id));

  // Executes custom commands in PTY
  ptyIpc.on.customCommands((id, commands, dir) => customPtyCommands(id, commands, dir));

  // Writes data to PTY input
  ptyIpc.on.write((id, data) => ptyWrite(id, data));

  // Clears PTY terminal screen
  ptyIpc.on.clear(id => ptyClear(id));

  // Resizes PTY terminal dimensions
  ptyIpc.on.resize((id, cols, rows) => ptyResize(id, cols, rows));
}

/**
 * IPC interface for PTY events.
 */
export const ptyIpc = {
  send: {
    /** Sends PTY data output */
    onData: (id: string, data: string) => sendToMain(ptyChannels.onData, id, data),
    /** Sends PTY title update */
    onTitle: (id: string, title: string) => sendToMain(ptyChannels.onTitle, id, title),
    /** Sends PTY exit event */
    onExit: (id: string) => sendToMain(ptyChannels.onExit, id),
  },
  on: {
    /** Listens for process start request */
    process: (callback: (id: string, cardId: string) => void) => lynxIpc.on(ptyChannels.process, callback),
    /** Listens for custom process start request */
    customProcess: (callback: (id: string, dir?: string, file?: string) => void) =>
      lynxIpc.on(ptyChannels.customProcess, callback),
    /** Listens for empty process start request */
    emptyProcess: (callback: (id: string, dir?: string) => void) => lynxIpc.on(ptyChannels.emptyProcess, callback),
    /** Listens for stop process request */
    stopProcess: (callback: (id: string) => void) => lynxIpc.on(ptyChannels.stopProcess, callback),
    /** Listens for custom commands execution request */
    customCommands: (callback: (id: string, commands?: string | string[], dir?: string) => void) =>
      lynxIpc.on(ptyChannels.customCommands, callback),
    /** Listens for write data request */
    write: (callback: (id: string, data: string) => void) => lynxIpc.on(ptyChannels.write, callback),
    /** Listens for clear request */
    clear: (callback: (id: string) => void) => lynxIpc.on(ptyChannels.clear, callback),
    /** Listens for resize request */
    resize: (callback: (id: string, cols: number, rows: number) => void) => lynxIpc.on(ptyChannels.resize, callback),
  },
  handle: {},
};
