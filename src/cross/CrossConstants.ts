import packageJson from '../../package.json';

export const APP_NAME: string = packageJson.appDetails.title;
export const APP_VERSION: string = packageJson.version;
export const APP_BUILD_NUMBER: number = packageJson.appDetails.buildNumber;

export const APP_DESCRIPTION: string = packageJson.description;
export const APP_DETAILED_DESCRIPTION: string = packageJson.appDetails.detailedDescription;

export const MODULE_CONTAINER: string = packageJson.appDetails.moduleContainer;
export const MAIN_MODULE_URL: string = packageJson.appDetails.mainModule;

export const RELEASES_PAGE = `${packageJson.homepage}/releases`;

export const EMAIL: string = packageJson.author.email;
export const ISSUE_PAGE: string = `${packageJson.repository.url}/issues`;
export const LICENSE_PAGE: string = `${packageJson.repository.url}/blob/master/LICENSE.txt`;
export const LICENSE_NAME: string = packageJson.license;

export const APP_VERSION_V: string = `V${APP_VERSION}`;
export const APP_NAME_VERSION: string = `${APP_NAME} ${APP_VERSION}`;
export const APP_NAME_VERSION_V: string = `${APP_NAME} ${APP_VERSION_V}`;

export const APP_ICON_TRANSPARENT: string = 'AppIcon Transparent.png';
export const MODULES_FOLDER_NAME = 'Modules' as const;
export const BINARIES_FOLDER_NAME = 'Binaries' as const;
export const REPOSITORIES_FOLDER_NAME = 'AIWorkspaces' as const;

export const WIN_RELEASE_URL: string = 'https://raw.githubusercontent.com/KindaBrazy/LynxHub/master/releases_log.json';
export const DISCORD_ID: string = 'kinda.brazy';
export const PATREON_URL: string = 'https://www.patreon.com/LynxHub';
