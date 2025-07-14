import fs from 'node:fs';
import {platform} from 'node:os';
import path from 'node:path';

import pty from 'node-pty';
import treeKill from 'tree-kill';

import {ptyChannels} from '../../cross/IpcChannelAndTypes';
import {appManager, storageManager} from '../index';
import {determineShell} from '../Utilities/Utils';

/** Manages pseudo-terminal (PTY) processes for different shells. */
export default class PtyManager {
  private isRunning: boolean;
  private process: pty.IPty | undefined;

  public onData?: (data: string) => void;
  public id: string;

  constructor(id: string, dir?: string, sendDataToRenderer = false) {
    this.id = id;

    const {useConpty} = storageManager.getData('terminal');

    let validatedDir: string | undefined = dir;
    if (dir && dir.length > 0) {
      try {
        fs.accessSync(dir, fs.constants.R_OK);
        validatedDir = path.resolve(dir);
      } catch (error) {
        validatedDir = undefined;
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
        appManager?.getWebContent()?.send(ptyChannels.onData, this.id, data);
        appManager?.getWebContent()?.send(ptyChannels.onTitle, this.id, this.process?.process);
      }
    });

    this.process.onExit(() => {
      appManager?.getWebContent()?.send(ptyChannels.onExit, this.id);
    });
  }

  public async stopAsync(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.isRunning && this.process) {
        this.process.kill();
        treeKill(this.process.pid);
        this.isRunning = false;
        this.process.onExit(() => {
          this.process = undefined;
          resolve();
        });
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
      this.process.kill();
      treeKill(this.process.pid);
      this.isRunning = false;
      this.process.onExit(() => {
        this.process = undefined;
      });
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
      const LINE_ENDING = platform() ? '\r' : '\n';
      this.write(`clear${LINE_ENDING}`);
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
