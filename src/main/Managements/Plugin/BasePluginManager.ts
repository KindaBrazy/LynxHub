import {execSync} from 'node:child_process';
import {createServer} from 'node:http';
import {join, resolve} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {constants, promises, readdirSync} from 'graceful-fs';
import {compact, includes, isString} from 'lodash';
import portFinder from 'portfinder';
import {ltr, satisfies} from 'semver';
import handler from 'serve-handler';

import {EXTENSION_API_VERSION, MODULE_API_VERSION} from '../../../cross/CrossConstants';
import {SubscribeStages} from '../../../cross/CrossTypes';
import {SkippedPlugins} from '../../../cross/IpcChannelAndTypes';
import {MainModules} from '../../../cross/plugin/ModuleTypes';
import {PluginEngines, PluginMetadata, VersionItem} from '../../../cross/plugin/PluginTypes';
import {appManager, staticManager} from '../../index';
import {RelaunchApp} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';
import ShowToastWindow from '../ToastWindowManager';

export abstract class BasePluginManager {
  protected readonly host: string = 'localhost';
  protected port: number;
  protected server: ReturnType<typeof createServer> | undefined = undefined;
  protected finalAddress: string = '';

  protected pluginData: string[] = [];
  protected skippedPlugins: SkippedPlugins[] = [];
  protected mainMethods: MainModules[] = [];
  protected installedPluginInfo: {dir: string; metadata: PluginMetadata}[] = [];

  protected readonly pluginPath: string;
  protected readonly mainScriptPath: string;
  protected readonly rendererScriptPath: string;
  protected readonly reloadChannel: string;
  protected readonly updateChannel: string;

  protected constructor(
    defaultPort: number,
    mainScriptPath: string,
    rendererScriptPath: string,
    reloadChannel: string,
    updateChannel: string,
  ) {
    this.port = defaultPort;
    this.mainScriptPath = mainScriptPath;
    this.rendererScriptPath = rendererScriptPath;
    this.reloadChannel = reloadChannel;
    this.updateChannel = updateChannel;
    this.pluginPath = getAppDirectory('Plugins');
  }

