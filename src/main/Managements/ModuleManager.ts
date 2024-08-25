import http from 'node:http';
import path from 'node:path';

import {is} from '@electron-toolkit/utils';
import fs from 'graceful-fs';
import portFinder from 'portfinder';
import handler from 'serve-handler';

import {CardMainMethods, MainModules, ModulesInfo} from '../../cross/CrossTypes';
import {extractGitHubUrl} from '../../cross/CrossUtils';
import {modulesChannels} from '../../cross/IpcChannelAndTypes';
import {appManager} from '../index';
import {getAppDirectory} from './AppDataManager';
import GitManager from './GitManager';
import {removeDir} from './Ipc/Methods/IpcMethods';

export default class ModuleManager {
  //#region Static Properties

  private static readonly DEFAULT_PORT: number = 5102;
  private static readonly DEFAULT_HOST: string = 'localhost';
  //#endregion

  //#region Private Properties

  private port: number = ModuleManager.DEFAULT_PORT;
  private host: string = ModuleManager.DEFAULT_HOST;
  private server: ReturnType<typeof http.createServer> | undefined = undefined;

  private readonly modulesPath: string;
  private finalAddress: string = '';

  private modulesData: string[] = [];

  private mainModules: MainModules[] = [];

  private installedModulesInfo: {dir: string; info: ModulesInfo}[] = [];
  //#endregion

  //#region Constructor

  constructor() {
    this.modulesPath = ModuleManager.getModulesPath();
  }

  //#endregion

  //#region Getters

  public getMethodsById(id: string): CardMainMethods | undefined {
    console.log(this.mainModules);
    return this.mainModules.find(module => module.id === id)?.methods;
  }

  public getModulesData(): string[] {
    return this.modulesData;
  }

  public getInstalledModulesInfo(): ModulesInfo[] {
    return this.installedModulesInfo.map(installed => installed.info);
  }

  public getDirById(id: string) {
    return this.installedModulesInfo.find(installed => installed.info.id === id);
  }

  //#endregion

  //#region Private Methods

  private async setModulesInfo(paths: string[]) {
    for (const modulePath of paths) {
      const filePath = path.join(modulePath, 'lynxModule.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      try {
        const jsonData = JSON.parse(content);

        const repoUrl = await GitManager.remoteUrlFromDir(modulePath);

        const moduleInfo: ModulesInfo = {
          ...jsonData,
          repoUrl,
        };

        this.installedModulesInfo.push({dir: modulePath, info: moduleInfo});
      } catch (error) {
        console.error(`Error parsing ${modulePath}: ${error}`);
      }
    }
  }

  private async writeConfig() {
    return new Promise<void>(async resolve => {
      try {
        const files = fs.readdirSync(this.modulesPath, {withFileTypes: true});
        const folders = await ModuleManager.validateModuleFolders(
          files.filter(file => file.isDirectory()).map(folder => folder.name),
        );

        this.modulesData = folders.map(folder => `${this.finalAddress}/${folder}`);

        const modulesFolder = folders.map(folder => path.join(this.modulesPath, folder));

        await this.setModulesInfo(modulesFolder);

        const importedModules = await Promise.all(
          modulesFolder.map(modulePath => import(`file://${path.join(modulePath, 'scripts', 'main.mjs')}`)),
        );

        importedModules.forEach(importedModule => {
          const modulesFromImport = importedModule.default as MainModules[];
          this.mainModules = [...this.mainModules, ...modulesFromImport];
        });

        resolve();
      } catch (error: any) {
        console.log(error.message);
        resolve();
      }
    });
  }

  //#endregion

  //#region Public Methods

  public async installModule(url: string) {
    return new Promise<boolean>(resolve => {
      const gitManager = new GitManager(true);

      gitManager.clone(url, path.join(this.modulesPath, extractGitHubUrl(url).repo));

      gitManager.onComplete = async () => {
        await this.reloadServer();
        resolve(true);
      };
      gitManager.onError = () => {
        resolve(false);
      };
    });
  }

