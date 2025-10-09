import {createServer} from 'node:http';
import {platform} from 'node:os';
import {dirname, join} from 'node:path';

import {is} from '@electron-toolkit/utils';
import {constants, promises, readdirSync} from 'graceful-fs';
import {includes, isString} from 'lodash';
import portFinder from 'portfinder';
import {ltr, satisfies} from 'semver';
import handler from 'serve-handler';

import {EXTENSION_API_VERSION, MODULE_API_VERSION} from '../../../cross/CrossConstants';
import {SubscribeStages} from '../../../cross/CrossTypes';
import {pluginChannels} from '../../../cross/IpcChannelAndTypes';
import {getUpdateType} from '../../../cross/plugin/CrossPluginUtils';
import {
  PluginAddresses,
  PluginEngines,
  PluginInstalledItem,
  PluginSyncItem,
  UnloadedPlugins,
  ValidatedPlugins,
} from '../../../cross/plugin/PluginTypes';
import {appManager, staticManager} from '../../index';
import {getAppDirectory} from '../AppDataManager';
import {setupGitManagerListeners} from '../Git/GitHelper';
import GitManager from '../Git/GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';
import ExtensionManager from './Extensions/ExtensionManager';
import ModuleManager from './Modules/ModuleManager';
import {hostName, oldFolders} from './PluginConstants';
import {
  getCommitByAppStage,
  getVersionByCommit,
  isSyncRequired,
  removeOldInstallations,
  showGitOwnershipToast,
} from './PluginUtils';

export class PluginManager {
  private port: number = 5103;
  private server: ReturnType<typeof createServer> | undefined = undefined;
  private finalAddress: string = '';

  private addresses: PluginAddresses = [];
  private skipped: UnloadedPlugins[] = [];
  private installed: PluginInstalledItem[] = [];
  private syncAvailable: PluginSyncItem[] = [];

  private readonly pluginPath: string;
  private readonly moduleManager: ModuleManager;
  private readonly extensionManager: ExtensionManager;
  private readonly gitManager: GitManager;

