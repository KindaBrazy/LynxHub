import {Client, SetActivity} from '@xhayper/discord-rpc';
import {DiscordRP} from '../AppState/InterfaceAndTypes';
import {GetDiscordRPConfig} from './AppManage/AppConfigManager';
import {MainLogWarning} from '../AppState/AppConstants';

const clientId: string = '1178345324541124638';

let client: Client;
let activity: SetActivity;

let isReadyToActivity: boolean = false;

let discordRP: DiscordRP;
let runningWebUi: string;

let StartAppTimestamp: Date;
let StartWebUiTimestamp: Date;

let RetryCount: number = 0;

let intervalRepeatActivity: ReturnType<typeof setInterval> | null = null;

export function DRPCInit() {
  StartAppTimestamp = new Date();

  client = new Client({clientId});

  client.on('ready', () => {
    isReadyToActivity = true;
  });

  client.login().catch(console.log);
}

function ResetToDefaultActivity() {
  console.log(MainLogWarning(`***-> ${discordRP.AIOneLynx.Enabled} - ${discordRP.AIOneLynx.TimeElapsed}`));
  activity = {
    details: '🔥Exploring the power of AI ...',
    largeImageKey: 'aionelynx_icon',
    largeImageText: 'AIOne Lynx',
    startTimestamp: discordRP.AIOneLynx.Enabled && discordRP.AIOneLynx.TimeElapsed ? StartAppTimestamp : undefined,
    instance: false,
  };
}

export function DRPCClearActivity() {
  if (isReadyToActivity) {
    RetryCount = 0;
    client.user?.clearActivity();
    if (intervalRepeatActivity) {
      clearInterval(intervalRepeatActivity);
      intervalRepeatActivity = null;
    }
  } else if (RetryCount < 7) {
    RetryCount += 1;
    setTimeout(() => DRPCClearActivity(), 5e3);
  }
}

export function DRPCSetActivity() {
  if (isReadyToActivity) {
    RetryCount = 0;
    client.user?.setActivity(activity);
  } else if (RetryCount < 7) {
    RetryCount += 1;
    setTimeout(() => DRPCSetActivity(), 5e3);
  }
}

export function DRPCUpdateActivityLoop() {
  if (isReadyToActivity) {
    RetryCount = 0;
    intervalRepeatActivity = setInterval(() => DRPCSetActivity(), 15e3);
  } else if (RetryCount < 7) {
    RetryCount += 1;
    setTimeout(() => DRPCUpdateActivityLoop(), 5e3);
  }
}

export function DRPCRunningWebUI(status: {running: boolean; uiName: string}) {
  if (!discordRP.AIOneLynx.Enabled && !status.running) {
    DRPCClearActivity();

    if (intervalRepeatActivity) {
      clearInterval(intervalRepeatActivity);
      intervalRepeatActivity = null;
    }
    return;
  }

  if (!status.running) {
    ResetToDefaultActivity();
    return;
  }

  StartWebUiTimestamp = new Date();
  runningWebUi = status.uiName;
  switch (runningWebUi) {
    case 'AUTOMATIC1111':
    case 'LSHQQYTIGER':
    case 'COMFYANONYMOUS':
      activity = {
        ...activity,
        state: discordRP.RunningWebUI.WebUIName ? `🖼️ Generating images with: ${runningWebUi} WebUI . . .` : '🖼️ Generating awesome images . . .',
        startTimestamp: discordRP.RunningWebUI.TimeElapsed ? StartWebUiTimestamp : undefined,
        smallImageKey: 'imagegeneration_icon',
        smallImageText: 'Image Generation',
      };
      break;
    case 'OOBABOOGA':
      activity = {
        ...activity,
        state: discordRP.RunningWebUI.WebUIName ? `💬️ Chatting with AI with: ${runningWebUi} WebUI . . .` : '💬️ Chatting with AI . . .',
        startTimestamp: discordRP.RunningWebUI.TimeElapsed ? StartWebUiTimestamp : undefined,
        smallImageKey: 'textgeneration_icon',
        smallImageText: 'Text Generation',
      };
      break;
    case 'RSXDALV':
      activity = {
        ...activity,
        state: discordRP.RunningWebUI.WebUIName ? `🔉️ Generating audio with: ${runningWebUi} WebUI . . .` : '🔉️ Generating audio . . .',
        startTimestamp: discordRP.RunningWebUI.TimeElapsed ? StartWebUiTimestamp : undefined,
        smallImageKey: 'audiogeneration_icon',
        smallImageText: 'Audio Generation',
      };
      break;
    default:
      break;
  }
  if (!intervalRepeatActivity) {
    DRPCSetActivity();
    DRPCUpdateActivityLoop();
  }
}

export function DRPCUpdateDiscordRP() {
  discordRP = GetDiscordRPConfig();

  ResetToDefaultActivity();

  if (isReadyToActivity) {
    if (!discordRP.AIOneLynx.Enabled) {
      DRPCClearActivity();
    } else if (!intervalRepeatActivity) {
      DRPCUpdateActivityLoop();
    }
  }
}

// Call this function when the app is ready.
export function DRPCStartUp() {
  DRPCInit();

  DRPCUpdateDiscordRP();

  if (discordRP.AIOneLynx.Enabled) {
    DRPCSetActivity();
    DRPCUpdateActivityLoop();
  }
}
