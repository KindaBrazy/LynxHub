import {Client, SetActivity} from '@xhayper/discord-rpc';

import {APP_NAME} from '../../cross/CrossConstants';
import {DiscordRPC} from '../../cross/CrossTypes';
import {toMs} from '../../cross/CrossUtils';
import {DiscordRunningAI} from '../../cross/IpcChannelAndTypes';
import {storageManager} from '../index';

/**
 * Manages Discord Rich Presence for the LynxHub application.
 */
export default class DiscordRpcManager {
  //#region Static Properties

  private static readonly MAX_RETRY_COUNT = 7;

  private static readonly RETRY_DELAY = toMs(5, 'seconds');
  private static readonly UPDATE_INTERVAL = toMs(15, 'seconds');
  //#endregion

  //#region Private Properties

  private client: Client;
  private activity?: SetActivity;
  private isReadyToActivity = false;
  private discordRP?: DiscordRPC;
  private readonly startAppTimestamp: Date;
  private startAITimestamp?: Date;
  private retryCount = 0;
  private intervalRepeatActivity?: NodeJS.Timeout;
  //#endregion

  //#region Constructor

  constructor() {
    this.startAppTimestamp = new Date();
    this.client = new Client({clientId: ''});

    this.client.on('ready', this.handleClientReady);
    this.client.login().catch(console.error);
  }

  //#endregion

  //#region Private Methods

  private handleClientReady = (): void => {
    this.isReadyToActivity = true;
  };

  private resetToDefaultActivity(): void {
    this.activity = {
      details: '🧠 Exploring AI capabilities...',
      largeImageKey: 'lynxhub',
      largeImageText: APP_NAME,
      startTimestamp:
        this.discordRP?.LynxHub.Enabled && this.discordRP.LynxHub.TimeElapsed ? this.startAppTimestamp : undefined,
      instance: false,
    };
  }

  private clearActivity(): void {
    if (this.isReadyToActivity) {
      this.retryCount = 0;
      this.client.user?.clearActivity();
      this.stopActivityLoop();
    } else if (this.retryCount < DiscordRpcManager.MAX_RETRY_COUNT) {
      this.retryCount++;
      setTimeout(() => this.clearActivity(), DiscordRpcManager.RETRY_DELAY);
    }
  }

  private setActivity(): void {
    if (this.isReadyToActivity && this.activity) {
      this.retryCount = 0;
      this.client.user?.setActivity(this.activity);
    } else if (this.retryCount < DiscordRpcManager.MAX_RETRY_COUNT) {
      this.retryCount++;
      setTimeout(() => this.setActivity(), DiscordRpcManager.RETRY_DELAY);
    }
  }

  private updateActivityLoop(): void {
    if (this.isReadyToActivity) {
      this.retryCount = 0;
      if (!this.intervalRepeatActivity) {
        this.intervalRepeatActivity = setInterval(() => this.setActivity(), DiscordRpcManager.UPDATE_INTERVAL);
      }
    } else if (this.retryCount < DiscordRpcManager.MAX_RETRY_COUNT) {
      this.retryCount++;
      setTimeout(() => this.updateActivityLoop(), DiscordRpcManager.RETRY_DELAY);
    }
  }

  private stopActivityLoop(): void {
    if (this.intervalRepeatActivity) {
      clearInterval(this.intervalRepeatActivity);
      this.intervalRepeatActivity = undefined;
    }
  }

  private createActivityForStatus(status: DiscordRunningAI): SetActivity {
    const baseActivity: SetActivity = {
      ...this.activity,
      startTimestamp: this.discordRP?.RunningAI.TimeElapsed ? this.startAITimestamp : undefined,
    };

    const activityMap: Record<string, Partial<SetActivity>> = {
      image: {
        state: this.discordRP?.RunningAI.AIName ? `🎨 Creating images with ${status.name}` : '🎨 Generating images',
      },
      audio: {
        state: this.discordRP?.RunningAI.AIName ? `🎵 Producing audio with ${status.name}` : '🎵 Generating audio',
      },
      text: {
        state: this.discordRP?.RunningAI.AIName
          ? `💬 Conversing with AI: ${status.name}`
          : '💬 Engaging in AI conversation',
      },
      unknown: {
        state: this.discordRP?.RunningAI.AIName ? `🔬 Utilizing AI: ${status.name}` : '🔬 Working with AI',
      },
    };

    return {...baseActivity, ...activityMap[status.type || 'unknown']};
  }

  //#endregion

  //#region Public Methods

  /**
   * Starts the Discord RPC manager.
   */
  public start(): void {
    this.updateDiscordRP();
    if (this.discordRP?.LynxHub.Enabled) {
      this.setActivity();
      this.updateActivityLoop();
    }
  }

  /**
   * Updates the Discord Rich Presence settings.
   */
  public updateDiscordRP(): void {
    this.discordRP = storageManager.getData('app').discordRP;
    console.log(this.discordRP);
    this.resetToDefaultActivity();

    if (this.isReadyToActivity) {
      if (!this.discordRP.LynxHub.Enabled) {
        this.clearActivity();
      } else if (!this.intervalRepeatActivity) {
        this.updateActivityLoop();
      }
    }
  }

  /**
   * Updates the activity based on the AI running status.
   * @param status - The current AI running status
   */
  public runningAI(status: DiscordRunningAI): void {
    if (!this.discordRP?.LynxHub.Enabled && !status.running) {
      this.clearActivity();
      return;
    }

    if (!this.discordRP?.RunningAI.Enabled) {
      return;
    }

    if (!status.running) {
      this.resetToDefaultActivity();
      return;
    }

    this.startAITimestamp = new Date();
    this.activity = this.createActivityForStatus(status);

    if (!this.intervalRepeatActivity) {
      this.setActivity();
      this.updateActivityLoop();
    }
  }

  //#endregion
}