  protected async setInstalledPlugins(folders: string[]) {
    for (const folder of folders) {
      try {
        const targetDir = join(this.pluginPath, folder);
        const remoteUrl = await GitManager.remoteUrlFromDir(targetDir);
        if (!remoteUrl) continue;
        const id = await staticManager.getPluginIdByRepositoryUrl(remoteUrl);
        if (!id) continue;
        const metadata = await staticManager.getPluginMetadataById(id);

        this.installedPluginInfo.push({dir: folder, metadata});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  protected async readPlugin() {
    return new Promise<void>(async resolve => {
      try {
        const files = readdirSync(this.pluginPath, {withFileTypes: true});
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        const validFolders = await this.validatePluginFolders(folders);

        this.pluginData = validFolders.map(folder => `${this.finalAddress}/${folder}`);
        const pluginFolders = validFolders.map(folder => join(this.pluginPath, folder));

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

  public async installPlugin(url: string, commitHash: string) {
    return new Promise<boolean>(async resolve => {
      const id = await staticManager.getPluginIdByRepositoryUrl(url);
      if (id) {
        const directory = join(this.pluginPath, id);

        try {
          const gitManager = new GitManager(true);
          await gitManager.cloneShallow(url, directory, true, undefined, 'main');
          await gitManager.resetHard(directory, commitHash);

          resolve(true);
        } catch (e) {
          console.warn(e);
          resolve(false);
        }
      } else {
        resolve(false);
      }
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
    const installFolders = this.installedPluginInfo.map(folder => join(this.pluginPath, folder.dir));
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
        const available = await GitManager.isUpdateAvailable(join(this.pluginPath, plugin.dir));
        return {title: plugin.metadata.title, available};
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
        const updateResult = await gitManager.pullAsync(join(this.pluginPath, plugin.dir));
        if (updateResult) updatedPlugins.push(plugin.metadata.id);
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
          this.port = await portFinder.getPortPromise({port: this.port});

          this.server = createServer((req, res) => {
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

  public getInstalledPluginInfo(): {dir: string; metadata: PluginMetadata}[] {
    return this.installedPluginInfo;
  }

  public getDirById(id: string) {
    const plugin = this.installedPluginInfo.find(installed => installed.metadata.id === id);
    if (plugin) {
      return join(this.pluginPath, plugin.dir);
    }
    return undefined;
  }

  protected async validatePluginFolders(folderPaths: string[]): Promise<string[]> {
    const validatedFolders: string[] = [];

    for (const folder of folderPaths) {
      if (folder.startsWith('.')) {
        console.log(`Skipping folder "${folder}" because it starts with '.'`);
      } else {
        const dir = join(this.pluginPath, folder);
        const scriptsFolder = join(dir, 'scripts');

        try {
          await promises.access(scriptsFolder, constants.F_OK);

          await Promise.all([
            promises.access(join(dir, this.mainScriptPath), constants.F_OK),
            promises.access(join(dir, this.rendererScriptPath), constants.F_OK),
          ]);

          const isCompatible = await this.compatibleCheck(folder);
          if (isCompatible) validatedFolders.push(folder);
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

  public async migrate() {
    const targetDir = this.pluginPath;
    const oldInstallations: string[] = [];

    // Store already installed plugins
    try {
      const entries = await promises.readdir(targetDir, {withFileTypes: true});

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subdirPath = resolve(targetDir, entry.name);
          try {
            const url = await GitManager.remoteUrlFromDir(subdirPath);
            if (url) oldInstallations.push(url);
          } catch (e) {
            // Ignore subdirectories that are not Git repositories or where the remote cannot be determined
            // console.warn(`Could not determine remote URL for ${subdirPath}:`, e);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to read plugin directory ${targetDir}:`, error);
    }

    // Remove old installations
    try {
      await promises.rm(targetDir, {recursive: true, force: true});
      await promises.mkdir(targetDir, {recursive: true});
    } catch (error) {
      console.error(`Failed to clean directory ${targetDir}:`, error);
      throw error;
    }

    // Reinstall in the new way
    for (const url of oldInstallations) {
      let targetCommit: string;

      const id = await staticManager.getPluginIdByRepositoryUrl(url);
      if (!id) continue;

      const {versions} = await staticManager.getPluginVersioningById(id);
      const stage = await staticManager.getCurrentAppState();

      const findVersionByStage = (requiredStage: SubscribeStages): VersionItem | undefined => {
        return versions.find(v => v.stage.includes(requiredStage));
      };

      let versionItem: VersionItem | undefined = undefined;

      switch (stage) {
        case 'insider': {
          versionItem = findVersionByStage('insider');

          if (!versionItem) {
            versionItem = findVersionByStage('early_access');
          }

          if (!versionItem) {
            versionItem = findVersionByStage('public');
          }
          break;
        }

        case 'early_access': {
          versionItem = findVersionByStage('early_access');

          if (!versionItem) {
            versionItem = findVersionByStage('public');
          }
          break;
        }

        case 'public': {
          versionItem = findVersionByStage('public');
          break;
        }
      }

      if (versionItem) {
        targetCommit = versionItem.commit;
      } else {
        targetCommit = versions[0].commit;
      }

      await this.installPlugin(url, targetCommit);
    }
  }

  /**
   * Checks if a plugin is compatible with the current application version.
   * @param folder The plugin's folder name, for logging purposes.
   * @returns {Promise<boolean>} True if compatible, false otherwise.
   */
  protected async compatibleCheck(folder: string): Promise<boolean> {
    const skip = () => {
      this.skippedPlugins.push({
        folderName: folder,
        message: 'Configuration file is unreadable or corrupt.',
      });
      console.error(`Skipping plugin "${folder}" due to invalid configuration file.`);
    };

    const targetDir = join(this.pluginPath, folder);

    const remoteUrl = await GitManager.remoteUrlFromDir(targetDir);
    if (!remoteUrl) {
      skip();
      return false;
    }

    const gitManager = new GitManager();
    const currentCommitHash = await gitManager.getCurrentCommitHash(targetDir);
    const itemId = await staticManager.getPluginIdByRepositoryUrl(remoteUrl);
    if (!itemId) {
      skip();
      return false;
    }

    const versioning = await staticManager.getPluginVersioningById(itemId);

    const engines: PluginEngines | undefined = versioning.versions.find(
      item => item.commit === currentCommitHash,
    )?.engines;

    if (engines && typeof engines === 'object') {
      const checks = [
        {api: 'moduleApi', version: MODULE_API_VERSION, type: 'Module'},
        {api: 'extensionApi', version: EXTENSION_API_VERSION, type: 'Extension'},
      ];

      for (const check of checks) {
        const requiredRange = engines[check.api as keyof PluginEngines];
        if (requiredRange && !satisfies(check.version, requiredRange)) {
          // ltr(app_version, required_range) is true if the app version is lower.
          const isAppTooOld = ltr(check.version, requiredRange);

          // --- Message 2 & 3: Version Mismatch ---
          const message = isAppTooOld
            ? `Requires a newer version of LynxHub to run.` // App is too old for the plugin.
            : `This ${check.type} is too old for your version of LynxHub.`; // Plugin is too old for the app.

          this.skippedPlugins.push({
            folderName: folder,
            message: message,
          });
          console.log(`Skipping plugin "${folder}": ${message}`);
          return false;
        }
      }
      // If all engine checks pass, the plugin is compatible.
      return true;
    } else {
      // --- Message 4: Missing Compatibility Info ---
      this.skippedPlugins.push({
        folderName: folder,
        message: 'Could not verify compatibility. The plugin may be outdated or invalid.',
      });
      console.log(`Skipping plugin "${folder}" because it's missing compatibility information (engines field).`);
      return false;
    }
  }
}
