import http from 'node:http';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import fs from 'graceful-fs';
import portFinder from 'portfinder';
import handler from 'serve-handler';

import {ExtensionsInfo, FolderNames, MainExtensions, MainModules, ModulesInfo} from '../../../cross/CrossTypes';
import {extractGitUrl} from '../../../cross/CrossUtils';
import {appManager} from '../../index';
import {getAppDirectory} from '../AppDataManager';
import GitManager from '../GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';

export abstract class BasePluginManager<
  TInfo extends ModulesInfo | ExtensionsInfo,
  TMethods extends MainModules | MainExtensions,
> {
  protected readonly host: string = 'localhost';
  protected port: number;
  protected server: ReturnType<typeof http.createServer> | undefined = undefined;
  protected finalAddress: string = '';

  protected pluginData: string[] = [];
  protected mainMethods: TMethods[] = [];
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

  protected async setPluginInfo(paths: string[]) {
    for (const pluginPath of paths) {
      const filePath = path.join(pluginPath, this.configFileName);
      const content = fs.readFileSync(filePath, 'utf-8');
      try {
        const jsonData = JSON.parse(content);
        const repoUrl = await GitManager.remoteUrlFromDir(pluginPath);
        const pluginInfo = {
          ...jsonData,
          repoUrl,
        } as TInfo;
        this.installedPluginInfo.push({dir: pluginPath, info: pluginInfo});
      } catch (error) {
        console.error(`Error parsing ${pluginPath}: ${error}`);
      }
    }
  }

  protected async readPlugin() {
    return new Promise<void>(async resolve => {
      try {
        const files = fs.readdirSync(this.pluginPath, {withFileTypes: true});
        const folders = await this.validatePluginFolders(
          files.filter(file => file.isDirectory()).map(folder => folder.name),
        );

        this.pluginData = folders.map(folder => `${this.finalAddress}/${folder}`);
        const pluginFolders = folders.map(folder => path.join(this.pluginPath, folder));

        await this.setPluginInfo(pluginFolders);
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
      gitManager.clone(url, path.join(this.pluginPath, extractGitUrl(url).repo));

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
    await removeDir(plugin.dir);
    await this.reloadServer();
    return true;
  }

  public async isUpdateAvailable(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    return await GitManager.isUpdateAvailable(plugin.dir);
  }

  public async anyUpdateAvailable(): Promise<boolean> {
    try {
      const updateChecks = this.installedPluginInfo.map(plugin => GitManager.isUpdateAvailable(plugin.dir));
      const results = await Promise.all(updateChecks);
      return results.some(result => result === true);
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  public async updatePlugin(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    return new Promise<boolean>(resolve => {
      const gitManager = new GitManager(true);
      gitManager.pull(plugin.dir);

      gitManager.onComplete = async () => {
        appManager.getWebContent()?.send(this.updateChannel, id);
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
        const updateResult = await gitManager.pullAsync(plugin.dir);
        if (updateResult) updatedPlugins.push(plugin.info.id);
      }),
    );

    if (updatedPlugins.length > 0) {
      appManager.getWebContent()?.send(this.updateChannel, updatedPlugins);
      await this.reloadServer();
    }
  }

  public async createServer() {
    return new Promise<{port: number; hostName: string}>((resolve, reject) => {
      portFinder
        .getPortPromise({port: this.port})
        .then(async (port: number) => {
          try {
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

            this.server.on('error', serverError => {
              console.error('Server error:', serverError);
              reject(serverError);
            });

            this.server.listen(this.port, this.host, async () => {
              try {
                this.finalAddress = `http://${this.host}:${this.port}`;
                await this.readPlugin();
                resolve({hostName: this.host, port: this.port});
              } catch (configError) {
                console.error('Error writing config:', configError);
                this.server?.close();
                reject(configError);
              }
            });
          } catch (setupError) {
            console.error('Error setting up server:', setupError);
            reject(setupError);
          }
        })
        .catch(error => {
          console.error('Error finding available port:', error);
          reject(error);
        });
    });
  }

  public async reloadServer(): Promise<void> {
    return new Promise((resolve, reject) => {
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
          appManager.getWebContent()?.send(this.reloadChannel);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  public getMethodsById(id: string): TMethods['methods'] | undefined {
    return this.mainMethods.find(plugin => plugin.id === id)?.methods;
  }

  public getPluginData(): string[] {
    return this.pluginData;
  }

  public getInstalledPluginInfo(): TInfo[] {
    return this.installedPluginInfo.map(installed => installed.info);
  }

  public getDirById(id: string) {
    return this.installedPluginInfo.find(installed => installed.info.id === id);
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

          validatedFolders.push(folder);
        } catch (err) {
          console.log(`Skipping folder "${folder}" due to missing requirements.`);
        }
      }
    }

    return validatedFolders;
  }
}
