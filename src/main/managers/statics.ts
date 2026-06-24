import {existsSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';

import {APP_BUILD_NUMBER, LYNXHUB_WEBSITE, STATICS_URL} from '@lynx_common/consts';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionInfo,
  ModuleInfo,
  NotificationData,
  PatreonSupporter,
  SubscribeStages,
} from '@lynx_common/types';
import {PluginMetadata, PluginVersioning} from '@lynx_common/types/plugins';
import {toMs} from '@lynx_common/utils';
import GitManager from '@lynx_main/git';
import axios from 'axios';
import {promises} from 'graceful-fs';

import {AUTH_LOGIN_KEY} from '../monitoring/auth';
import {getTokens} from '../monitoring/token';
import classHolder from './classHolder';
import {getAppDirectory} from './dataFolder';

type PluginAvailableItem = {metadata: PluginMetadata; versioning: PluginVersioning; url: string};

/**
 * Manages static assets and configuration files synced from a remote Git repository.
 * Handles cloning, updating, and serving static data like releases, notifications, and plugin info.
 */
export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private requirementsCheckPromise: Promise<void> | null = null;
  private requirementsCheckCompleted: boolean = false;
  private pullIntervalId: NodeJS.Timeout | null = null;
  private gitAvailable: boolean = true;

  constructor() {
    this.gitManager = new GitManager();
    this.dir = getAppDirectory('Statics');
  }

  /**
   * Returns true if statics are available (git installed and clone succeeded)
   */
  public isAvailable(): boolean {
    return this.requirementsCheckCompleted && this.gitAvailable;
  }

  /**
   * Checks if requirements are met and initializes the statics repository.
   * Clones the repo if missing, or pulls updates if present.
   * Schedules periodic updates if online.
   */
  public async checkRequirements(): Promise<void> {
    if (this.requirementsCheckPromise) {
      return this.requirementsCheckPromise;
    }

    this.requirementsCheckPromise = (async () => {
      if (classHolder.isOnline) {
        try {
          await this.clone();
          await this.pull();

          if (!this.pullIntervalId) {
            this.pullIntervalId = setInterval(() => this.pull(), toMs(10, 'minutes'));
          }
          this.requirementsCheckCompleted = true;
        } catch (error) {
          const message = (error as Error)?.message || '';
          if (/Git is not available/i.test(message)) {
            this.gitAvailable = false;
            console.warn('StaticsManager: Git not available. App will run with limited functionality.');
          } else {
            console.warn('StaticsManager: Failed to check requirements:', error);
          }
          this.requirementsCheckCompleted = false;
        }
      } else {
        try {
          await promises.access(this.dir);
          this.requirementsCheckCompleted = true;
        } catch {
          console.warn('StaticsManager: Offline and statics directory missing.');
          this.requirementsCheckCompleted = false;
        }
      }
    })();

    return this.requirementsCheckPromise;
  }

  /**
   * Pulls the latest changes from the remote repository.
   * Re-clones if the local repository is corrupted.
   */
  public async pull() {
    if (!this.gitAvailable || !classHolder.isOnline) return;
    try {
      await this.gitManager.pull(this.dir);
    } catch {
      // If pull fails (e.g. merge conflicts, corruption), wipe and re-clone
      rmSync(this.dir, {recursive: true, force: true});
      await this.clone();
    }
  }

  public async getReleases(): Promise<AppUpdateData | undefined> {
    return this.getDataAsJson<AppUpdateData>('releases.json');
  }

  public async getInsider(): Promise<AppUpdateInsiderData | undefined> {
    return this.getDataAsJson<AppUpdateInsiderData>('insider.json');
  }

  public async getNotification(): Promise<NotificationData[] | undefined> {
    try {
      const token = await getTokens(AUTH_LOGIN_KEY);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.get(`${LYNXHUB_WEBSITE}/api/notifications`, {
        headers,
        timeout: 10000,
      });
      if (response.data && response.data.success) {
        return response.data.notifications;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch notifications from website:', error);
      return [];
    }
  }

  public async getModules(): Promise<ModuleInfo[] | undefined> {
    return this.getDataAsJson<ModuleInfo[]>('modules.json');
  }

  public async getExtensions(): Promise<ExtensionInfo[] | undefined> {
    return this.getDataAsJson<ExtensionInfo[]>('extensions.json');
  }

  public async getExtensionsEA(): Promise<ExtensionInfo[] | undefined> {
    return this.getDataAsJson<ExtensionInfo[]>('extensions_ea.json');
  }

  public async getPatrons(): Promise<PatreonSupporter[] | undefined> {
    return this.getDataAsJson<PatreonSupporter[]>('patrons.json');
  }

  public async getPluginMetadataById(pluginId: string): Promise<PluginMetadata | undefined> {
    const metadataPath = join('plugins', pluginId, 'metadata.json');
    return this.getDataAsJson<PluginMetadata>(metadataPath);
  }

  public async getPluginVersioningById(pluginId: string): Promise<PluginVersioning | undefined> {
    const versioningPath = join('plugins', pluginId, 'versioning.json');
    return this.getDataAsJson<PluginVersioning>(versioningPath);
  }

  public async getPluginIdByRepositoryUrl(repositoryUrl: string): Promise<string | undefined> {
    const targetPath = join('plugins', 'plugins_url.json');
    const urlMap = await this.getDataAsJson<Record<string, string>>(targetPath);
    if (!urlMap) return undefined;

    const entry = Object.entries(urlMap).find(([_id, url]) => url === repositoryUrl);

    return entry ? entry[0] : undefined;
  }

  /**
   * Determines the current application update stage (public, early_access, insider).
   */
  public async getCurrentAppState(): Promise<SubscribeStages> {
    const releases = await this.getReleases();
    const insider = await this.getInsider();

    if (!releases || !insider) return 'public';

    if (APP_BUILD_NUMBER === releases.currentBuild) {
      return 'public';
    } else if (APP_BUILD_NUMBER === releases.earlyAccess.build) {
      return 'early_access';
    } else if (APP_BUILD_NUMBER === insider.currentBuild) {
      return 'insider';
    }

    return 'public';
  }

  /**
   * Retrieves a list of available plugins with their metadata and versioning info.
   */
  public async getPluginsList(): Promise<PluginAvailableItem[]> {
    if (!this.isAvailable()) return [];

    const pluginsUrlPath = join('plugins', 'plugins_url.json');
    const urlMap = await this.getDataAsJson<Record<string, string>>(pluginsUrlPath);
    if (!urlMap) return [];

    const pluginsPath = join(this.dir, 'plugins');

    if (!existsSync(pluginsPath)) {
      return [];
    }

    const pluginIds = readdirSync(pluginsPath, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const pluginPromises = pluginIds.map(async (id): Promise<PluginAvailableItem | null> => {
      const [metadata, versioning] = await Promise.all([
        this.getPluginMetadataById(id),
        this.getPluginVersioningById(id),
      ]);

      if (!metadata || !versioning) return null;

      return {metadata, versioning, url: urlMap[id] || ''};
    });

    const results = await Promise.all(pluginPromises);
    return results.filter((item): item is PluginAvailableItem => item !== null);
  }

  /** Stops the manager and clears the pull interval */
  public stop(): void {
    if (this.pullIntervalId) {
      clearInterval(this.pullIntervalId);
      this.pullIntervalId = null;
    }
  }

  /**
   * Clones the statics repository.
   * Handles cases where Git is missing or cloning fails.
   */
  private async clone() {
    try {
      const dirUrl = await GitManager.getRemoteUrlFromDirectory(this.dir);

      // If already cloned from correct URL, skip
      if (dirUrl && dirUrl === STATICS_URL) return;

      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    } catch (error) {
      // Check if git is not available (ENOENT = not found)
      const message = (error as Error)?.message || '';
      if (/spawn (git )?ENOENT/i.test(message) || /git.*not found/i.test(message)) {
        console.warn('StaticsManager: Git is not installed or not in PATH. Statics will not be available.');
        throw new Error('Git is not available', {cause: error});
      }
      // For other errors, try cloning again (might be corrupted repo)
      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    }
  }

  /**
   * Helper to read and parse a JSON file from the statics directory.
   * Handles retry logic for transient file system errors.
   */
  private async getDataAsJson<T>(fileName: string): Promise<T | undefined> {
    if (this.requirementsCheckPromise) {
      await this.requirementsCheckPromise;
    }

    if (!this.requirementsCheckCompleted) {
      // Statics not available - return undefined instead of throwing
      return undefined;
    }

    const filePath = join(this.dir, fileName);

    if (!existsSync(filePath)) {
      return undefined;
    }

    try {
      const fileContent = readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as T;
    } catch (error) {
      const errCode = (error as NodeJS.ErrnoException).code;
      // Handle transient file system errors (UNKNOWN, EIO, etc.) by retrying once after a short delay
      if (errCode === 'UNKNOWN' || errCode === 'EIO' || errCode === 'EBUSY') {
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
          const fileContent = readFileSync(filePath, 'utf8');
          return JSON.parse(fileContent) as T;
        } catch {
          return undefined;
        }
      }
      return undefined;
    }
  }
}
