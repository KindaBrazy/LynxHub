import {BINARIES_FOLDER_NAME, MODULES_FOLDER_NAME, REPOSITORIES_FOLDER_NAME} from './CrossConstants';

export type RepoInfoType = {
  totalSize: string;
  extensionsSize: string;
  installDate: string;
  lastUpdate: string;
  releaseTag: string;
};

export type RepoDetails = {
  stars: number;
  forks: number;
  issues: number;
  size: number;
};

export type DevInfo = {
  name: string;
  picUrl: string;
};

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
  getRunCommands: (dir: string) => Promise<string | string[]>;

  /** Read saved argument from file and return data with the array of type ChosenArgument */
  readArgs?: (dir: string) => Promise<ChosenArgument[]>;

  /** Get user configured arguments and save it to desire file */
  saveArgs?: (cardDir: string, args: ChosenArgument[]) => Promise<void>;
};

export type MainModules = {
  /** The ID of the card that using these methods */
  id: string;

  /** These methods will be called in the main process
   * @description This methods will be used when user interaction (Like run, config, etc.)
   */
  methods: CardMainMethods;
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

export type FolderNames = typeof MODULES_FOLDER_NAME | typeof BINARIES_FOLDER_NAME | typeof REPOSITORIES_FOLDER_NAME;

export type PatreonUserData = {
  tier: string;
  name: string;
  imageUrl: string;
  earlyAccess: boolean;
};

export type FolderListData = {type: 'folder' | 'file'; name: string};
