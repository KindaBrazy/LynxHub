import {execSync} from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import fs from 'graceful-fs';
import {compact, includes, isString} from 'lodash';
import portFinder from 'portfinder';
import handler from 'serve-handler';

import {APP_BUILD_NUMBER} from '../../../cross/CrossConstants';
import {ExtensionsInfo, FolderNames, ModulesInfo} from '../../../cross/CrossTypes';
import {extractGitUrl} from '../../../cross/CrossUtils';
import {SkippedPlugins} from '../../../cross/IpcChannelAndTypes';
import {MainModules} from '../../../cross/plugin/ModuleTypes';
import {appManager} from '../../index';
import {RelaunchApp} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';
import ShowToastWindow from '../ToastWindowManager';

export abstract class BasePluginManager<TInfo extends ModulesInfo | ExtensionsInfo> {
  protected readonly host: string = 'localhost';
  protected port: number;
  protected server: ReturnType<typeof http.createServer> | undefined = undefined;
  protected finalAddress: string = '';

  protected pluginData: string[] = [];
  protected skippedPlugins: SkippedPlugins[] = [];
  protected mainMethods: MainModules[] = [];
  protected installedPluginInfo: {dir: string; info: TInfo}[] = [];

  protected readonly pluginPath: string;
  protected readonly configFileName: string;
  protected readonly mainScriptPath: string;
  protected readonly rendererScriptPath: string;
  protected readonly reloadChannel: string;
  protected readonly updateChannel: string;

  protected constructor(
    defaultPort: number,
    configFileName: string,
    mainScriptPath: string,
    rendererScriptPath: string,
    reloadChannel: string,
    updateChannel: string,
    pluginDirName: FolderNames,
  ) {
    this.port = defaultPort;
    this.configFileName = configFileName;
    this.mainScriptPath = mainScriptPath;
    this.rendererScriptPath = rendererScriptPath;
    this.reloadChannel = reloadChannel;
    this.updateChannel = updateChannel;
    this.pluginPath = getAppDirectory(pluginDirName);
  }