  public async uninstallModule(id: string) {
    const module = this.getDirById(id);
    if (!module) return false;
    await removeDir(module.dir);
    await this.reloadServer();
    return true;
  }

  public async isUpdateAvailable(id: string) {
    const module = this.getDirById(id);
    if (!module) return false;
    return await GitManager.isUpdateAvailable(module.dir);
  }

  public async anyUpdateAvailable(): Promise<boolean> {
    try {
      const updateChecks = this.installedModulesInfo.map(module => GitManager.isUpdateAvailable(module.dir));

      const results = await Promise.all(updateChecks);

      return results.some(result => result === true);
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false; // or throw the error, depending on your error handling strategy
    }
  }

  public async updateModule(id: string) {
    const module = this.getDirById(id);
    if (!module) return false;
    return new Promise<boolean>(resolve => {
      const gitManager = new GitManager(true);

      gitManager.pull(module.dir);

      gitManager.onComplete = async () => {
        appManager.getWebContent()?.send(modulesChannels.onUpdatedModules, id);
        await this.reloadServer();
        resolve(true);
      };
      gitManager.onError = () => {
        resolve(false);
      };
    });
  }

  public async updateAllModules() {
    const updatedModules: string[] = [];
    await Promise.all(
      this.installedModulesInfo.map(async module => {
        const gitManager = new GitManager(false);

        const updateResult = await gitManager.pullAsync(module.dir);
        if (updateResult) updatedModules.push(module.info.id);
      }),
    );
    console.log(updatedModules);
    if (updatedModules.length > 0) {
      appManager.getWebContent()?.send(modulesChannels.onUpdatedModules, updatedModules);
      await this.reloadServer();
    }
    return;
  }

  public async createServer() {
    return new Promise<{port: number; hostName: string}>((resolve, reject) => {
      portFinder
        .getPortPromise({port: this.port})
        .then(async (port: number) => {
          this.port = port;
          this.server = http.createServer((req, res) => {
            const origin = is.dev ? '*' : 'file://';

            console.log(origin);
            res.setHeader('Access-Control-Allow-Origin', origin);

            return handler(req, res, {
              public: this.modulesPath,
            });
          });

          this.server.listen(this.port, this.host, async () => {
            this.finalAddress = `http://${this.host}:${this.port}`;
            await this.writeConfig();
            resolve({hostName: this.host, port: this.port});
          });
        })
        .catch(error => {
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
          this.modulesData = [];
          this.mainModules = [];
          this.installedModulesInfo = [];

          await this.createServer();

          appManager.getWebContent()?.send(modulesChannels.onReload);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  //#endregion

  //#region Static Methods

  public static getModulesPath() {
    return getAppDirectory('Modules');
  }

  public static async validateModuleFolders(folderPaths: string[]): Promise<string[]> {
    const modulesPath = ModuleManager.getModulesPath();

    const validatedFolders: string[] = [];

    for (const folderPath of folderPaths) {
      const dir = path.join(modulesPath, folderPath);
      const lynxJsonPath = path.join(dir, 'lynxModule.json');
      const scriptsFolder = path.join(dir, 'scripts');

      try {
        await fs.promises.access(lynxJsonPath, fs.constants.F_OK);

        await fs.promises.access(scriptsFolder, fs.constants.F_OK);

        const mainPath = path.join(scriptsFolder, 'main.mjs');
        const rendererPath = path.join(scriptsFolder, 'renderer.mjs');

        await Promise.all([
          fs.promises.access(mainPath, fs.constants.F_OK),
          fs.promises.access(rendererPath, fs.constants.F_OK),
        ]);

        validatedFolders.push(folderPath);
      } catch (err) {
        console.log(`Skipping folder ${folderPath} due to missing requirements.`);
      }
    }

    return validatedFolders;
  }

  //#endregion
}
