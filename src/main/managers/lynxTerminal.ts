import fs from 'node:fs';
import {platform} from 'node:os';
import path from 'node:path';

import {ptyIpc} from '@lynx_main/ipc/pty';
import {determineShell} from '@lynx_main/utils';
import {app} from 'electron';
import pty from 'node-pty';
import treeKill from 'tree-kill';

import classHolder from './classHolder';

/** Manages pseudo-terminal (PTY) processes for different shells. */
export default class LynxTerminal {
  private isRunning: boolean;
  private process: pty.IPty | undefined;

  public onData?: (data: string) => void;
  public id: string;

  constructor(id: string, dir?: string, sendDataToRenderer = false) {
    const storageManager = classHolder.storageManager;
    this.id = id;

    const {useConpty} = storageManager.getData('terminal');

    // Validate directory - fall back to home if invalid or inaccessible
    let validatedDir: string = app.getPath('home');
    if (dir && dir.trim().length > 0) {
      try {
        fs.accessSync(dir, fs.constants.R_OK);
        validatedDir = path.resolve(dir);
      } catch {
        console.warn(`Directory ${dir} is not accessible, falling back to home directory`);
      }
    }

    this.process = pty.spawn(determineShell(), [], {
      cwd: validatedDir,
      cols: 150,
      rows: 150,
      env: process.env,
      useConpty: useConpty === 'auto' ? undefined : useConpty === 'yes',
    });

    this.isRunning = true;

    this.process.onData(data => {
      if (this.onData) {
        this.onData(data);
      } else if (sendDataToRenderer) {
        ptyIpc.send.onData(this.id, data);
        if (this.process) ptyIpc.send.onTitle(this.id, this.process.process);
      }
    });

    this.process.onExit(() => ptyIpc.send.onExit(this.id));
  }

  public async stopAsync(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.isRunning && this.process) {
        // Register exit handler BEFORE killing to avoid race condition
        this.process.onExit(() => {
          this.process = undefined;
          resolve();
        });

        this.process.kill();
        treeKill(this.process.pid);
        this.isRunning = false;

        // Safety timeout in case onExit never fires
        setTimeout(() => {
          this.process = undefined;
          resolve();
        }, 5000);
      } else {
        resolve();
      }
    });
  }

  /**
   * Stops the current PTY process.
   */
  public stop(): void {
    if (this.isRunning && this.process) {
      // Register exit handler BEFORE killing to avoid race condition
      this.process.onExit(() => {
        this.process = undefined;
      });

      this.process.kill();
      treeKill(this.process.pid);
      this.isRunning = false;
    }
  }

  /**
   * Resizes the PTY process window.
   * @param cols - Number of columns.
   * @param rows - Number of rows.
   */
  public resize(cols: number, rows: number): void {
    if (this.isRunning && this.process) {
      this.process.resize(cols, rows);
    }
  }

  public clear(): void {
    if (this.isRunning && this.process) {
      const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';
      const clearEscape = platform() === 'win32' ? '\x1b' : '\x15';

      this.write(clearEscape);
      this.write(`clear${LINE_ENDING}`);
      this.write(clearEscape);

      this.process.clear();
    }
  }

  /**
   * Writes data to the PTY process.
   * @param data - The data to write, either a string or an array of strings.
   */
  public write(data: string | string[]): void {
    if (!this.isRunning) return;

    if (Array.isArray(data)) {
      data.forEach(text => this.process?.write(text));
    } else {
      this.process?.write(data);
    }
  }
}
