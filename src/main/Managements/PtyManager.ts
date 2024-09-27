import {platform} from 'node:os';
import path from 'node:path';

import pty from 'node-pty';
import treeKill from 'tree-kill';

import {ptyChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';
import {getPowerShellVersion} from '../Utilities/Utils';

/** Manages pseudo-terminal (PTY) processes for different shells. */
export default class PtyManager {
  //#region Private Properties

  private isRunning: boolean;
  private readonly shell: string;
  private process?: pty.IPty;
  //#endregion

  //#region Callback

  public onData?: (data: string) => void;
  //#endregion

  //#region Constructor

  constructor() {
    this.isRunning = false;
    this.shell = this.determineShell();
  }

  //#endregion

  //#region Private Methods

  /**
   * Checks if the PTY process is available.
   * @returns True if the process is running and has a valid PID, false otherwise.
   */
  private isAvailable(): boolean {
    return this.isRunning && !!this.process?.pid;
  }

  /**
   * Determines the appropriate shell based on the operating system and PowerShell version.
   * @returns The shell command to use.
   */
  private determineShell(): string {
    switch (platform()) {
      case 'darwin':
        return 'zsh';
      case 'linux':
        return 'bash';
      case 'win32':
      default:
        return getPowerShellVersion() >= 5 ? 'pwsh.exe' : 'powershell.exe';
    }
  }

  //#endregion

  //#region Public Methods

  /**
   * Starts a new PTY process.
   * @param dir - The working directory for the PTY process.
   * @param sendDataToRenderer - Whether to send data to the renderer process.
   */
  public start(dir?: string, sendDataToRenderer = false): void {
    this.process = pty.spawn(this.shell, [], {
      cwd: dir ? path.resolve(dir) : undefined,
      cols: 150,
      rows: 150,
      env: process.env,
    });

    this.isRunning = true;

    this.process.onData(data => {
      if (this.onData) {
        this.onData(data);
      } else if (sendDataToRenderer) {
        appManager.getWebContent()?.send(ptyChannels.onData, data);
      }
    });
  }

  /**
   * Stops the current PTY process.
   */
  public stop(): void {
    if (this.isAvailable() && this.process?.pid) {
      treeKill(this.process.pid);
      if (platform() === 'darwin') this.process.kill();
      this.isRunning = false;
      this.process = undefined;
    }
  }

  /**
   * Resizes the PTY process window.
   * @param cols - Number of columns.
   * @param rows - Number of rows.
   */
  public resize(cols: number, rows: number): void {
    if (this.isAvailable()) {
      this.process?.resize(cols, rows);
    }
  }

  /**
   * Writes data to the PTY process.
   * @param data - The data to write, either a string or an array of strings.
   */
  public write(data: string | string[]): void {
    if (!this.isAvailable()) return;

    if (Array.isArray(data)) {
      data.forEach(text => this.process?.write(text));
    } else {
      this.process?.write(data);
    }
  }

  //#endregion
}
