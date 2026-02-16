import {existsSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';

import {APP_BUILD_NUMBER, STATICS_URL} from '@lynx_common/consts';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionsInfo,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
  SubscribeStages,
} from '@lynx_common/types';
import {PluginMetadata, PluginVersioning} from '@lynx_common/types/plugins';
import {toMs} from '@lynx_common/utils';
import GitManager from '@lynx_main/git';
import {promises} from 'graceful-fs';

import classHolder from './classHolder';
import {getAppDirectory} from './dataFolder';

type PluginAvailableItem = {metadata: PluginMetadata; versioning: PluginVersioning; url: string};

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

  /** Returns true if statics are available (git installed and clone succeeded) */
  public isAvailable(): boolean {
    return this.requirementsCheckCompleted && this.gitAvailable;
  }

  public async checkRequirements() {
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
        } catch (e) {
          console.log('not available statics');
          this.requirementsCheckCompleted = false;
        }
      }
    })();

    return this.requirementsCheckPromise;
  }

  public async pull() {
    if (!this.gitAvailable || !classHolder.isOnline) return;
    try {
      await this.gitManager.pull(this.dir);
    } catch {
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

  public async getNotification(): Promise<Notification_Data[] | undefined> {
    return this.getDataAsJson<Notification_Data[]>('notifications.json');
  }

  public async getModules(): Promise<ModulesInfo[] | undefined> {
    return this.getDataAsJson<ModulesInfo[]>('modules.json');
  }

  public async getExtensions(): Promise<ExtensionsInfo[] | undefined> {
    return this.getDataAsJson<ExtensionsInfo[]>('extensions.json');
  }

  public async getExtensionsEA(): Promise<ExtensionsInfo[] | undefined> {
    return this.getDataAsJson<ExtensionsInfo[]>('extensions_ea.json');
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

  private async clone() {
    try {
      const dirUrl = await GitManager.getRemoteUrlFromDirectory(this.dir);

      if (dirUrl && dirUrl === STATICS_URL) return;

      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    } catch (error) {
      // Check if git is not available (ENOENT = not found)
      const message = (error as Error)?.message || '';
      if (/spawn (git )?ENOENT/i.test(message) || /git.*not found/i.test(message)) {
        console.warn('StaticsManager: Git is not installed or not in PATH. Statics will not be available.');
        throw new Error('Git is not available');
      }
      // For other errors, try cloning again
      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    }
  }

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
