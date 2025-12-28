// Card Repository information type

import {
  AvailablePageIDs,
  BINARIES_FOLDER_NAME,
  PLUGINS_FOLDER_NAME,
  REPOSITORIES_FOLDER_NAME,
  STATICS_FOLDER_NAME,
} from './CrossConstants';

export type RepositoryInfo = {
  currentBranch: string;
  availableBranches: string[];
  remoteUrl: string;
  isShallow: boolean;
  lastCommitHash: string;
  lastCommitMessage: string;
  lastCommitTime: string;
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

export type UpdateDownloadProgress = {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
};

export type ModulesInfo = {
  id: string;

  title: string;

  publishDate: string;

  version: string;

  updateDate: string;

  changeLog: string;
  changes: Changelogs[];

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

export type ChangelogItem = {
  label: string;
  subitems?: ChangelogItem[];
};

export type Changelogs = {
  title: string;
  items: ChangelogItem[];
};

export type ExtensionsInfo = {
  id: string;

  title: string;

  publishDate: string;

  version: string;

  updateDate: string;

  changeLog: Changelogs[];

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
  earlyAccess: {
    version: string;
    build: number;
    releaseDate: string;
  };
};

export type AppUpdateData = AppUpdateInfo & {
  changeLog: {build: number; version: string; changes: Changelogs[]}[];
};
export type AppUpdateInsiderData = Omit<AppUpdateData, 'earlyAccess'>;

export type FolderNames =
  | typeof PLUGINS_FOLDER_NAME
  | typeof BINARIES_FOLDER_NAME
  | typeof REPOSITORIES_FOLDER_NAME
  | typeof STATICS_FOLDER_NAME;

export type PatreonUserData = {
  tier: string;
  name: string;
  imageUrl: string;
  subscribeStage: SubscribeStages;
};

export type FolderListData = {type: 'folder' | 'file'; name: string};

export type TabInfo = {
  id: string;
  isLoading: boolean;
  title: string;
  isTerminal: boolean;
  pageID: string;
  favIcon: {show: boolean; url: string};
  // Terminal progress state (ConEmu OSC 9;4 sequence)
  progress?: {state: 0 | 1 | 2 | 3 | 4; value: number};
};

export type Notification_Data = {
  id: string;
  title: string;
  titleColor?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger';
  description: {text: string; color?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger'}[];
  buttons?: {
    title: string;
    destination: AvailablePageIDs | string;
    color?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger';
  }[];
  icon?: string;
};

export type PatreonSupporterTier = 'Platinum Sponsor' | 'Diamond Sponsor';

export type PatreonSupporter = {
  name: string;
  tier: PatreonSupporterTier;
  imageUrl: string;
  memberSince: string;
  homePage: string;
};

type CustomBtn = {
  id: string;
  label: string;
  color: 'success' | 'danger' | 'warning' | 'default';
  cursor?: 'default' | 'pointer';
};

export type ToastWindow_MessageType = {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title: string;
  buttons?: ('close' | 'exit' | 'restart')[];
  customButtons?: CustomBtn[];
};

export type CustomNotificationInfo = {
  key: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  description: string;
  buttons?: CustomBtn[];
  closeBtn?: boolean;
};

export type CardState = {
  title: string;
  id: string;
  description: string;
  repoUrl: string;
  extensionsDir?: string;
  haveArguments: boolean;
  type: 'image' | 'audio' | 'text' | 'unknown';

  installed: boolean;
  menuIsOpen: boolean;

  checkingForUpdate: boolean;

  setMenuIsOpen: (isOpen: boolean) => void;
  setCheckingForUpdate: (isChecking: boolean) => void;
};

export type SubscribeStages = 'insider' | 'early_access' | 'public';
export type SearchQuerySites = 'Google' | 'DuckDuckGo' | 'Reddit' | 'ChatGPT' | 'Perplexity' | 'Claude';

export type ContextResizeData = {width: number; height: number; dpr: number};

export type StorageUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'b' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
