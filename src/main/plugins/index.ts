import {createHash} from 'node:crypto';
import {dirname, join} from 'node:path';

import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import {SubscribeStages} from '@lynx_common/types';
import {
  PluginAddresses,
  PluginInstalledItem,
  PluginSyncItem,
  UnloadedPlugins,
  ValidatedPlugins,
} from '@lynx_common/types/plugins';
import {getUpdateType} from '@lynx_common/utils/plugins';
import GitManager from '@lynx_main/git';
import {setupGitManagerListeners} from '@lynx_main/git/gitListeners';
import {removeDirRecursive} from '@lynx_main/ipc/methods/windowUtils';
import {pluginsIpc} from '@lynx_main/ipc/plugins/plugins';
import classHolder from '@lynx_main/managers/classHolder';
import {getAppDirectory} from '@lynx_main/managers/dataFolder';
import {captureException} from '@sentry/electron/main';
import axios from 'axios';
import {constants, promises, readdirSync} from 'graceful-fs';
import {includes, isString} from 'lodash-es';

import {AUTH_LOGIN_KEY} from '../monitoring/auth';
import {getTokens} from '../monitoring/token';
import {pluginFolders} from './constants';
import ExtensionManager from './extensions';
import ModuleManager from './modules';
import {
  getCommitByAppStage,
  getVersionByCommit,
  isSyncRequired,
  removeOldInstallations,
  showGitOwnershipToast,
} from './utils';

/**
 * Manages the lifecycle of plugins (extensions and modules).
 * Handles installation, updates, and synchronization.
 */
export class PluginManager {
  private addresses: PluginAddresses = [];
  private skipped: UnloadedPlugins[] = [];
  private installed: PluginInstalledItem[] = [];
  private syncAvailable: PluginSyncItem[] = [];

  private readonly pluginPath: string;
  private readonly moduleManager: ModuleManager;
  private readonly extensionManager: ExtensionManager;

  constructor(moduleManager: ModuleManager, extensionManager: ExtensionManager) {
    this.moduleManager = moduleManager;
    this.extensionManager = extensionManager;
    this.pluginPath = getAppDirectory('Plugins');
  }

  /**
   * Initializes the plugin system.
   */
  public async initPlugins(): Promise<void> {
    try {
      await this.loadPlugins();
    } catch (error) {
      console.error('Error initializing plugins:', error);
      captureException(error);
    }
  }

  /**
   * Loads installed plugins from the disk.
   */
  private async loadPlugins(): Promise<void> {
    const {staticManager} = classHolder;
    try {
      // Ensure plugin directory exists before reading
      try {
        await promises.access(this.pluginPath, constants.F_OK);
      } catch {
        // Directory doesn't exist - create it and return early (no plugins to load)
        await promises.mkdir(this.pluginPath, {recursive: true});
        return;
      }

      const files = readdirSync(this.pluginPath, {withFileTypes: true});
      const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
      const validFolders = await this.validatePluginFolders(folders);

      this.addresses = validFolders.map(({folder, type}) => ({
        address: `lynxplugin://${folder}`,
        type,
      }));

      await this.setInstalledPlugins(folders);

      const moduleFolders: string[] = [];
      const extensionFolder: string[] = [];

      for (const validItem of validFolders) {
        const metadata = await staticManager?.getPluginMetadataById(validItem.folder);
        if (!metadata) continue;
        if (metadata.type === 'module') {
          moduleFolders.push(join(this.pluginPath, validItem.folder));
        } else if (metadata.type === 'extension') {
          extensionFolder.push(join(this.pluginPath, validItem.folder));
        }
      }
      await this.extensionManager.importPlugins(extensionFolder);
      await this.moduleManager.importPlugins(moduleFolders);
    } catch (error: any) {
      console.error(`Loading Plugin Error: `, error);
      captureException(error);
    }
  }

  /**
   * Identifies installed plugins and populates the installed list.
   * @param folders - List of plugin folders.
   */
  private async setInstalledPlugins(folders: string[]) {
    const {staticManager} = classHolder;
    for (const folder of folders) {
      try {
        const targetDir = join(this.pluginPath, folder);
        const remoteUrl = await GitManager.getRemoteUrlFromDirectory(targetDir);
        if (!remoteUrl) continue;

        const gitManager = new GitManager(true);
        const currentCommit = await gitManager.getCurrentCommitHash(targetDir);
        if (!currentCommit) continue;

        const id = await staticManager?.getPluginIdByRepositoryUrl(remoteUrl);
        if (!id) continue;

        const version = await getVersionByCommit(id, currentCommit);
        if (!version) continue;

        this.installed.push({id: folder, url: remoteUrl, version});
      } catch (error) {
        console.error(`Error parsing ${folder}: ${error}`);
      }
    }
  }

  /**
   * Gets the list of plugin addresses.
   */
  public getAddresses(): PluginAddresses {
    return this.addresses;
  }

  /**
   * Gets the list of unloaded plugins.
   */
  public getUnloadedList(): UnloadedPlugins[] {
    return this.skipped;
  }