  protected async setInstalledPlugins(folders: string[]) {
    for (const folder of folders) {
      const filePath = path.join(this.pluginPath, folder, this.configFileName);
      const content = fs.readFileSync(filePath, 'utf-8');
      try {
        const jsonData = JSON.parse(content);
        this.installedPluginInfo.push({dir: folder, info: jsonData});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  protected async readPlugin() {
    return new Promise<void>(async resolve => {
      try {
        const files = fs.readdirSync(this.pluginPath, {withFileTypes: true});
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        const validFolders = await this.validatePluginFolders(folders);

        this.pluginData = validFolders.map(folder => `${this.finalAddress}/${folder}`);
        const pluginFolders = validFolders.map(folder => path.join(this.pluginPath, folder));

        await this.setInstalledPlugins(folders);
        await this.importPlugins(pluginFolders);

        resolve();
      } catch (error: any) {
        console.error(`Loading Plugin Error: `, error);
        resolve();
      }
    });
  }

  protected abstract importPlugins(pluginFolders: string[]): Promise<void>;

  public async installPlugin(url: string) {
    return new Promise<boolean>(resolve => {
      const gitManager = new GitManager(true);
      gitManager.cloneShallow(url, path.join(this.pluginPath, extractGitUrl(url).repo), false);

      gitManager.onComplete = async () => {
        await this.reloadServer();
        resolve(true);
      };
      gitManager.onError = () => {
        resolve(false);
      };
    });
  }

  public async uninstallPlugin(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    try {
      await removeDir(plugin);
      await this.reloadServer();
      return true;
    } catch (e) {
      return false;
    }
  }

  public async isUpdateAvailable(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    return await GitManager.isUpdateAvailable(plugin);
  }

  public async checkEA(isEA: boolean, isInsider: boolean) {
    const installFolders = this.installedPluginInfo.map(folder => path.join(this.pluginPath, folder.dir));
    const targetBranch = isInsider ? 'compiled_insider' : isEA ? 'compiled_ea' : 'compiled';
    let isChangedBranch: boolean = false;

    for (const folder of installFolders) {
      try {
        const git = new GitManager();

        const url = await GitManager.remoteUrlFromDir(folder);
        const currentBranch = await GitManager.getDirBranch(folder);

        if (!url || currentBranch === targetBranch) continue;

        const branches = await git.getAvailableBranches(url);

        if (branches.includes(targetBranch)) {
          await git.changeBranch(folder, targetBranch);
          isChangedBranch = true;
        }
      } catch (e) {
        console.error('error changing ea branch: ', e);
      }
    }

    return isChangedBranch;
  }

  public showGitOwnershipToast() {
    ShowToastWindow(
      {
        buttons: ['exit'],
        customButtons: [
          {id: 'add_safe', color: 'warning', label: 'Add to Safe Directories'},
          {id: 'change_data_dir', color: 'success', label: 'Change Data Directory'},
        ],
        title: 'Git Ownership Warning',
        message:
          'Git has detected dubious ownership of the data directory. This can happen when the repository is owned by ' +
          "a different user. You can either add data directory to Git's safe directories or choose a different " +
          'location.',
        type: 'warning',
      },
      (id, window) => {
        if (id === 'add_safe') {
          const DataDirectory = getAppDataPath();
          execSync(`git config --global --add safe.directory '${DataDirectory}/*'`);
        } else if (id === 'change_data_dir') {
          selectNewAppDataFolder(window)
            .then(() => RelaunchApp(false))
            .catch(() => console.error('Error changing data directory'));
        }
      },
    );
  }

  public async updateAvailableList(): Promise<string[]> {
    try {
      const updateChecks = this.installedPluginInfo.map(async plugin => {
        const available = await GitManager.isUpdateAvailable(path.join(this.pluginPath, plugin.dir));
        return {title: plugin.info.title, available};
      });
      const results = await Promise.all(updateChecks);
      return compact(results.map(result => (result.available ? result.title : null)));
    } catch (error) {
      console.error('Error checking for updates:', error);

      const errorMessage = isString(error) ? error : error.message;
      if (includes(errorMessage, 'detected dubious ownership')) this.showGitOwnershipToast();

      return [];
    }
  }

  public async updatePlugin(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    return new Promise<boolean>(resolve => {
      const gitManager = new GitManager(true);
      gitManager.pull(plugin);

      gitManager.onComplete = async () => {
        appManager?.getWebContent()?.send(this.updateChannel, id);
        await this.reloadServer();
        resolve(true);
      };
      gitManager.onError = () => {
        resolve(false);
      };
    });
  }

  public async updateAllPlugins() {
    const updatedPlugins: string[] = [];
    await Promise.all(
      this.installedPluginInfo.map(async plugin => {
        const gitManager = new GitManager(false);
        const updateResult = await gitManager.pullAsync(path.join(this.pluginPath, plugin.dir));
        if (updateResult) updatedPlugins.push(plugin.info.id);
      }),
    );

    if (updatedPlugins.length > 0) {
      appManager?.getWebContent()?.send(this.updateChannel, updatedPlugins);
      await this.reloadServer();
    }
  }

  public async createServer() {
    return new Promise<{port: number; hostName: string}>((resolve, reject) => {
      const startServer = async () => {
        try {
          const port = await portFinder.getPortPromise({port: this.port});
          this.port = port;

          this.server = http.createServer((req, res) => {
            try {
              const origin = is.dev ? '*' : 'file://';
              res.setHeader('Access-Control-Allow-Origin', origin);
              return handler(req, res, {
                public: this.pluginPath,
              });
            } catch (handlerError) {
              console.error('Error in request handler:', handlerError);
              res.statusCode = 500;
              res.end('Internal Server Error');
              return;
            }
          });

          this.server.on('error', (serverError: NodeJS.ErrnoException) => {
            if (serverError.code === 'EADDRINUSE') {
              console.warn(`Port ${this.port} is still in use. Retrying with a new port...`);
              this.closeServer();
              startServer(); // Retry with a new port
            } else {
              console.error('Server error:', serverError);
              reject(serverError);
            }
          });

          this.server.listen(this.port, this.host, async () => {
            try {
              this.finalAddress = `http://${this.host}:${this.port}`;
              await this.readPlugin();
              resolve({hostName: this.host, port: this.port});
            } catch (configError) {
              console.error('Error writing config:', configError);
              this.closeServer();
              reject(configError);
            }
          });
        } catch (error) {
          console.error('Error finding or setting up server:', error);
          reject(error);
        }
      };
      startServer();
    });
  }

  public closeServer(): void {
    if (this.server && this.server.listening) {
      this.server.close();
    }
  }

  public async reloadServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server && this.server.listening) {
        this.server?.close(async err => {
          if (err) {
            console.error('reloadServer: ', err);
            reject(err);
            return;
          }

          try {
            this.pluginData = [];
            this.mainMethods = [];
            this.installedPluginInfo = [];

            await this.createServer();
            appManager?.getWebContent()?.send(this.reloadChannel);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject('Server is not running');
      }
    });
  }

  public getMethodsById(id: string): MainModules['methods'] | undefined {
    return this.mainMethods.find(plugin => plugin.id === id)?.methods;
  }

  public getPluginData(): string[] {
    return this.pluginData;
  }

  public getSkipped(): SkippedPlugins[] {
    return this.skippedPlugins;
  }

  public getInstalledPluginInfo(): {dir: string; info: TInfo}[] {
    return this.installedPluginInfo;
  }

  public getDirById(id: string) {
    const plugin = this.installedPluginInfo.find(installed => installed.info.id === id);
    if (plugin) {
      return path.join(this.pluginPath, plugin.dir);
    }
    return undefined;
  }

  protected async validatePluginFolders(folderPaths: string[]): Promise<string[]> {
    const validatedFolders: string[] = [];

    for (const folder of folderPaths) {
      if (folder.startsWith('.')) {
        console.log(`Skipping folder "${folder}" because it starts with '.'`);
      } else {
        const dir = path.join(this.pluginPath, folder);
        const configPath = path.join(dir, this.configFileName);
        const scriptsFolder = path.join(dir, 'scripts');

        try {
          await fs.promises.access(configPath, fs.constants.F_OK);
          await fs.promises.access(scriptsFolder, fs.constants.F_OK);

          await Promise.all([
            fs.promises.access(path.join(dir, this.mainScriptPath), fs.constants.F_OK),
            fs.promises.access(path.join(dir, this.rendererScriptPath), fs.constants.F_OK),
          ]);

          // Read and parse the JSON file
          const configData = await fs.promises.readFile(configPath, 'utf-8');
          const config = JSON.parse(configData);

          if (APP_BUILD_NUMBER >= config.requireAppBuild) {
            validatedFolders.push(folder);
          } else {
            this.skippedPlugins.push({
              folderName: folder,
              message: 'Unloaded because requireAppBuild not satisfied.',
            });
            console.log(`Skipping folder "${folder}" because requireAppBuild not satisfied.`);
          }
        } catch (err) {
          this.skippedPlugins.push({
            folderName: folder,
            message: 'Unloaded due to incompatible structure.',
          });
          console.log(`Skipping folder "${folder}" due to missing requirements.`);
        }
      }
    }

    return validatedFolders;
  }
}
