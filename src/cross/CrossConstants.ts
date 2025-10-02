import {capitalize} from 'lodash';

import packageJson from '../../package.json';

export const APP_NAME: string = packageJson.appDetails.title;
export const APP_VERSION: string = packageJson.version;
export const APP_BUILD_NUMBER: number = packageJson.appDetails.buildNumber;

export const APP_DESCRIPTION: string = packageJson.description;
export const APP_AUTHOR_NAME: string = packageJson.author.name;
export const APP_DETAILED_DESCRIPTION: string = packageJson.appDetails.detailedDescription;

export const LYNXHUB_HOMEPAGE = packageJson.homepage;
export const RELEASES_PAGE = `${LYNXHUB_HOMEPAGE}/releases`;
export const EARLY_RELEASES_PAGE = 'https://www.patreon.com/collection/714004';
export const INSIDER_RELEASES_PAGE = 'https://www.patreon.com/collection/1557749';

export const EMAIL: string = packageJson.author.email;
export const ISSUE_PAGE: string = `${packageJson.repository.url}/issues`;
export const LICENSE_PAGE: string = `${packageJson.repository.url}/blob/master/LICENSE`;
export const LICENSE_NAME: string = packageJson.license;

export const MODULE_API_VERSION: string = packageJson.appDetails.moduleApiVersion;
export const EXTENSION_API_VERSION: string = packageJson.appDetails.extensionApiVersion;

export const APP_VERSION_V: string = `V${APP_VERSION}`;
export const APP_NAME_VERSION: string = `${APP_NAME} ${APP_VERSION}`;
export const APP_NAME_VERSION_V: string = `${APP_NAME} ${APP_VERSION_V}`;
export const APP_VERSION_FORMAT: string = APP_VERSION_V.split('-')
  .map(v => capitalize(v))
  .join(' ');

export const PLUGINS_FOLDER_NAME = 'Plugins' as const;
export const BINARIES_FOLDER_NAME = 'Binaries' as const;
export const REPOSITORIES_FOLDER_NAME = 'AIWorkspaces' as const;
export const STATICS_FOLDER_NAME = 'Statics' as const;

// Static Assets
export const APP_ICON_TRANSPARENT: string = 'LynxHub.png';

export const MAIN_MODULE_URL: string = 'https://github.com/KindaBrazy/LynxHub-Module-Offline-Container';
export const STATICS_URL: string = 'https://github.com/KindaBrazy/LynxHub-Statics';
export const DISCORD_SERVER: string = 'https://discord.gg/e8rBzhtcnK';
export const X_URL: string = 'https://x.com/LynxHubAI';
export const PATREON_URL: string = 'https://www.patreon.com/LynxHub';
export const GITHUB_URL: string = 'https://github.com/KindaBrazy/LynxHub';
export const REDDIT_URL: string = 'https://www.reddit.com/r/LynxHubAI';
export const YOUTUBE_URL: string = 'https://www.youtube.com/@LynxHubAI';

export const PageID = {
  home: 'home_page',
  imageGen: 'imageGen_page',
  textGen: 'textGen_page',
  audioGen: 'audioGen_page',

  tools: 'tools_page',
  games: 'games_page',
  others: 'others_page',
  agents: 'agents_page',

  dashboard: 'dashboard_page',
  extensions: 'extension_page',
  modules: 'modules_page',
  settings: 'settings_page',
} as const;

export type AvailablePageIDs = (typeof PageID)[keyof typeof PageID];

export const PageTitles = {
  home: 'Home',
  imageGen: 'Image Generation',
  textGen: 'Text Generation',
  audioGen: 'Audio Generation',

  tools: 'Tools',
  games: 'Games',
  others: 'Others',
  agents: 'Agents',

  dashboard: 'Dashboard',
  extensions: 'Extensions',
  modules: 'Modules',
  settings: 'Settings',
};

export const PageTitleByPageId = {
  [PageID.home]: 'Home',
  [PageID.imageGen]: 'Image Generation',
  [PageID.textGen]: 'Text Generation',
  [PageID.audioGen]: 'Audio Generation',

  [PageID.tools]: 'Tools',
  [PageID.games]: 'Games',
  [PageID.others]: 'Others',
  [PageID.agents]: 'Agents',

  [PageID.dashboard]: 'Dashboard',
  [PageID.modules]: 'Extensions',
  [PageID.extensions]: 'Modules',
  [PageID.settings]: 'Settings',
};
