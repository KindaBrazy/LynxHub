import ptyChannels from '@lynx_cross/consts/ipc_channels/pty';

import lynxIpc from './lynxIpc';

const ptyIpc = {
  // Starts PTY process for card with pre-commands and run commands
  process: (id: string, cardId: string): void => lynxIpc.send(ptyChannels.process, id, cardId),

  // Starts custom PTY process with specific file to execute
  customProcess: (id: string, dir?: string, file?: string): void =>
    lynxIpc.send(ptyChannels.customProcess, id, dir, file),

  // Starts empty PTY process (no commands executed)
  emptyProcess: (id: string, dir?: string): void => lynxIpc.send(ptyChannels.emptyProcess, id, dir),

  // Executes custom commands in PTY
  customCommands: (id: string, commands?: string | string[], dir?: string) =>
    lynxIpc.send(ptyChannels.customCommands, id, commands, dir),

  // Stops PTY process by ID
  stop: (id: string) => lynxIpc.send(ptyChannels.stopProcess, id),

  // Writes data to PTY input
  write: (id: string, data: string): void => lynxIpc.send(ptyChannels.write, id, data),

  // Clears PTY terminal screen
  clear: (id: string): void => lynxIpc.send(ptyChannels.clear, id),

  // Resizes PTY terminal dimensions
  resize: (id: string, cols: number, rows: number): void => lynxIpc.send(ptyChannels.resize, id, cols, rows),

  // Listens for PTY output data
  onData: (result: (id: string, data: string) => void) => lynxIpc.on(ptyChannels.onData, result),

  // Listens for PTY title changes
  onTitle: (result: (id: string, title: string) => void) => lynxIpc.on(ptyChannels.onTitle, result),

  // Listens for PTY process exit
  onExit: (result: (id: string) => void) => lynxIpc.on(ptyChannels.onExit, result),
};

export default ptyIpc;
