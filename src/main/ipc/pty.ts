import ptyChannels from '@lynx_common/consts/ipc_channels/pty';

import lynxIpc from './lynxIpc';
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

export const ptyIpc = {
  send: {
    onData: (id: string, data: string) => sendToMain(ptyChannels.onData, id, data),
    onTitle: (id: string, title: string) => sendToMain(ptyChannels.onTitle, id, title),
    onExit: (id: string) => sendToMain(ptyChannels.onExit, id),
  },
  on: {
    process: (callback: (id: string, cardId: string) => void) => lynxIpc.on(ptyChannels.process, callback),
    customProcess: (callback: (id: string, dir?: string, file?: string) => void) =>
      lynxIpc.on(ptyChannels.customProcess, callback),
    emptyProcess: (callback: (id: string, dir?: string) => void) => lynxIpc.on(ptyChannels.emptyProcess, callback),
    stopProcess: (callback: (id: string) => void) => lynxIpc.on(ptyChannels.stopProcess, callback),
    customCommands: (callback: (id: string, commands?: string | string[], dir?: string) => void) =>
      lynxIpc.on(ptyChannels.customCommands, callback),
    write: (callback: (id: string, data: string) => void) => lynxIpc.on(ptyChannels.write, callback),
    clear: (callback: (id: string) => void) => lynxIpc.on(ptyChannels.clear, callback),
    resize: (callback: (id: string, cols: number, rows: number) => void) => lynxIpc.on(ptyChannels.resize, callback),
  },
  handle: {},
};
