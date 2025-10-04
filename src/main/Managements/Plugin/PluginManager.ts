import {execSync} from 'node:child_process';
import {createServer} from 'node:http';
import {platform} from 'node:os';
import {dirname, join, resolve} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {constants, promises, readdirSync} from 'graceful-fs';
import {includes, isString} from 'lodash';
import portFinder from 'portfinder';
import {ltr, satisfies} from 'semver';
import handler from 'serve-handler';

import {EXTENSION_API_VERSION, MODULE_API_VERSION} from '../../../cross/CrossConstants';
import {SubscribeStages} from '../../../cross/CrossTypes';
import {pluginChannels, SkippedPlugins} from '../../../cross/IpcChannelAndTypes';
import {
  InstalledPlugin,
  PluginAddresses,
  PluginEngines,
  PluginUpdateList,
  ValidatedPlugins,
} from '../../../cross/plugin/PluginTypes';
import {appManager, staticManager} from '../../index';
import {RelaunchApp} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';
import ShowToastWindow from '../ToastWindowManager';
import ExtensionManager from './Extensions/ExtensionManager';
import ModuleManager from './Modules/ModuleManager';
import {getCommitByAppStage, getCommitByStage, getVersionByCommit, isUpdateAvailable} from './PluginUtils';

export class PluginManager {
  protected readonly host: string = 'localhost';
  private port: number = 5103;
  protected server: ReturnType<typeof createServer> | undefined = undefined;
  protected finalAddress: string = '';

  protected pluginsAddresses: PluginAddresses = [];
  protected skippedPlugins: SkippedPlugins[] = [];
  protected installedPluginInfo: InstalledPlugin[] = [];
  protected availableUpdates: PluginUpdateList[] = [];

  protected readonly pluginPath: string;

  private readonly moduleFolder: string = 'Modules';
  private readonly moduleMainScriptPath: string = 'scripts/main.mjs';
  private readonly moduleRendererScriptPath: string = 'scripts/renderer.mjs';

  private readonly extensionFolder: string = 'Extensions';
  private readonly extensionMainScriptPath: string = 'scripts/main/mainEntry.mjs';
  private readonly extensionRendererScriptPath: string = 'scripts/renderer/rendererEntry.mjs';

  private moduleManager: ModuleManager;
  private extensionManager: ExtensionManager;

  constructor(moduleManager: ModuleManager, extensionManager: ExtensionManager) {
    this.moduleManager = moduleManager;
    this.extensionManager = extensionManager;
    this.pluginPath = getAppDirectory('Plugins');
  }

