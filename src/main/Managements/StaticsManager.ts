import {readdirSync, readFileSync, rmSync} from 'node:fs';
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
import GitManager from './GitManager';

type PluginAvailableItem = {metadata: PluginMetadata; versioning: PluginVersioning; url: string};

export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private requirementsCheckPromise: Promise<void> | null = null;
  private requirementsCheckCompleted: boolean = false;

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

        setInterval(() => this.pull(), toMs(10, 'minutes'));
        this.requirementsCheckCompleted = true;
      } catch (error) {
        this.requirementsCheckPromise = null;
        this.requirementsCheckCompleted = false;
        throw error;
      }
    })();

    return this.requirementsCheckPromise;
  }

  public async pull() {
    return new Promise((resolve, reject) => {
      this.gitManager
        .pull(this.dir)
        .then(resolve)
        .catch(() => {
          rmSync(this.dir, {recursive: true, force: true});
          this.clone().then(resolve).catch(reject);
        });
    });
  }

  public async getReleases() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('releases.json')) as AppUpdateData;
  }

  public async getInsider() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('insider.json')) as AppUpdateInsiderData;
  }

  public async getNotification() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('notifications.json')) as Notification_Data[];
  }

  public async getModules() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('modules.json')) as ModulesInfo[];
  }

  public async getExtensions() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('extensions.json')) as ExtensionsInfo[];
  }

  public async getExtensionsEA() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('extensions_ea.json')) as ExtensionsInfo[];
  }

  public async getPatrons() {
    await this.requirementsCheckPromise;
    return (await this.getDataAsJson('patrons.json')) as PatreonSupporter[];
  }

  public async getPluginMetadataById(pluginId: string): Promise<PluginMetadata> {
    await this.requirementsCheckPromise;

    const metadataPath = join('plugins', pluginId, 'metadata.json');
    return this.getDataAsJson(metadataPath);
  }

  public async getPluginVersioningById(pluginId: string): Promise<PluginVersioning> {
    await this.requirementsCheckPromise;
    const versioningPath = join('plugins', pluginId, 'versioning.json');
    return this.getDataAsJson(versioningPath);
  }

  public async getPluginIdByRepositoryUrl(repositoryUrl: string): Promise<string | undefined> {
    await this.requirementsCheckPromise;

    const targetPath = join('plugins', 'plugins_url.json');
    const urlMap = (await this.getDataAsJson(targetPath)) as Record<string, string>;

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
    await this.requirementsCheckPromise;

    const pluginsUrlPath = join('plugins', 'plugins_url.json');
    const urlMap = (await this.getDataAsJson(pluginsUrlPath)) as Record<string, string>;

    const pluginsPath = join(this.dir, 'plugins');
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

      return this.gitManager.clone(STATICS_URL, this.dir);
    } catch (_e) {
      return this.gitManager.clone(STATICS_URL, this.dir);
    }
  }

  private async getDataAsJson(fileName: string) {
    if (!this.requirementsCheckCompleted && this.requirementsCheckPromise) {
      await this.requirementsCheckPromise;
    } else if (!this.requirementsCheckCompleted && !this.requirementsCheckPromise) {
      console.warn('StaticsManager: Attempting to get data before checkRequirements was initiated.');
    }

    const filePath = join(this.dir, fileName);
    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
}
