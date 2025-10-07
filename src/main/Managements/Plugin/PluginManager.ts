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
import {pluginChannels} from '../../../cross/IpcChannelAndTypes';
import {getUpdateType} from '../../../cross/plugin/CrossPluginUtils';
import {
  PluginAddresses,
  PluginEngines,
  PluginInstalledItem,
  PluginItem,
  PluginSyncItem,
  UnloadedPlugins,
  ValidatedPlugins,
  VersionItem,
  VersionItemValidated,
} from '../../../cross/plugin/PluginTypes';
import {appManager, staticManager} from '../../index';
import {RelaunchApp} from '../../Utilities/Utils';
import {getAppDataPath, getAppDirectory, selectNewAppDataFolder} from '../AppDataManager';
import GitManager from '../GitManager';
import {removeDir} from '../Ipc/Methods/IpcMethods';
import ShowToastWindow from '../ToastWindowManager';
import ExtensionManager from './Extensions/ExtensionManager';
import ModuleManager from './Modules/ModuleManager';
import {getCommitByAppStage, getVersionByCommit, isSyncRequired} from './PluginUtils';

export class PluginManager {
  private readonly host: string = 'localhost';
  private port: number = 5103;
  private server: ReturnType<typeof createServer> | undefined = undefined;
  private finalAddress: string = '';
  private readonly pluginPath: string;

  private addresses: PluginAddresses = [];
  private skipped: UnloadedPlugins[] = [];
  private installed: PluginInstalledItem[] = [];
  private syncAvailable: PluginSyncItem[] = [];

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

