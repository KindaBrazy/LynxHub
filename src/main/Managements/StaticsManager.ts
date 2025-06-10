import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {
  AppUpdateData,
  AppUpdateInsiderData,
  Extension_ListData,
  ModulesInfo,
  Notification_Data,
} from '../../cross/CrossTypes';
import {getAppDirectory} from './AppDataManager';
import GitManager from './GitManager';

const url: string = 'https://github.com/KindaBrazy/LynxHub-Statics';

export default class StaticsManager {
  private gitManager: GitManager;
  private readonly dir: string;
  private readonly updateOnGet: boolean;

  constructor(updateOnGet: boolean = false) {
    this.updateOnGet = updateOnGet;
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

  private getDataAsJson(fileName: string) {
    const filePath = join(this.dir, fileName);
    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }

  public async checkRequirements() {
    await this.clone();
    await this.pull();
  }

  public async pull() {
    return this.gitManager.pull(this.dir);
  }

  public async getReleases() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('releases.json') as AppUpdateData;
  }

  public async getInsider() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('insider.json') as AppUpdateInsiderData;
  }

  public async getNotification() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('notifications.json') as Notification_Data;
  }

  public async getModules() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('modules.json') as ModulesInfo;
  }

  public async getExtensions() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('extensions.json') as Extension_ListData;
  }

  public async getExtensionsEA() {
    if (this.updateOnGet) await this.pull();
    return this.getDataAsJson('extensions_ea.json') as Extension_ListData;
  }
}
