// Card Repository information type

import {LynxApiInstalled, LynxApiUpdate} from '../renderer/src/App/Modules/types';
import {
  BINARIES_FOLDER_NAME,
  EXTENSIONS_FOLDER_NAME,
  MODULES_FOLDER_NAME,
  REPOSITORIES_FOLDER_NAME,
} from './CrossConstants';

export type RepoDetails = {
  stars: number;
  forks: number;
  issues?: number;
  size?: number;
};

export type RepositoryInfo = {
  currentBranch: string;
  availableBranches: string[];
  remoteUrl: string;
  isShallow: boolean;
  lastCommitHash: string;
  lastCommitMessage: string;
  lastCommitTime: string;
};

export type DevInfo = {
  name: string;
  picUrl: string;
};

export type OsPlatforms =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd';

export type ChosenArgument = {name: string; value: string};
export type ArgumentsPresets = {preset: string; arguments: ChosenArgument[]};
export type ChosenArgumentsData = {activePreset: string; data: ArgumentsPresets[]};
export type StorageChosenArgumentsData = {cardId: string; activePreset: string; data: ArgumentsPresets[]}[];

export type DiscordRPC = {
  LynxHub: {
    Enabled: boolean;
    TimeElapsed: boolean;
  };
  RunningAI: {
    Enabled: boolean;
    TimeElapsed: boolean;
    AIName: boolean;
  };
};

export type UpdateDownloadProgress = {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
};

/** These methods will be called in the main process */
export type CardMainMethods = {
  /** Return commands based on installed directory to be executed with terminal */
  getRunCommands: (dir?: string) => Promise<string | string[]>;

  /** Read saved argument from file and return data with the array of type ChosenArgument */
  readArgs?: (dir: string) => Promise<ChosenArgument[]>;

  /** Get user configured arguments and save it to desire file */
  saveArgs?: (cardDir: string, args: ChosenArgument[]) => Promise<void>;

  /**
   * Access to the main process IPC methods.
   * Use this to send/receive data or messages between the main process and the renderer process.
   */
  mainIpc?: (ipc: {
    handle(channel: string, listener: (event: any, ...args: any[]) => any): void;
    on(channel: string, listener: (event: any, ...args: any[]) => void): void;
    send: (channel: string, ...args: any[]) => void;
  }) => void;
  updateAvailable?: (lynxApi: LynxApiUpdate) => Promise<boolean>;
  isInstalled?: (lynxApi: LynxApiInstalled) => Promise<boolean>;
};

export type MainModules = {
  /** The ID of the card that using these methods */
  id: string;

  /** These methods will be called in the main process
   * @description This methods will be used when user interaction (Like run, config, etc.)
   */
  methods: CardMainMethods;
};

export type MainModuleImportType = {
  default: MainModules[];
  setCurrentBuild?: (build: number) => void;
};

export type ModulesInfo = {
  id: string;

  title: string;

  publishDate: string;

  version: string;

  updateDate: string;

  changeLog: string;

  description: string;

  requireAppBuild: number;

  /** Repository address to be cloned when user install module */
  repoUrl: string;

  /** Url address to logo picture or relative path to the image file
   * - A relative path will start with './'
   */
  logoUrl?: string;

  /** Is the WebUI or the repository provided by this module owned by you? */
  owner?: boolean;
};

export type Extension_ChangelogItem = {
  label: string;
  subitems?: Extension_ChangelogItem[];
};

export type Extension_Changelogs = {
  title: string;
  items: Extension_ChangelogItem[];
};

export type Extension_ListData = {
  id: string;
  title: string;
  version: string;
  developer: string;
  description: string;
  changeLog: Extension_Changelogs[];
  updateDate: string;
  url: string;
  avatarUrl?: string;
  tag: 'tools' | 'feature' | 'games';
  platforms: OsPlatforms[];
};

export type ExtensionsInfo = {
  id: string;

  title: string;

  publishDate: string;

  version: string;

  updateDate: string;

  changeLog: Extension_Changelogs[];

  description: string;

  /** Repository address to be cloned when user install module */
  repoUrl: string;

  requireAppBuild: number;

  /** Url address to logo picture or relative path to the image file
   * - A relative path will start with './'
   */
  avatarUrl?: string;
  tag: 'tools' | 'feature' | 'games';
  platforms: OsPlatforms[];
};

export type AppUpdateInfo = {
  currentVersion: string;
  currentBuild: number;
  releaseDate: string;
  earlyAccess?: {
    version: string;
    build: number;
    releaseDate: string;
  };
};

export type AppUpdateData = AppUpdateInfo & {
  changeLog: {build: number; version: string; new: string[]; improve: string[]; bug: string[]}[];
};

export type FolderNames =
  | typeof MODULES_FOLDER_NAME
  | typeof EXTENSIONS_FOLDER_NAME
  | typeof BINARIES_FOLDER_NAME
  | typeof REPOSITORIES_FOLDER_NAME;

export type PatreonUserData = {
  tier: string;
  name: string;
  imageUrl: string;
  earlyAccess: boolean;
};

export type FolderListData = {type: 'folder' | 'file'; name: string};