  /**
   * Adds a plugin to the list of unloaded/skipped plugins.
   */
  public addUnloadedPlugin(id: string, message: string): void {
    if (!this.skipped.some(item => item.id === id)) {
      this.skipped.push({id, message});
    }
  }

  /**
   * Gets the list of installed plugins.
   */
  public getInstalledList(): PluginInstalledItem[] {
    return this.installed;
  }

  /**
   * Gets the directory path for a specific plugin ID.
   * @param id - The plugin ID.
   * @returns The directory path or undefined if not found.
   */
  public getDirById(id: string): string | undefined {
    const plugin = this.installed.find(installed => installed.id === id);

    if (plugin) return join(this.pluginPath, plugin.id);

    return undefined;
  }

  /**
   * Resolves plugin metadata for installation.
   * @param url - The repository URL.
   * @param commitHash - Optional commit hash.
   * @returns Metadata object or null.
   */
  private async resolvePluginMetadata(url: string, commitHash?: string) {
    const {staticManager} = classHolder;
    const id = await staticManager?.getPluginIdByRepositoryUrl(url);
    if (!id) return null;

    const targetCommit = commitHash || (await getCommitByAppStage(id));
    if (!targetCommit) return null;

    const version = await getVersionByCommit(id, targetCommit);
    if (!version) return null;

    return {id, targetCommit, version};
  }

  /**
   * Performs the Git installation process.
   * @param url - The repository URL.
   * @param directory - The target directory.
   * @param targetCommit - The target commit hash.
   */
  private async performGitInstallation(url: string, directory: string, targetCommit: string) {
    const gitManager = new GitManager(true);
    setupGitManagerListeners(gitManager, url);
    await gitManager.shallowClone({url, directory, singleBranch: true, branch: 'main'});
    await gitManager.resetHard(directory, targetCommit, true, 'main');
  }

  /**
   * Installs a plugin from a URL.
   * @param url - The repository URL.
   * @param commitHash - Optional commit hash.
   * @returns True if installation succeeded, false otherwise.
   */
  public async install(url: string, commitHash?: string): Promise<boolean> {
    const metadata = await this.resolvePluginMetadata(url, commitHash);
    if (!metadata) {
      return false;
    }

    const {id, targetCommit, version} = metadata;
    const directory = join(this.pluginPath, id);

    try {
      await this.performGitInstallation(url, directory, targetCommit);
      this.installed.push({id, url, version});
      void trackDownload(id);
      return true;
    } catch (e) {
      console.warn(`Failed to install plugin: ${url}`, e);
      return false;
    }
  }

  /**
   * Uninstalls a plugin by ID.
   * @param id - The plugin ID.
   * @returns True if uninstallation succeeded, false otherwise.
   */
  public async uninstall(id: string): Promise<boolean> {
    const plugin = this.getDirById(id);
    if (!plugin) return false;
    try {
      await removeDirRecursive(plugin);
      this.syncList_remove(id);
      this.installed = this.installed.filter(plugin => plugin.id !== id);
      return true;
    } catch (e) {
      console.warn(`Failed to uninstall ${id}: `, e);
      return false;
    }
  }

  /**
   * Checks if a specific plugin requires synchronization.
   * @param id - The plugin ID.
   * @param stage - The subscription stage.
   * @returns True if sync is required (and added to list), false otherwise.
   */
  private async isSyncRequired(id: string, stage: SubscribeStages): Promise<boolean> {
    try {
      const targetDir = this.getDirById(id);
      if (!targetDir) return false;

      const gitManager = new GitManager(true);
      const currentCommit = await gitManager.getCurrentCommitHash(targetDir, true);
      if (!currentCommit) return false;

      const targetItem = await isSyncRequired(id, currentCommit, stage);
      if (!targetItem) {
        this.syncList_remove(id);
        return false;
      }

      this.addToSyncList(targetItem);
      return true;
    } catch (e) {
      console.warn(`Failed to check for updates ${id}: `, e);
      return false;
    }
  }

  /**
   * Checks for synchronization updates for all installed plugins.
   * @param stage - The subscription stage.
   */
  public async checkForSync(stage: SubscribeStages): Promise<void> {
    try {
      for (const plugin of this.installed) {
        const id = plugin.id;
        await this.isSyncRequired(id, stage);
      }
    } catch (error) {
      console.error('Error checking for all updates:', error);

      const errorMessage = isString(error) ? error : (error as Error).message;
      if (includes(errorMessage, 'detected dubious ownership')) showGitOwnershipToast();
    }
  }