  protected async setInstalledPlugins(folders: string[]) {
    for (const folder of folders) {
      try {
        const targetDir = join(this.pluginPath, folder);
        const remoteUrl = await GitManager.remoteUrlFromDir(targetDir);
        if (!remoteUrl) continue;

        const gitManager = new GitManager();
        const currentCommit = await gitManager.getCurrentCommitHash(targetDir);
        if (!currentCommit) continue;

        const id = await staticManager.getPluginIdByRepositoryUrl(remoteUrl);
        if (!id) continue;

        const metadata = await staticManager.getPluginMetadataById(id);
        const version = await getVersionByCommit(id, currentCommit);
        if (!version) continue;

        this.installedPluginInfo.push({dir: folder, url: remoteUrl, version, metadata});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  public async installPlugin(url: string, commitHash?: string) {
    return new Promise<boolean>(async resolve => {
      let targetCommit: string;
      const id = await staticManager.getPluginIdByRepositoryUrl(url);

      if (id) {
        if (commitHash) {
          targetCommit = commitHash;
        } else {
          targetCommit = await getCommitByAppStage(id);
        }

        const directory = join(this.pluginPath, id);

        try {
          const gitManager = new GitManager(true);
          await gitManager.cloneShallow(url, directory, true, undefined, 'main');
          await gitManager.resetHard(directory, targetCommit);

          this.onNeedRestart(id);
          resolve(true);
        } catch (e) {
          console.warn(`Failed to install plugin: ${url}`, e);
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
      this.updateList_Remove(id);
      this.onNeedRestart(id);
      return true;
    } catch (e) {
      console.warn(`Failed to uninstall ${id}: `, e);
      return false;
    }
  }
  private onNeedRestart(id: 'all' | string) {
    appManager?.getWebContent()?.send(pluginChannels.onAppNeedRestart, id);
  }

  private updateList_NoticeRenderer() {
    appManager?.getWebContent()?.send(pluginChannels.onUpdateAvailableList, this.availableUpdates);
  }

  private updateList_Remove(id: string) {
    this.availableUpdates = this.availableUpdates.filter(update => update.id !== id);
    this.updateList_NoticeRenderer();
  }

  private updateList_Add(item: PluginUpdateList) {
    if (this.availableUpdates.some(update => update.id === item.id)) return;
    this.availableUpdates.push(item);

    this.updateList_NoticeRenderer();
  }

  public async isUpdateAvailable(id: string, stage: SubscribeStages) {
    try {
      const targetDir = this.getDirById(id);
      if (!targetDir) return false;

      const gitManager = new GitManager();

      const currentCommit = await gitManager.getCurrentCommitHash(targetDir, true);
      if (!currentCommit) return false;

      const targetItem = await isUpdateAvailable(id, currentCommit, stage);
      if (!targetItem) {
        this.updateList_Remove(id);
        return false;
      }

      this.updateList_Add(targetItem);

      return true;
    } catch (e) {
      console.warn(`Failed to check for updates ${id}: `, e);
      return false;
    }
  }

  public async checkStage(stage: SubscribeStages) {
    let isAnyStageChanged: boolean = false;
    const gitManager = new GitManager();

    for (const plugin of this.installedPluginInfo) {
      try {
        const {dir, metadata} = plugin;
        const id = metadata.id;

        const targetCommit = await getCommitByStage(id, stage);
        const currentCommit = await gitManager.getCurrentCommitHash(dir, true);

        if (!currentCommit) continue;

        await gitManager.resetHard(dir, targetCommit);
        this.onNeedRestart(id);
        this.updateList_Remove(id);

        isAnyStageChanged = true;
      } catch (e) {
        console.error('error changing ea branch: ', e);
      }
    }

    return isAnyStageChanged;
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

  public async checkForUpdates(stage: SubscribeStages): Promise<void> {
    try {
      for (const plugin of this.installedPluginInfo) {
        const id = plugin.metadata.id;
        await this.isUpdateAvailable(id, stage);
      }
    } catch (error) {
      console.error('Error checking for all updates:', error);

      const errorMessage = isString(error) ? error : error.message;
      if (includes(errorMessage, 'detected dubious ownership')) this.showGitOwnershipToast();
    }
  }

  public async updatePlugin(id: string) {
    const targetDir = this.getDirById(id);
    if (!targetDir) return false;

    try {
      const gitManager = new GitManager(true);
      const targetCommit = this.availableUpdates.find(update => update.id === id)?.version.commit;
      if (!targetCommit) return false;

      await gitManager.resetHard(targetDir, targetCommit);
      this.updateList_Remove(id);
      this.onNeedRestart(id);

      return true;
    } catch (e) {
      return false;
    }
  }

  public async updateAll() {
    try {
      for (const item of this.availableUpdates) {
        const id = item.id;
        const targetDir = this.getDirById(id);
        const targetCommit = this.availableUpdates.find(update => update.id === id)?.version.commit;
        if (!targetDir || !targetCommit) continue;
        await this.updatePlugin(id);
      }

      this.onNeedRestart('all');
    } catch (e) {
      console.warn(`Failed to update plugins: ${e}`);
    }
  }

  protected async readPlugin() {
    return new Promise<void>(async resolve => {
      try {
        const files = readdirSync(this.pluginPath, {withFileTypes: true});
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        const validFolders = await this.validatePluginFolders(folders);

        this.pluginsAddresses = validFolders.map(({folder, type}) => ({
          address: `${this.finalAddress}/${folder}`,
          type,
        }));

        await this.setInstalledPlugins(folders);

        const moduleFolders: string[] = [];
        const extensionFolder: string[] = [];

        for (const validItem of validFolders) {
          const metadata = await staticManager.getPluginMetadataById(validItem.folder);
          if (metadata.type === 'module') {
            moduleFolders.push(join(this.pluginPath, validItem.folder));
          } else if (metadata.type === 'extension') {
            extensionFolder.push(join(this.pluginPath, validItem.folder));
          }
        }
        await this.extensionManager.importPlugins(extensionFolder);
        await this.moduleManager.importPlugins(moduleFolders);

        resolve();
      } catch (error: any) {
        console.error(`Loading Plugin Error: `, error);
        resolve();
      }
    });
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

  public getPluginAddresses(): PluginAddresses {
    return this.pluginsAddresses;
  }

  public getSkipped(): SkippedPlugins[] {
    return this.skippedPlugins;
  }

  public getInstalledPluginInfo(): InstalledPlugin[] {
    return this.installedPluginInfo;
  }

  public getDirById(id: string) {
    const plugin = this.installedPluginInfo.find(installed => installed.metadata.id === id);
    if (plugin) {
      return join(this.pluginPath, plugin.dir);
    }
    return undefined;
  }

  protected async validatePluginFolders(folderPaths: string[]): Promise<ValidatedPlugins> {
    const validatedFolders: ValidatedPlugins = [];

    for (const folder of folderPaths) {
      if (folder.startsWith('.')) {
        console.log(`Skipping folder "${folder}" because it starts with '.'`);
      } else {
        const dir = join(this.pluginPath, folder);
        const scriptsFolder = join(dir, 'scripts');
        const {type} = await staticManager.getPluginMetadataById(folder);

        const targetMainPath = type === 'module' ? this.moduleMainScriptPath : this.extensionMainScriptPath;
        const targetRendererPath = type === 'module' ? this.moduleRendererScriptPath : this.extensionRendererScriptPath;

        try {
          await promises.access(scriptsFolder, constants.F_OK);

          await Promise.all([
            promises.access(join(dir, targetMainPath), constants.F_OK),
            promises.access(join(dir, targetRendererPath), constants.F_OK),
          ]);

          const isCompatible = await this.compatibleCheck(folder);
          if (isCompatible) validatedFolders.push({type, folder});
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

  private async migrateRemoveOld(folder: string) {
    const oldInstallations: string[] = [];

    // Store already installed plugins
    try {
      const entries = await promises.readdir(folder, {withFileTypes: true});

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subdirPath = resolve(folder, entry.name);
          try {
            const url = await GitManager.remoteUrlFromDir(subdirPath);
            if (url) oldInstallations.push(url);
          } catch (e) {
            // Ignore subdirectories that are not Git repositories or where the remote cannot be determined
            console.warn(`Could not determine remote URL for ${subdirPath}:`, e);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to read plugin directory ${folder}:`, error);
    }

    // Remove old installations
    try {
      await promises.rm(folder, {recursive: true, force: true});
    } catch (error) {
      console.error(`Failed to clean directory ${folder}:`, error);
      throw error;
    }

    return oldInstallations;
  }

  public async migrate() {
    const targetModuleDir = join(dirname(this.pluginPath), this.moduleFolder);
    const targetExtensionDir = join(dirname(this.pluginPath), this.extensionFolder);

    const oldInstalledModules = await this.migrateRemoveOld(targetModuleDir);
    const oldInstalledExtensions = await this.migrateRemoveOld(targetExtensionDir);

    const oldInstallations = [...oldInstalledModules, ...oldInstalledExtensions];

    // Reinstall in the new way
    for (const url of oldInstallations) {
      const id = await staticManager.getPluginIdByRepositoryUrl(url);
      if (!id) continue;

      const targetCommit = await getCommitByAppStage(id);

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
    const {type} = await staticManager.getPluginMetadataById(itemId);

    const currentVersion = versioning.versions.find(item => item.commit === currentCommitHash);

    if (!currentVersion) {
      this.skippedPlugins.push({
        folderName: folder,
        message: `Could not verify installed version. The ${type} may be outdated or invalid.`,
      });
      console.log(`Skipping ${type} "${folder}" because can't find installed commit hash in versions.`);
      return false;
    }

    const platforms = currentVersion.platforms;
    if (!platforms || !platforms.includes(platform())) {
      this.skippedPlugins.push({
        folderName: folder,
        message: `Platform incompatibility detected. The ${type} may be outdated or invalid.`,
      });
      console.log(`Skipping ${type} "${folder}" due to unsupported platform.`);
      return false;
    }

    const engines = currentVersion.engines;
    if (engines && typeof engines === 'object') {
      const moduleCheck = {api: 'moduleApi', version: MODULE_API_VERSION, type: 'Module'};
      const extensionCheck = {api: 'extensionApi', version: EXTENSION_API_VERSION, type: 'Extension'};

      const targetCheck = type === 'extension' ? extensionCheck : moduleCheck;

      const requiredRange = engines[targetCheck.api as keyof PluginEngines];
      if (requiredRange && !satisfies(targetCheck.version, requiredRange)) {
        // ltr(app_version, required_range) is true if the app version is lower.
        const isAppTooOld = ltr(targetCheck.version, requiredRange);

        // --- Message 2 & 3: Version Mismatch ---
        const message = isAppTooOld
          ? `Requires a newer version of LynxHub to run.` // App is too old for the plugin.
          : `This ${type} is too old for your version of LynxHub.`; // Plugin is too old for the app.

        this.skippedPlugins.push({
          folderName: folder,
          message: message,
        });
        console.log(`Skipping plugin "${folder}": ${message}`);
        return false;
      }

      // If all engine checks pass, the plugin is compatible.
      return true;
    } else {
      // --- Message 4: Missing Compatibility Info ---
      this.skippedPlugins.push({
        folderName: folder,
        message: `Could not verify compatibility. The ${type} may be outdated or invalid.`,
      });
      console.log(`Skipping plugin "${folder}" because it's missing compatibility information (engines field).`);
      return false;
    }
  }
}
