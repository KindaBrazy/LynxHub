import {Client, SetActivity} from '@xhayper/discord-rpc';

import {APP_NAME} from '../../cross/CrossConstants';
import {DiscordRPC} from '../../cross/CrossTypes';
import {DiscordRunningAI} from '../../cross/IpcChannelAndTypes';
import {storageManager} from '../index';

export default class DiscordRpcManager {
  private static readonly CLIENT_ID = '';

  private readonly client: Client;
  private readonly appStartTime: Date;

  private config?: DiscordRPC;
  private currentActivity: SetActivity | null = null;
  private aiStartTime?: Date;
  private isReady = false;

  constructor() {
    this.appStartTime = new Date();
    this.client = new Client({clientId: DiscordRpcManager.CLIENT_ID});

    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.client.on('ready', () => {
      console.log('Discord RPC client connected successfully.');
      this.isReady = true;
      this.updatePresence();
    });

    this.client.on('disconnected', () => {
      console.warn('Discord RPC client disconnected. It will attempt to reconnect automatically.');
      this.isReady = false;
    });

    try {
      await this.client.login();
    } catch (error) {
      console.error('Failed to login to Discord RPC. Presence will be disabled.', error);
    }
  }

  private updatePresence(): void {
    if (!this.isReady) {
      return;
    }

    if (this.currentActivity) {
      this.client.user?.setActivity(this.currentActivity).catch(console.error);
    } else {
      this.client.user?.clearActivity().catch(console.error);
    }
  }

  private buildDefaultActivity(): void {
    if (!this.config?.LynxHub.Enabled) {
      this.currentActivity = null;
      return;
    }

    this.currentActivity = {
      details: '🧠 Exploring the AI universe',
      state: 'Managing AI models & workflows',
      largeImageKey: 'lynxhub',
      largeImageText: `${APP_NAME}: Your All-in-One AI Platform`,
      startTimestamp: this.config.LynxHub.TimeElapsed ? this.appStartTime : undefined,
      instance: false,
    };
  }

  private buildAiActivity(status: DiscordRunningAI): void {
    if (!this.config?.RunningAI.Enabled) {
      this.buildDefaultActivity();
      return;
    }

    if (!this.aiStartTime) {
      this.aiStartTime = new Date();
    }

    const stateMap: Record<string, string> = {
      image: `🎨 Creating with ${status.name}`,
      audio: `🎵 Generating with ${status.name}`,
      text: `💬 Chatting with ${status.name}`,
      unknown: `🔬 Working with ${status.name}`,
    };

    const state = stateMap[status.type || 'unknown'] || stateMap.unknown;

    this.buildDefaultActivity();
    if (this.currentActivity) {
      this.currentActivity.details = '⚡ Running AI';
      this.currentActivity.state = state;
      this.currentActivity.startTimestamp = this.config.RunningAI.TimeElapsed ? this.aiStartTime : undefined;
    }
  }

  public start(): void {
    this.updateDiscordRP();
  }

  public updateDiscordRP(): void {
    this.config = storageManager.getData('app').discordRP;

    this.buildDefaultActivity();
    this.updatePresence();
  }

  public runningAI(status: DiscordRunningAI): void {
    if (!this.config?.LynxHub.Enabled) {
      this.currentActivity = null;
    } else if (status.running) {
      this.buildAiActivity(status);
    } else {
      this.aiStartTime = undefined;
      this.buildDefaultActivity();
    }

    this.updatePresence();
  }

  public dispose(): void {
    this.client.destroy().catch(console.error);
  }
}