  /**
   * Syncs a plugin to a specific commit.
   * @param id - The plugin ID.
   * @param commit - The target commit hash.
   * @returns True if successful, false otherwise.
   */
  public async syncItem(id: string, commit: string): Promise<boolean> {
    const targetDir = this.getDirById(id);
    if (!targetDir) return false;

    try {
      const gitManager = new GitManager(true);
      await gitManager.resetHard(targetDir, commit, true, 'main');

      this.syncList_remove(id);

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Updates a sync item with a new commit.
   * @param id - The plugin ID.
   * @param commit - The new commit hash.
   */
  public async updateSyncItem(id: string, commit: string) {
    const {staticManager} = classHolder;
    const versioning = await staticManager?.getPluginVersioningById(id);
    if (!versioning) return;

    const targetDir = this.getDirById(id);
    if (!targetDir) return;

    const gitManager = new GitManager(true);
    const currentCommit = await gitManager.getCurrentCommitHash(targetDir, true);
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
    this.addToSyncList(target);
  }

  /**
   * Syncs multiple items.
   * @param items - List of items to sync.
   * @returns List of synced IDs.
   */
  public async syncAll(items: {id: string; commit: string}[]): Promise<string[]> {
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
    pluginsIpc.send.onSyncAvailable(this.syncAvailable);
  }

  private syncList_remove(id: string) {
    this.syncAvailable = this.syncAvailable.filter(update => update.id !== id);
    this.syncList_noticeRenderer();
  }

  private addToSyncList(item: PluginSyncItem) {
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

  /**
   * Validates plugin folders to ensure they have the required structure.
   * @param folderPaths - List of folder names.
   * @returns List of validated plugins.
   */
  private async validatePluginFolders(folderPaths: string[]): Promise<ValidatedPlugins> {
    const {staticManager} = classHolder;
    const validatedFolders: ValidatedPlugins = [];

    for (const folder of folderPaths) {
      if (folder.startsWith('.')) {
        this.skipped.push({
          id: folder,
          message: "Unloaded because folder starts with '.'.",
        });
        console.log(`Skipping folder "${folder}" because it starts with '.'`);
      } else {
        const dir = join(this.pluginPath, folder);
        const scriptsFolder = join(dir, 'scripts');
        const metadata = await staticManager?.getPluginMetadataById(folder);

        if (!metadata) {
          this.skipped.push({
            id: folder,
            message: 'Unloaded because metadata could not be retrieved.',
          });
          console.log(`Skipping folder "${folder}" because metadata is unavailable.`);
          continue;
        }

        const {type} = metadata;

        const targetMainPath = type === 'module' ? pluginFolders.module.mainScript : pluginFolders.extension.mainScript;
        const targetRendererPath =
          type === 'module' ? pluginFolders.module.rendererScript : pluginFolders.extension.rendererScript;

        try {
          await promises.access(scriptsFolder, constants.F_OK);

          await Promise.all([
            promises.access(join(dir, targetMainPath), constants.F_OK),
            promises.access(join(dir, targetRendererPath), constants.F_OK),
          ]);

          validatedFolders.push({type, folder});
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
   * Migrates old plugin installations to the new structure.
   */
  public async migrate() {
    const {staticManager} = classHolder;
    const targetModuleDir = join(dirname(this.pluginPath), pluginFolders.module.oldFolder);
    const targetExtensionDir = join(dirname(this.pluginPath), pluginFolders.extension.oldFolder);

    const oldInstalledModules = await removeOldInstallations(targetModuleDir);
    const oldInstalledExtensions = await removeOldInstallations(targetExtensionDir);

    const oldInstallations = [...oldInstalledModules, ...oldInstalledExtensions];

    // Reinstall in the new way
    for (const url of oldInstallations) {
      const id = await staticManager?.getPluginIdByRepositoryUrl(url);
      if (!id) continue;

      const targetCommit = await getCommitByAppStage(id);

      await this.install(url, targetCommit);
    }
  }
}

/**
 * Solves the Proof of Work challenge.
 */
function solveChallengeNode(challenge: string, difficulty: number): string {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  while (true) {
    const hash = createHash('sha256').update(`${challenge}${nonce}`).digest('hex');
    if (hash.startsWith(prefix)) {
      return nonce.toString();
    }
    nonce++;
  }
}

/**
 * Sends a plugin download count increment tracking request.
 */
async function trackDownload(pluginId: string): Promise<void> {
  try {
    const token = await getTokens(AUTH_LOGIN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = `${LYNXHUB_WEBSITE}/api/plugins/download`;
      const response = await axios.post(url, {pluginId}, {headers, timeout: 5000});
      if (response.status === 200) {
        return;
      }
    } catch (err: any) {
      // Fallback to PoW verification if unauthorized (401 status)
      if (err.response?.status === 401) {
        const challengeUrl = `${LYNXHUB_WEBSITE}/api/plugins/download/challenge`;
        const challengeRes = await axios.get(challengeUrl, {timeout: 5000});
        const {challenge, difficulty} = challengeRes.data;

        const nonce = solveChallengeNode(challenge, difficulty);

        const verifyUrl = `${LYNXHUB_WEBSITE}/api/plugins/download`;
        await axios.post(
          verifyUrl,
          {pluginId, challenge, nonce},
          {headers: {'Content-Type': 'application/json'}, timeout: 5000},
        );
      } else {
        console.warn(`Failed tracking plugin download: ${err.message}`);
      }
    }
  } catch (error: any) {
    console.warn(`Failed tracking plugin download: ${error.message}`);
  }
}
