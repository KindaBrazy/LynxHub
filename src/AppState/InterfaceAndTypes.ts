// Enum for frontend element types of arguments and command lines

export enum SettingComponentType {
  ChooseDirectory = 'ChooseDirectory',
  ChooseFile = 'ChooseFile',
  InputBox = 'InputBox',
  DropDown = 'DropDown',
  CheckBox = 'CheckBox',
}

/* --------------------------------------- Stable Diffusion Arguments ---------------------------------- */

// Interface for each environment and command line arguments (like name, type, default value ...)
export interface SDArgSetting {
  Name: string;
  // Type of setting e.g. input, checkbox etc
  Type: SettingComponentType;
  Default: any;
  Description: string;
  // Only for DropDown type
  Values?: Record<string, string>;
}

// Type for SD batch file
export type SDLaunchConfig = {
  env: {
    id: string;
    value: string;
  }[];
  cl: {
    id: string;
    value: string;
  }[];
};

/* --------------------------------------- Stable Diffusion Arguments ---------------------------------- */
export interface TGArgSetting {
  Name: string;
  // Type of setting e.g. input, checkbox etc
  Type: SettingComponentType;
  Description: string;
  // Only for DropDown type
  Values?: Record<string, string>;
}

// Type for TG batch file
export type TGLaunchConfig = {
  flags: {
    id: string;
    value: string;
  }[];
};

/* --------------------------------------- WebUi ---------------------------------- */
type SdConfig = {
  [key: string]: any;

  installed: boolean;
  name: string;
  localDir: string;
  batchFileName: string;
  selectedLaunchSettings: string;
};
type TgConfig = {
  [key: string]: any;

  installed: boolean;
  name: string;
  localDir: string;
  batchFileName: string;
  flagsFileName: string;
  selectedLaunchSettings: string;
};
type TTSConfig = {
  [key: string]: any;

  installed: boolean;
  name: string;
  localDir: string;
  batchFileName: string;
};
// Available WebUi
export type WebUiRepos = {
  [key: string]: SdConfig | TgConfig | TTSConfig;

  AUTOMATIC1111: SdConfig;
  LSHQQYTIGER: SdConfig;
  COMFYANONYMOUS: TTSConfig;
  OOBABOOGA: TgConfig;
  RSXDALV: TTSConfig;
};
/* --------------------------------------- AIOne Lynx ---------------------------------- */

export type DiscordRP = {
  AIOneLynx: {
    Enabled: boolean;
    TimeElapsed: boolean;
  };
  RunningWebUI: {
    Enabled: boolean;
    TimeElapsed: boolean;
    WebUIName: boolean;
  };
};

// Interface for the config json file
export interface AppConfig {
  [key: string]: any;

  ConfigVersion: number;
  Theme: string;
  TaskbarStatus: 'taskbarAndTray' | 'justTaskbar' | 'justTray' | 'trayWhenMinimized';
  LastWindowSize: {width: number; height: number};
  WindowSize: 'lastSize' | 'default';
  LastPage: number;
  StartPage: 'last' | 'image' | 'text' | 'audio';
  DiscordRP: DiscordRP;
  WebUi: WebUiRepos;
}
