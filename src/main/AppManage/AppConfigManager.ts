// This module manages the loading and saving of application configuration data
import fs from 'fs';
import {app, nativeTheme} from 'electron';
import path from 'path';
import {MainLogInfo, MainLogWarning} from '../../AppState/AppConstants';
import {AppConfig, DiscordRP} from '../../AppState/InterfaceAndTypes';

// Default config object
const appConfig: AppConfig = {
  ConfigVersion: 0.1,
  Theme: 'system',
  TaskbarStatus: 'justTaskbar',
  LastWindowSize: {width: 1024, height: 768},
  WindowSize: 'lastSize',
  LastPage: 0,
  StartPage: 'last',
  DiscordRP: {AIOneLynx: {Enabled: true, TimeElapsed: true}, RunningWebUI: {Enabled: true, TimeElapsed: true, WebUIName: true}},

  WebUi: {
    AUTOMATIC1111: {
      installed: false,
      name: 'AUTOMATIC1111',
      localDir: '',
      batchFileName: '',
      selectedLaunchSettings: '',
    },
    LSHQQYTIGER: {
      installed: false,
      name: 'LSHQQYTIGER',
      localDir: '',
      batchFileName: '',
      selectedLaunchSettings: '',
    },
    COMFYANONYMOUS: {
      installed: false,
      name: 'COMFYANONYMOUS',
      localDir: '',
      batchFileName: '',
      selectedLaunchSettings: '',
    },
    OOBABOOGA: {
      installed: false,
      name: 'OOBABOOGA',
      localDir: '',
      batchFileName: 'start_windows.bat',
      flagsFileName: 'CMD_FLAGS.txt',
      selectedLaunchSettings: '',
    },
    RSXDALV: {
      installed: false,
      name: 'RSXDALV',
      localDir: '',
      batchFileName: 'start_windows.bat',
    },
  },
};

// Get appConfig object (Current in-memory config data)
export function GetUserConfigData(): AppConfig {
  return appConfig;
}

export function GetDirectoryByName(name: string) {
  switch (name) {
    case 'AUTOMATIC1111':
      return appConfig.WebUi.AUTOMATIC1111?.localDir;
    case 'LSHQQYTIGER':
      return appConfig.WebUi.LSHQQYTIGER?.localDir;
    case 'COMFYANONYMOUS':
      return appConfig.WebUi.COMFYANONYMOUS?.localDir;
    case 'OOBABOOGA':
      return appConfig.WebUi.OOBABOOGA?.localDir;
    case 'RSXDALV':
      return appConfig.WebUi.RSXDALV?.localDir;
    default:
      return undefined;
  }
}

export function GetLaunchSettingsByName(name: string) {
  switch (name) {
    case 'AUTOMATIC1111':
      return appConfig.WebUi.AUTOMATIC1111?.selectedLaunchSettings;
    case 'LSHQQYTIGER':
      return appConfig.WebUi.LSHQQYTIGER?.selectedLaunchSettings;
    case 'OOBABOOGA':
      return appConfig.WebUi.OOBABOOGA?.selectedLaunchSettings;
    default:
      return undefined;
  }
}

export function GetFlagsFileName(): string {
  return appConfig.WebUi.OOBABOOGA?.flagsFileName;
}

export function GetBatchFileByName(name: string): string | undefined {
  switch (name) {
    case 'AUTOMATIC1111':
      return appConfig.WebUi.AUTOMATIC1111?.batchFileName;
    case 'LSHQQYTIGER':
      return appConfig.WebUi.LSHQQYTIGER?.batchFileName;
    case 'COMFYANONYMOUS':
      return appConfig.WebUi.COMFYANONYMOUS?.batchFileName;
    case 'OOBABOOGA':
      return appConfig.WebUi.OOBABOOGA?.batchFileName;
    case 'RSXDALV':
      return appConfig.WebUi.RSXDALV?.batchFileName;
    default:
      return undefined;
  }
}

// Get user data config file path
function GetAppConfigPath(): string {
  return path.join(app.getPath('userData'), 'AiOneLynx.config');
}

// Write appConfig object data to the config file
export function SaveAppConfig(): void {
  fs.writeFileSync(GetAppConfigPath(), JSON.stringify(appConfig));

  console.log(MainLogInfo(`Saved Config File : ${JSON.stringify(appConfig)}`));
}

export function ChangeThemeConfig(theme: 'dark' | 'system' | 'light'): void {
  appConfig.Theme = theme;
  nativeTheme.themeSource = theme;
  SaveAppConfig();
}

export function GetTaskbarConfig(): 'taskbarAndTray' | 'justTaskbar' | 'justTray' | 'trayWhenMinimized' {
  return appConfig.TaskbarStatus;
}

export function ChangeTaskbarConfig(status: 'taskbarAndTray' | 'justTaskbar' | 'justTray' | 'trayWhenMinimized'): void {
  appConfig.TaskbarStatus = status;
  SaveAppConfig();
}

export function GetThemeConfig(): string {
  // @ts-ignore
  nativeTheme.themeSource = appConfig.Theme;
  return appConfig.Theme;
}

export function ChangeWindowSizeConfig(status: 'lastSize' | 'default'): void {
  appConfig.WindowSize = status;
  SaveAppConfig();
}

export function GetWindowSizeConfig(): 'lastSize' | 'default' {
  return appConfig.WindowSize;
}

export function ChangeLastPageConfig(pageId: number): void {
  appConfig.LastPage = pageId;
  SaveAppConfig();
}

