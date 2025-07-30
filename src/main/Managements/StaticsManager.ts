import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {
  AppUpdateData,
  AppUpdateInsiderData,
  ExtensionsInfo,
  ModulesInfo,
  Notification_Data,
  PatreonSupporter,
} from '../../cross/CrossTypes';
import {toMs} from '../../cross/CrossUtils';
import {getAppDirectory} from './AppDataManager';
import GitManager from './GitManager';

const url: string = 'https://github.com/KindaBrazy/LynxHub-Statics';

export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private requirementsCheckPromise: Promise<void> | null = null;
  private requirementsCheckCompleted: boolean = false;

  constructor() {
    this.gitManager = new GitManager();
    this.dir = getAppDirectory('Statics');
  }

  private async clone() {
    try {
      const dirUrl = await GitManager.remoteUrlFromDir(this.dir);

      if (dirUrl && dirUrl === url) return;

      return this.gitManager.clone(url, this.dir);
    } catch (_e) {
      return this.gitManager.clone(url, this.dir);
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
    return this.gitManager.pull(this.dir);
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
}
