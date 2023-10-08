/* --------------------------------------- Stable Diffusion Arguments ---------------------------------- */

// Enum for frontend element types of arguments and command lines
export enum SDSettingType {
  ChooseDirectory = 'ChooseDirectory',
  ChooseFile = 'ChooseFile',
  InputBox = 'InputBox',
  DropDown = 'DropDown',
  CheckBox = 'CheckBox',
}

// Interface for each environment and command line arguments (like name, type, default value ...)
export interface SDArgSetting {
  Name: string;
  // Type of setting e.g. input, checkbox etc
  Type: SDSettingType;
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
/* --------------------------------------- WebUi ---------------------------------- */
type SdConfig = {
  [key: string]: any;

  installed: boolean;
  name: string;
  localDir: string;
  batchFileName: string;
  selectedLaunchSettings: string;
};

// Available WebUi
export type WebUiRepos = {
  [key: string]: SdConfig;

  AUTOMATIC1111: SdConfig;
  LSHQQYTIGER: SdConfig;
};
/* --------------------------------------- AIOne Lynx ---------------------------------- */

// Interface for the config json file
export interface AppConfig {
  [key: string]: any;

  ConfigVersion: number;
  Theme: string;
  WebUi: WebUiRepos;
}