        const version = await getVersionByCommit(id, targetCommit);
        if (version) {
          const directory = join(this.pluginPath, id);

          try {
            const gitManager = new GitManager(true);
            await gitManager.cloneShallow(url, directory, true, undefined, 'main');
            await gitManager.resetHard(directory, targetCommit);

            this.installed.push({id: directory, url, version});

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
    console.log(id, plugin);
    if (!plugin) return false;
    try {
      await removeDir(plugin);
      this.updateList_Remove(id);
      return true;
    } catch (e) {
      console.warn(`Failed to uninstall ${id}: `, e);
      return false;
    }
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

  public async checkForSync(stage: SubscribeStages): Promise<void> {
    try {
      for (const plugin of this.installed) {
        const id = plugin.id;
        await this.isSyncRequired(id, stage);
      }
    } catch (error) {
      console.error('Error checking for all updates:', error);

      const errorMessage = isString(error) ? error : error.message;
      if (includes(errorMessage, 'detected dubious ownership')) this.showGitOwnershipToast();
    }
  }

  public async sync(id: string, commit: string) {
    const targetDir = this.getDirById(id);
    if (!targetDir) return false;

    try {
      const gitManager = new GitManager(true);
      await gitManager.resetHard(targetDir, commit);

      this.updateList_Remove(id);

      return true;
    } catch (e) {
      return false;
    }
  }

  public async syncAll(items: {id: string; commit: string}[]) {
    try {
      for (const item of items) {
        const {id, commit} = item;

        const targetDir = this.getDirById(id);
        if (!targetDir) continue;

        await this.sync(id, commit);
      }
    } catch (e) {
      console.warn(`Failed to update plugins: ${e}`);
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
    if (plugin) {
      return join(this.pluginPath, plugin.id);
    }
    return undefined;
  }

  public async getList(currentStage: SubscribeStages): Promise<PluginItem[]> {
    const list = await staticManager.getPluginsList();
    const validated: PluginItem[] = [];

    for (const item of list) {
      const versions: VersionItemValidated[] = [];

      for (const v of item.versioning.versions) {
        const {version, commit, stage, platforms} = v;
        const {compatible: isCompatible, reason: incompatibleReason} = this.isCompatible(
          v,
          item.metadata.type,
          currentStage,
        );
        versions.push({version, commit, stage, platforms, isCompatible, incompatibleReason});
      }

      const isCompatible: boolean = versions.some(v => v.isCompatible);
      const incompatibleReason: string | undefined = versions.find(v => !v.isCompatible)?.incompatibleReason;

      const {metadata, url, icon, versioning} = item;

      validated.push({
        isCompatible,
        metadata,
        url,
        icon,
        versions,
        incompatibleReason,
        changes: versioning.changes,
      });
    }

    return validated;
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

  private async setInstalledPlugins(folders: string[]) {
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

        const version = await getVersionByCommit(id, currentCommit);
        if (!version) continue;

        this.installed.push({id: folder, url: remoteUrl, version});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  private updateList_NoticeRenderer() {
    appManager?.getWebContent()?.send(pluginChannels.onSyncAvailable, this.syncAvailable);
  }

  private updateList_Remove(id: string) {
    this.syncAvailable = this.syncAvailable.filter(update => update.id !== id);
    this.updateList_NoticeRenderer();
  }

  private updateList_Add(item: PluginSyncItem) {
    if (this.syncAvailable.some(update => update.id === item.id)) return;
    this.syncAvailable.push(item);

    this.updateList_NoticeRenderer();
  }

  public async updateSync(id: string, commit: string) {
    const versioning = await staticManager.getPluginVersioningById(id);
    const targetDir = this.getDirById(id);
    if (!targetDir) return;

    const gitManager = new GitManager();
    const currentCommit = await gitManager.getCurrentCommitHash(targetDir, true);

    if (!currentCommit) return;

    const version = versioning.versions.find(v => v.commit === commit)?.version;
    const type = getUpdateType(versioning.versions, currentCommit, commit);

    if (!version || !type) return;

    let exist: boolean = false;
    const target = {id, commit, version, type};

    this.syncAvailable = this.syncAvailable.map(item => {
      if (item.id === id) {
        exist = true;
        return target;
      }
      return item;
    });

    if (!exist) this.syncAvailable = [...this.syncAvailable, target];

    this.updateList_NoticeRenderer();
  }

  private async isSyncRequired(id: string, stage: SubscribeStages) {
    try {
      const targetDir = this.getDirById(id);
      if (!targetDir) return false;

      const gitManager = new GitManager();

      const currentCommit = await gitManager.getCurrentCommitHash(targetDir, true);
      if (!currentCommit) return false;

      const targetItem = await isSyncRequired(id, currentCommit, stage);
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

  private async validatePluginFolders(folderPaths: string[]): Promise<ValidatedPlugins> {
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

  private isCompatible(
    version: VersionItem,
    type: 'module' | 'extension',
    currentStage: SubscribeStages,
  ): {compatible: boolean; reason: string | undefined} {
    // 1. Subscribe Stage Check
    switch (currentStage) {
      // Have access to all stages
      case 'insider':
        break;

      // Have access to public and early access stages
      case 'early_access':
        if (version.stage === 'insider') {
          return {
            compatible: false,
            reason:
              `Version ${version.version} is only available for Insider subscribers.\n` +
              `Please upgrade your plan to get access.`,
          };
        }
        break;

      // Have access to only the public stage
      case 'public':
        if (version.stage !== 'public') {
          const requiredStage = version.stage === 'insider' ? 'Insider' : 'Early Access';
          return {
            compatible: false,
            reason:
              `Version ${version.version} requires an ${requiredStage} or higher subscription.\n` +
              `Please upgrade your plan to get access.`,
          };
        }
        break;
    }

    const currentPlatform = platform();

    // 2. Platform Check
    const platforms = version.platforms;
    if (!platforms || !platforms.includes(currentPlatform)) {
      const supportedPlatforms = platforms?.join(', ') || 'none';
      return {
        compatible: false,
        reason:
          `Version ${version.version} is not compatible with your operating system\n` +
          `(${currentPlatform}). It only supports: ${supportedPlatforms}.`,
      };
    }

    // 3. Engines/API Check
    const engines = version.engines;
    if (engines && typeof engines === 'object') {
      const moduleCheck = {api: 'moduleApi', version: MODULE_API_VERSION, type: 'Module'};
      const extensionCheck = {api: 'extensionApi', version: EXTENSION_API_VERSION, type: 'Extension'};

      const targetCheck = type === 'extension' ? extensionCheck : moduleCheck;
      const requiredRange = engines[targetCheck.api as keyof PluginEngines];

      if (requiredRange) {
        if (!satisfies(targetCheck.version, requiredRange)) {
          return {
            compatible: false,
            reason:
              `Version ${version.version} requires a different application version.\n` +
              `It needs ${type} api version ${requiredRange}, but current version api is ${targetCheck.version}.`,
          };
        }
      } else {
        // This suggests the package itself is malformed or invalid.
        return {
          compatible: false,
          reason:
            `Could not verify compatibility for version ${version.version}.\n` +
            `The package metadata may be missing or corrupted.`,
        };
      }
    } else {
      // A fallback for the same reason as above.
      return {
        compatible: false,
        reason: `Could not find compatibility information for version ${version.version}.`,
      };
    }

    // If all checks pass, it's compatible.
    return {compatible: true, reason: undefined};
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
}
