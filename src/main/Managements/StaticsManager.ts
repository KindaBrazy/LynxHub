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

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const BUSY_FOLDER_RETRY_DELAY_MS = 2000;

export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private requirementsCheckPromise: Promise<void> | null = null;
  private requirementsCheckCompleted: boolean = false;
  private pullIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.gitManager = new GitManager();
    this.dir = getAppDirectory('Statics');
  }

  public async checkRequirements(): Promise<void> {
    if (this.requirementsCheckPromise) {
      return this.requirementsCheckPromise;
    }

    this.requirementsCheckPromise = this.initializeStatics();
    return this.requirementsCheckPromise;
  }

  private async initializeStatics(): Promise<void> {
    try {
      await this.ensureValidRepository();
      this.requirementsCheckCompleted = true;
      this.startPeriodicPull();
    } catch (error) {
      console.error('StaticsManager: Failed to initialize statics:', error);
      // Mark as completed anyway so app doesn't hang waiting
      // Data access will fail gracefully if files don't exist
      this.requirementsCheckCompleted = true;
    }
  }

  private startPeriodicPull(): void {
    if (this.pullIntervalId) {
      clearInterval(this.pullIntervalId);
    }
    this.pullIntervalId = setInterval(() => this.pull().catch(console.warn), toMs(10, 'minutes'));
  }

  /**
   * Ensures we have a valid, up-to-date statics repository.
   * Will delete and re-clone if the existing repo is corrupted or has wrong remote.
   */
  private async ensureValidRepository(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const isValid = await this.isRepositoryValid();

        if (!isValid) {
          await this.forceCleanAndClone();
        } else {
          // Repository exists and is valid, try to pull latest
          await this.pullWithFallback();
        }

        // Validate that we can read essential files
        await this.validateStaticsData();
        return;
      } catch (error) {
        console.warn(`StaticsManager: Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, error);

        if (attempt < MAX_RETRY_ATTEMPTS) {
          // Wait before retry, longer if it might be a busy folder issue
          const delay = this.isBusyFolderError(error) ? BUSY_FOLDER_RETRY_DELAY_MS : RETRY_DELAY_MS;
          await this.sleep(delay);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Checks if the statics directory is a valid git repo with correct remote.
   */
  private async isRepositoryValid(): Promise<boolean> {
    if (!existsSync(this.dir)) return false;

    try {
      const remoteUrl = await GitManager.remoteUrlFromDir(this.dir);
      return remoteUrl === STATICS_URL;
    } catch {
      return false;
    }
  }

  /**
   * Force removes the statics directory and clones fresh.
   * Handles busy folder scenarios with retries.
   */
  private async forceCleanAndClone(): Promise<void> {
    await this.safeRemoveDirectory();
    await this.cloneRepository();
  }

  /**
   * Safely removes the statics directory, handling busy folder scenarios.
   */
  private async safeRemoveDirectory(): Promise<void> {
    if (!existsSync(this.dir)) return;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        rmSync(this.dir, {recursive: true, force: true, maxRetries: 3, retryDelay: 100});
        return;
      } catch (error) {
        console.warn(`StaticsManager: Failed to remove directory (attempt ${attempt}):`, error);

        if (attempt < MAX_RETRY_ATTEMPTS) {
          await this.sleep(BUSY_FOLDER_RETRY_DELAY_MS);
        } else {
          throw new Error(`Failed to remove statics directory after ${MAX_RETRY_ATTEMPTS} attempts: ${error}`);
        }
      }
    }
  }

  /**
   * Clones the statics repository.
   */
  private async cloneRepository(): Promise<void> {
    await this.gitManager.shallowClone({
      url: STATICS_URL,
      directory: this.dir,
      singleBranch: true,
      branch: 'main',
    });
  }

  /**
   * Pulls latest changes, falls back to clean clone if pull fails.
   */
  private async pullWithFallback(): Promise<void> {
    try {
      await this.gitManager.pull(this.dir);
    } catch (pullError) {
      console.warn('StaticsManager: Pull failed, attempting clean clone:', pullError);
      await this.forceCleanAndClone();
    }
  }

  /**
   * Validates that essential statics files exist and are readable.
   */
  private async validateStaticsData(): Promise<void> {
    const essentialFiles = ['releases.json', 'modules.json', 'extensions.json'];

    for (const file of essentialFiles) {
      const filePath = join(this.dir, file);
      if (!existsSync(filePath)) {
        throw new Error(`Essential statics file missing: ${file}`);
      }

      // Try to parse to ensure it's valid JSON
      try {
        const content = readFileSync(filePath, 'utf8');
        JSON.parse(content);
      } catch (error) {
        throw new Error(`Invalid JSON in statics file ${file}: ${error}`);
      }
    }
  }

  private isBusyFolderError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return msg.includes('ebusy') || msg.includes('eperm') || msg.includes('locked') || msg.includes('in use');
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async pull(): Promise<void> {
    try {
      await this.gitManager.pull(this.dir);
    } catch {
      // Pull failed, try to recover by re-cloning
      console.warn('StaticsManager: Pull failed, attempting recovery...');
      try {
        await this.forceCleanAndClone();
        await this.validateStaticsData();
      } catch (recoveryError) {
        console.error('StaticsManager: Recovery failed:', recoveryError);
        // Don't throw - keep using existing data if available
      }
    }
  }

  public async getReleases(): Promise<AppUpdateData> {
    await this.ensureReady();
    return this.getDataAsJson('releases.json');
  }

  public async getInsider(): Promise<AppUpdateInsiderData> {
    await this.ensureReady();
    return this.getDataAsJson('insider.json');
  }

  public async getNotification(): Promise<Notification_Data[]> {
    await this.ensureReady();
    return this.getDataAsJson('notifications.json');
  }

  public async getModules(): Promise<ModulesInfo[]> {
    await this.ensureReady();
    return this.getDataAsJson('modules.json');
  }

  public async getExtensions(): Promise<ExtensionsInfo[]> {
    await this.ensureReady();
    return this.getDataAsJson('extensions.json');
  }

  public async getExtensionsEA(): Promise<ExtensionsInfo[]> {
    await this.ensureReady();
    return this.getDataAsJson('extensions_ea.json');
  }

  public async getPatrons(): Promise<PatreonSupporter[]> {
    await this.ensureReady();
    return this.getDataAsJson('patrons.json');
  }

  public async getPluginMetadataById(pluginId: string): Promise<PluginMetadata> {
    await this.ensureReady();
    const metadataPath = join('plugins', pluginId, 'metadata.json');
    return this.getDataAsJson(metadataPath);
  }

  public async getPluginVersioningById(pluginId: string): Promise<PluginVersioning> {
    await this.ensureReady();
    const versioningPath = join('plugins', pluginId, 'versioning.json');
    return this.getDataAsJson(versioningPath);
  }

  public async getPluginIdByRepositoryUrl(repositoryUrl: string): Promise<string | undefined> {
    await this.ensureReady();

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
    await this.ensureReady();

    const pluginsUrlPath = join('plugins', 'plugins_url.json');
    const urlMap = (await this.getDataAsJson(pluginsUrlPath)) as Record<string, string>;

    const pluginsPath = join(this.dir, 'plugins');

    if (!existsSync(pluginsPath)) {
      return [];
    }

    const pluginIds = readdirSync(pluginsPath, {withFileTypes: true})
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const pluginPromises = pluginIds.map(async (id): Promise<PluginAvailableItem | null> => {
      try {
        const [metadata, versioning] = await Promise.all([
          this.getPluginMetadataById(id),
          this.getPluginVersioningById(id),
        ]);
        return {metadata, versioning, url: urlMap[id] || ''};
      } catch {
        console.warn(`StaticsManager: Failed to load plugin ${id}`);
        return null;
      }
    });

    const results = await Promise.all(pluginPromises);
    return results.filter((item): item is PluginAvailableItem => item !== null);
  }

  /**
   * Ensures the manager is ready to serve data.
   * Waits for initialization and triggers recovery if needed.
   */
  private async ensureReady(): Promise<void> {
    if (this.requirementsCheckPromise) {
      await this.requirementsCheckPromise;
    }

    // If initialization failed or wasn't started, try to recover
    if (!this.requirementsCheckCompleted) {
      console.warn('StaticsManager: Not initialized, attempting recovery...');
      this.requirementsCheckPromise = this.initializeStatics();
      await this.requirementsCheckPromise;
    }
  }

  private getDataAsJson<T>(fileName: string): T {
    const filePath = join(this.dir, fileName);

    if (!existsSync(filePath)) {
      throw new Error(`Statics file not found: ${fileName}`);
    }

    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }
}
