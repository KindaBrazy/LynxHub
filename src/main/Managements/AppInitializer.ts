import {spawn} from 'node:child_process';
import path from 'node:path';

import {electronApp, is, optimizer} from '@electron-toolkit/utils';
import {app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain, shell} from 'electron';
import fs from 'graceful-fs';

import icon from '../../../resources/icon.png?asset';
import {APP_NAME, MAIN_MODULE_URL} from '../../cross/CrossConstants';
import {extractGitUrl} from '../../cross/CrossUtils';
import {initializerChannels} from '../../cross/IpcChannelAndTypes';
import {storageManager} from '../index';
import GitManager from './GitManager';
import ModuleManager from './Plugin/ModuleManager';

/**
 * Handle the initialization process of the application.
 * It manages first time running app -> Check git, python, and app basic module installed.
 */
export default class AppInitializer {
  //#region Private Properties

  private window?: BrowserWindow;
  private static readonly WINDOW_CONFIG: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    width: 350,
    height: 420,
    resizable: false,
    maximizable: false,
    icon,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
    },
  };
  //#endregion

  //#region Private Methods

  private async checkGitAvailable(): Promise<string> {
    return new Promise((resolve, reject) => {
      const commandProcess = spawn('git', ['--version']);
      commandProcess.stdout.on('data', data => {
        const versionParts = data.toString().trim().split(' ');
        resolve(`V${versionParts.slice(2).join('.').trim()}`);
      });

      commandProcess.on('error', err => {
        console.error('Failed to check version: ', err);
        reject();
      });
      commandProcess.stderr.on('data', data => {
        console.error('Failed to check version: ', data);
        reject();
      });
    });
  }

  /** Sets up IPC channel listeners for various initializing actions. */
  private listenToChannels(): void {
    // Handle app restart
    ipcMain.on(initializerChannels.startApp, () => {
      storageManager.updateData('app', {initialized: true});
      app.relaunch();
      app.exit();
    });

    // Handle window controls
    ipcMain.on(initializerChannels.minimize, () => this.window?.minimize());
    ipcMain.on(initializerChannels.close, () => this.window?.close());

    // Handle version checks
    ipcMain.handle(initializerChannels.gitAvailable, () => this.checkGitAvailable());

    // Handle AI module installation
    ipcMain.on(initializerChannels.installAIModule, this.handleInstallAIModule.bind(this));
  }

  /**
   * Handles the installation of the AI module.
   * Clone the repository and manage the installation process.
   */
  private async handleInstallAIModule(): Promise<void> {
    const modulesPath = ModuleManager.getModulesPath();
    const {repo} = extractGitUrl(MAIN_MODULE_URL);
    const installPath = path.join(modulesPath, repo);

    try {
      // Remove existing installation if any
      await fs.promises.rm(installPath, {recursive: true, force: true});

      const gitManager = new GitManager();

      gitManager.onProgress = progress => {
        this.window?.webContents.send(initializerChannels.onInstallAIModule, '', 'Progress', progress);
      };
      gitManager.onError = (reason: string) => {
        this.window?.webContents.send(initializerChannels.onInstallAIModule, '', 'Failed', reason);
      };
      gitManager.onComplete = () => {
        this.window?.webContents.send(initializerChannels.onInstallAIModule, '', 'Completed', '');
      };

      await gitManager.clone(MAIN_MODULE_URL, installPath);
    } catch (error) {
      console.error('Failed to install AI module:', error);
      this.window?.webContents.send(initializerChannels.onInstallAIModule, 'Failed');
    }
  }

  //#endregion

  //#region Public Methods

  public async createInitializer(): Promise<void> {
    electronApp.setAppUserModelId(APP_NAME);

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    await app.whenReady();

    this.window = new BrowserWindow(AppInitializer.WINDOW_CONFIG);

    this.window.on('ready-to-show', () => {
      this.window?.show();
    });

    this.listenToChannels();

    this.window.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return {action: 'deny'};
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await this.window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/initializer.html`);
    } else {
      await this.window.loadFile(path.join(__dirname, `../renderer/initializer.html`));
    }
  }

  //#endregion
}