  constructor(moduleManager: ModuleManager, extensionManager: ExtensionManager) {
    this.moduleManager = moduleManager;
    this.extensionManager = extensionManager;
    this.pluginPath = getAppDirectory('Plugins');
    this.gitManager = new GitManager(true);
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

          this.server.listen(this.port, hostName, async () => {
            try {
              this.finalAddress = `http://${hostName}:${this.port}`;
              await this.readPlugin();
              resolve({hostName, port: this.port});
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

  private async readPlugin() {
    return new Promise<void>(async resolve => {
      try {
        const files = readdirSync(this.pluginPath, {withFileTypes: true});
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        const validFolders = await this.validatePluginFolders(folders);

        this.addresses = validFolders.map(({folder, type}) => ({
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

  private async setInstalledPlugins(folders: string[]) {
    for (const folder of folders) {
      try {
        const targetDir = join(this.pluginPath, folder);
        const remoteUrl = await GitManager.remoteUrlFromDir(targetDir);
        if (!remoteUrl) continue;

        const currentCommit = await this.gitManager.getCurrentCommitHash(targetDir);
        if (!currentCommit) continue;

        const id = await staticManager.getPluginIdByRepositoryUrl(remoteUrl);
        if (!id) continue;

        const version = await getVersionByCommit(id, currentCommit);
        if (!version) continue;

        this.installed.push({id: folder, url: remoteUrl, version});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  public getAddresses(): PluginAddresses {
    return this.addresses;
  }

  public getUnloadedList(): UnloadedPlugins[] {
    return this.skipped;
  }

  public getInstalledList(): PluginInstalledItem[] {
    return this.installed;
  }

  public getDirById(id: string) {
    const plugin = this.installed.find(installed => installed.id === id);

    if (plugin) return join(this.pluginPath, plugin.id);

    return undefined;
  }

  public async install(url: string, commitHash?: string) {
    return new Promise<boolean>(async resolve => {
      let targetCommit: string;
      const id = await staticManager.getPluginIdByRepositoryUrl(url);

      if (id) {
        if (commitHash) {
          targetCommit = commitHash;
        } else {
          targetCommit = await getCommitByAppStage(id);
        }

        const version = await getVersionByCommit(id, targetCommit);
        if (version) {
          const directory = join(this.pluginPath, id);

          try {
            setupGitManagerListeners(this.gitManager, url);
            await this.gitManager.cloneShallow(url, directory, true, undefined, 'main');
            await this.gitManager.resetHard(directory, targetCommit, true, 'main');

            this.installed.push({id, url, version});

            resolve(true);
          } catch (e) {
            console.warn(`Failed to install plugin: ${url}`, e);
            resolve(false);
          }
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  public async uninstall(id: string) {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    try {
      await removeDir(plugin);
      this.syncList_remove(id);
      this.installed = this.installed.filter(plugin => plugin.id !== id);
      return true;
    } catch (e) {
      console.warn(`Failed to uninstall ${id}: `, e);
      return false;
    }
  }

  private async isSyncRequired(id: string, stage: SubscribeStages) {
    try {
      const targetDir = this.getDirById(id);
      if (!targetDir) return false;

      const currentCommit = await this.gitManager.getCurrentCommitHash(targetDir, true);
      if (!currentCommit) return false;

      const targetItem = await isSyncRequired(id, currentCommit, stage);
      if (!targetItem) {
        this.syncList_remove(id);
        return false;
      }

      this.syncList_add(targetItem);
      return true;
    } catch (e) {
      console.warn(`Failed to check for updates ${id}: `, e);
      return false;
    }
  }

  public async checkForSync(stage: SubscribeStages): Promise<void> {
    try {
      for (const plugin of this.installed) {
        const id = plugin.id;
        await this.isSyncRequired(id, stage);
      }
    } catch (error) {
      console.error('Error checking for all updates:', error);

      const errorMessage = isString(error) ? error : error.message;
      if (includes(errorMessage, 'detected dubious ownership')) showGitOwnershipToast();
    }
  }

  public async syncItem(id: string, commit: string) {
    const targetDir = this.getDirById(id);
    if (!targetDir) return false;

    try {
      await this.gitManager.resetHard(targetDir, commit, true, 'main');

      this.syncList_remove(id);

      return true;
    } catch (e) {
      return false;
    }
  }

  public async updateSyncItem(id: string, commit: string) {
    const versioning = await staticManager.getPluginVersioningById(id);
    const targetDir = this.getDirById(id);
    if (!targetDir) return;

    const currentCommit = await this.gitManager.getCurrentCommitHash(targetDir, true);
    if (!currentCommit) return;

    const version = versioning.versions.find(v => v.commit === commit)?.version;
    const type = getUpdateType(versioning.versions, currentCommit, commit);
    if (!version || !type) return;

    const installedVersion = this.installed.find(item => item.id === id)?.version;
    if (installedVersion === version) {
      this.syncList_remove(id);
      return;
    }

    const target = {id, commit, version, type};
    this.syncList_add(target);
  }

  public async syncAll(items: {id: string; commit: string}[]) {
    const synced: string[] = [];

    try {
      for (const item of items) {
        const {id, commit} = item;

        const targetDir = this.getDirById(id);
        if (!targetDir) continue;

        await this.syncItem(id, commit);
        synced.push(id);
      }
      return synced;
    } catch (e) {
      console.warn(`Failed to update plugins: ${e}`);
    }

    return [];
  }

  private syncList_noticeRenderer() {
    appManager?.getWebContent()?.send(pluginChannels.onSyncAvailable, this.syncAvailable);
  }

  private syncList_remove(id: string) {
    this.syncAvailable = this.syncAvailable.filter(update => update.id !== id);
    this.syncList_noticeRenderer();
  }

  private syncList_add(item: PluginSyncItem) {
    let exist: boolean = false;

    this.syncAvailable = this.syncAvailable.map(syncItem => {
      if (syncItem.id === item.id) {
        exist = true;
        return item;
      }
      return syncItem;
    });

    if (!exist) this.syncAvailable.push(item);

    this.syncList_noticeRenderer();
  }

  private async validatePluginFolders(folderPaths: string[]): Promise<ValidatedPlugins> {
    const validatedFolders: ValidatedPlugins = [];

    for (const folder of folderPaths) {
      if (folder.startsWith('.')) {
        console.log(`Skipping folder "${folder}" because it starts with '.'`);
      } else {
        const dir = join(this.pluginPath, folder);
        const scriptsFolder = join(dir, 'scripts');
        const {type} = await staticManager.getPluginMetadataById(folder);

        const targetMainPath = type === 'module' ? oldFolders.module.mainScript : oldFolders.extension.mainScript;
        const targetRendererPath =
          type === 'module' ? oldFolders.module.rendererScript : oldFolders.extension.rendererScript;

        try {
          await promises.access(scriptsFolder, constants.F_OK);

          await Promise.all([
            promises.access(join(dir, targetMainPath), constants.F_OK),
            promises.access(join(dir, targetRendererPath), constants.F_OK),
          ]);

          const isCompatible = await this.compatibleCheck(folder);
          if (isCompatible) validatedFolders.push({type, folder});
        } catch (err) {
          this.skipped.push({
            id: folder,
            message: 'Unloaded due to incompatible structure.',
          });
          console.log(`Skipping folder "${folder}" due to missing requirements.`);
        }
      }
    }

    return validatedFolders;
  }

  /**
   * Checks if a plugin is compatible with the current application version.
   * @param folder The plugin's folder name, for logging purposes.
   * @returns {Promise<boolean>} True if compatible, false otherwise.
   */
  private async compatibleCheck(folder: string): Promise<boolean> {
    const skip = () => {
      this.skipped.push({
        id: folder,
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

    const currentCommitHash = await this.gitManager.getCurrentCommitHash(targetDir);
    const itemId = await staticManager.getPluginIdByRepositoryUrl(remoteUrl);
    if (!itemId) {
      skip();
      return false;
    }

    const versioning = await staticManager.getPluginVersioningById(itemId);
    const {type} = await staticManager.getPluginMetadataById(itemId);

    const currentVersion = versioning.versions.find(item => item.commit === currentCommitHash);

    if (!currentVersion) {
      this.skipped.push({
        id: folder,
        message: `Could not verify installed version. The ${type} may be outdated or invalid.`,
      });
      console.log(`Skipping ${type} "${folder}" because can't find installed commit hash in versions.`);
      return false;
    }

    const platforms = currentVersion.platforms;
    if (!platforms || !platforms.includes(platform())) {
      this.skipped.push({
        id: folder,
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

        this.skipped.push({
          id: folder,
          message: message,
        });
        console.log(`Skipping plugin "${folder}": ${message}`);
        return false;
      }

      // If all engine checks pass, the plugin is compatible.
      return true;
    } else {
      // --- Message 4: Missing Compatibility Info ---
      this.skipped.push({
        id: folder,
        message: `Could not verify compatibility. The ${type} may be outdated or invalid.`,
      });
      console.log(`Skipping plugin "${folder}" because it's missing compatibility information (engines field).`);
      return false;
    }
  }

  public async migrate() {
    const targetModuleDir = join(dirname(this.pluginPath), oldFolders.module.folder);
    const targetExtensionDir = join(dirname(this.pluginPath), oldFolders.extension.folder);

    const oldInstalledModules = await removeOldInstallations(targetModuleDir);
    const oldInstalledExtensions = await removeOldInstallations(targetExtensionDir);

    const oldInstallations = [...oldInstalledModules, ...oldInstalledExtensions];

    // Reinstall in the new way
    for (const url of oldInstallations) {
      const id = await staticManager.getPluginIdByRepositoryUrl(url);
      if (!id) continue;

      const targetCommit = await getCommitByAppStage(id);

      await this.install(url, targetCommit);
    }
  }
}