export function GetLastPageConfig(): number {
  return appConfig.LastPage;
}

export function ChangeLastWindowSizeConfig(windowSize: {width: number; height: number}): void {
  appConfig.LastWindowSize = windowSize;
  SaveAppConfig();
}

export function GetLastWindowSizeConfig(): {width: number; height: number} {
  return appConfig.LastWindowSize;
}

export function ChangeStartPageConfig(status: 'last' | 'image' | 'text' | 'audio'): void {
  appConfig.StartPage = status;
  SaveAppConfig();
}

export function GetStartPageConfig(): 'last' | 'image' | 'text' | 'audio' {
  return appConfig.StartPage;
}

export function ChangeDiscordRPConfig(status: DiscordRP): void {
  appConfig.DiscordRP = status;
  SaveAppConfig();
}

export function GetDiscordRPConfig(): DiscordRP {
  return appConfig.DiscordRP;
}

// Update config object in-memory and save to file
/**
 * Update app config object in-memory and save to file if requested.
 *
 * @param {Partial<AppConfig>} updates - Partial object with updates to app config
 * @param {boolean} save - Whether to save updates to file, Default is false.
 */
export function UpdateSDAppConfig(updates: Partial<AppConfig>, save: boolean = false): void {
  if (!updates) return;
  // Apply updates to appConfig object
  Object.keys(updates).forEach((key: string): void => {
    if (typeof updates[key] === 'string' || typeof updates[key] === 'number') {
      appConfig[key] = updates[key];
    } else {
      Object.keys(updates[key]).forEach((childKey: string): void => {
        appConfig[key][childKey] = updates[key][childKey];
      });
    }
  });

  // Save to the file if requested.
  if (save) SaveAppConfig();

  console.log(MainLogInfo(`Updated App Config : ${JSON.stringify(appConfig)} \nSaved:${save}`));
}

/* Export function UpdateAppConfig(updates: Partial<AppConfig>, save: boolean = false): void {
  if (!updates) return;
  // Apply updates to appConfig object

  Object.assign(appConfig, updates);

  // Save to the file if requested.
  If (save) SaveAppConfig();

  console.log(MainLogInfo(`Updated App Config: ${JSON.stringify(appConfig)} \nSaved:${save}`));
} */

export function UpdateBatchFileByName(name: string, batchFileName: string, save: boolean = false) {
  console.log(MainLogInfo(`UpdateBatchFileByName-> ${batchFileName}`));
  switch (name) {
    case 'AUTOMATIC1111':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, AUTOMATIC1111: {...appConfig.WebUi.AUTOMATIC1111, batchFileName}}}, save);
      break;
    case 'LSHQQYTIGER':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, LSHQQYTIGER: {...appConfig.WebUi.LSHQQYTIGER, batchFileName}}}, save);
      break;
    case 'OOBABOOGA':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, OOBABOOGA: {...appConfig.WebUi.OOBABOOGA, batchFileName}}}, save);
      break;
    case 'RSXDALV':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, RSXDALV: {...appConfig.WebUi.RSXDALV, batchFileName}}}, save);
      break;
    default:
      break;
  }
}

export function UpdateLaunchSettingByName(name: string, launchSetting: string, save: boolean = false) {
  console.log(MainLogInfo(`UpdateLaunchSettingByName-> ${launchSetting}`));
  switch (name) {
    case 'AUTOMATIC1111':
      UpdateSDAppConfig(
        {
          WebUi: {
            ...appConfig.WebUi,
            AUTOMATIC1111: {...appConfig.WebUi.AUTOMATIC1111, selectedLaunchSettings: launchSetting},
          },
        },
        save,
      );
      break;
    case 'LSHQQYTIGER':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, LSHQQYTIGER: {...appConfig.WebUi.LSHQQYTIGER, selectedLaunchSettings: launchSetting}}}, save);
      break;
    case 'OOBABOOGA':
      UpdateSDAppConfig({WebUi: {...appConfig.WebUi, OOBABOOGA: {...appConfig.WebUi.OOBABOOGA, selectedLaunchSettings: launchSetting}}}, save);
      break;
    default:
      break;
  }
}

// Read config file data and initialize appConfig object. If the config file does not exist, create one
export function LoadAppConfig(): void {
  try {
    // Check if config file exists
    fs.accessSync(GetAppConfigPath(), fs.constants.F_OK);

    // Load data from file
    const loaded: Buffer = fs.readFileSync(GetAppConfigPath());
    const config: AppConfig = JSON.parse(loaded.toString()) as AppConfig;

    console.log(`config object -> ${MainLogWarning(JSON.stringify(config))}`);
    // Update appConfig object data
    UpdateSDAppConfig(config);

    console.log(MainLogInfo(`Loaded Config File : ${JSON.stringify(config)}`));
  } catch (error) {
    console.log(MainLogInfo(`Creating Config File. ${error}`));
    // Write default appConfig object data to the file
    SaveAppConfig();
  }
}

export function ValidateConfig(): void {
  Object.keys(appConfig.WebUi).forEach((value) => {
    if (appConfig.WebUi[value].installed) {
      fs.access(appConfig.WebUi[value].localDir, fs.constants.F_OK, (error) => {
        if (error) {
          appConfig.WebUi[value].installed = false;
          appConfig.WebUi[value].localDir = '';
          appConfig.WebUi[value].selectedLaunchSettings = '';
          appConfig.WebUi[value].batchFileName = '';
          SaveAppConfig();
        }
      });
    }
  });
}
