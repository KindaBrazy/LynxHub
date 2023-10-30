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

// Available WebUi
export type WebUiRepos = {
  [key: string]: SdConfig | TgConfig;

  AUTOMATIC1111: SdConfig;
  LSHQQYTIGER: SdConfig;
  OOBABOOGA: TgConfig;
};
/* --------------------------------------- AIOne Lynx ---------------------------------- */

// Interface for the config json file
export interface AppConfig {
  [key: string]: any;

  ConfigVersion: number;
  Theme: string;
  WebUi: WebUiRepos;
}
