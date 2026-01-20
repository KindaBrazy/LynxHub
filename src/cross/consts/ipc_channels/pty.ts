const ptyChannels = {
  process: 'pty-process',
  customProcess: 'pty-custom-process',
  emptyProcess: 'pty-custom-process',
  stopProcess: 'pty-stop-process',
  customCommands: 'pty-custom-commands',
  write: 'pty-write',
  clear: 'pty-clear',
  resize: 'pty-resize',
  onData: 'pty-on-data',
  onTitle: 'pty-on-title',

  onExit: 'pty-on-exit-code',

  // Terminal progress (ConEmu OSC 9;4 sequence)
  onProgress: 'pty-on-progress',
};

export default ptyChannels;
