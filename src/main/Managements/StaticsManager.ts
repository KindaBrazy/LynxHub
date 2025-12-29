import {existsSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';

import {APP_BUILD_NUMBER, STATICS_URL} from '../../cross/CrossConstants';
import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionsInfo,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
  SubscribeStages,
} from '../../cross/CrossTypes';
import {toMs} from '../../cross/CrossUtils';
import {PluginMetadata, PluginVersioning} from '../../cross/plugin/PluginTypes';
import {getAppDirectory} from './AppDataManager';
import GitManager from './Git/GitManager';

type PluginAvailableItem = {metadata: PluginMetadata; versioning: PluginVersioning; url: string};

export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private requirementsCheckPromise: Promise<void> | null = null;
  private requirementsCheckCompleted: boolean = false;
  private pullIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.gitManager = new GitManager();
    this.dir = getAppDirectory('Statics');
  }

  public async checkRequirements() {
    if (this.requirementsCheckPromise) {
      return this.requirementsCheckPromise;
    }

    this.requirementsCheckPromise = (async () => {
      try {
        await this.clone();
        await this.pull();

        if (!this.pullIntervalId) {
          this.pullIntervalId = setInterval(() => this.pull(), toMs(10, 'minutes'));
        }
        this.requirementsCheckCompleted = true;
      } catch (error) {
        console.warn('StaticsManager: Failed to check requirements:', error);
        // Don't reset promise - keep it resolved but mark as incomplete
        this.requirementsCheckCompleted = false;
      }
    })();

    return this.requirementsCheckPromise;
  }

  public async pull() {
    try {
      await this.gitManager.pull(this.dir);
    } catch {
      rmSync(this.dir, {recursive: true, force: true});
      await this.clone();
    }
  }

  public async getReleases() {
    return this.getDataAsJson<AppUpdateData>('releases.json');
  }

  public async getInsider() {
    return this.getDataAsJson<AppUpdateInsiderData>('insider.json');
  }

  public async getNotification() {
    return this.getDataAsJson<Notification_Data[]>('notifications.json');
  }

  public async getModules() {
    return this.getDataAsJson<ModulesInfo[]>('modules.json');
  }

  public async getExtensions() {
    return this.getDataAsJson<ExtensionsInfo[]>('extensions.json');
  }

  public async getExtensionsEA() {
    return this.getDataAsJson<ExtensionsInfo[]>('extensions_ea.json');
  }

  public async getPatrons() {
    return this.getDataAsJson<PatreonSupporter[]>('patrons.json');
  }

  public async getPluginMetadataById(pluginId: string): Promise<PluginMetadata> {
    const metadataPath = join('plugins', pluginId, 'metadata.json');
    return this.getDataAsJson<PluginMetadata>(metadataPath);
  }

  public async getPluginVersioningById(pluginId: string): Promise<PluginVersioning> {
    const versioningPath = join('plugins', pluginId, 'versioning.json');
    return this.getDataAsJson<PluginVersioning>(versioningPath);
  }

  public async getPluginIdByRepositoryUrl(repositoryUrl: string): Promise<string | undefined> {
    const targetPath = join('plugins', 'plugins_url.json');
    const urlMap = await this.getDataAsJson<Record<string, string>>(targetPath);

    const entry = Object.entries(urlMap).find(([_id, url]) => url === repositoryUrl);

    return entry ? entry[0] : undefined;
  }

  public async getCurrentAppState(): Promise<SubscribeStages> {
    const releases = await this.getReleases();
    const insider = await this.getInsider();

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
    const pluginsUrlPath = join('plugins', 'plugins_url.json');
    const urlMap = await this.getDataAsJson<Record<string, string>>(pluginsUrlPath);

    const pluginsPath = join(this.dir, 'plugins');

    if (!existsSync(pluginsPath)) {
      return [];
    }

    const pluginIds = readdirSync(pluginsPath, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const pluginPromises = pluginIds.map(async (id): Promise<PluginAvailableItem> => {
      const [metadata, versioning] = await Promise.all([
        this.getPluginMetadataById(id),
        this.getPluginVersioningById(id),
      ]);

      return {metadata, versioning, url: urlMap[id] || ''};
    });

    return Promise.all(pluginPromises);
  }

  private async clone() {
    try {
      const dirUrl = await GitManager.remoteUrlFromDir(this.dir);

      if (dirUrl && dirUrl === STATICS_URL) return;

      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    } catch {
      return this.gitManager.shallowClone({url: STATICS_URL, directory: this.dir, singleBranch: true, branch: 'main'});
    }
  }

  private async getDataAsJson<T>(fileName: string): Promise<T> {
    if (this.requirementsCheckPromise) {
      await this.requirementsCheckPromise;
    }

    if (!this.requirementsCheckCompleted) {
      throw new Error('StaticsManager: Statics not available - checkRequirements failed or not called');
    }

    const filePath = join(this.dir, fileName);

    if (!existsSync(filePath)) {
      throw new Error(`StaticsManager: File not found: ${fileName}`);
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
        } catch (retryError) {
          throw new Error(`StaticsManager: Failed to read ${fileName} after retry: ${retryError}`);
        }
      }
      throw new Error(`StaticsManager: Failed to read/parse ${fileName}: ${error}`);
    }
  }
}
