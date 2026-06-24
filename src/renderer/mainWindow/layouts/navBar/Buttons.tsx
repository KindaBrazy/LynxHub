import {Avatar} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {hasCardsByPath} from '@lynx/plugins/modules';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {useUserState} from '@lynx/redux/reducers/user';
import {
  AgentPage_Icon,
  AudioPage_Icon,
  DashboardPage_Icon,
  GamePage_Icon,
  HomePage_Icon,
  ImagePage_Icon,
  OthersPage_Icon,
  PluginPage_Icon,
  SettingPage_Icon,
  TextPage_Icon,
  ToolsPage_Icon,
} from '@lynx_assets/icons/pages';
import {PageID, PageTitles} from '@lynx_common/consts';
import {getCacheUrl, getFallbackString} from '@lynx_common/utils';
import {isEmpty} from 'lodash-es';
import {useMemo} from 'react';

import NavigationDock, {NavItem} from './Dock';

type Props = {tabID: string; pageID: string};

/**
 * Navigation component for the main content pages (Home, Image Gen, Text Gen, etc.).
 * Dynamically renders items based on available modules and extensions.
 */
export const ContentsNav = ({tabID, pageID}: Props) => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const contentItems: NavItem[] = useMemo(() => {
    const result: NavItem[] = [
      {icon: <HomePage_Icon className="size-full" />, title: PageTitles.home, path: PageID.home},
    ];

    if (hasCardsByPath(PageID.imageGen) || !isEmpty(extensionsData.customizePages.image.add.cardsContainer)) {
      result.push({
        icon: <ImagePage_Icon className="size-full" />,
        title: PageTitles.imageGen,
        path: PageID.imageGen,
      });
    }

    if (hasCardsByPath(PageID.textGen) || !isEmpty(extensionsData.customizePages.text.add.cardsContainer)) {
      result.push({
        icon: <TextPage_Icon className="size-full scale-110" />,
        title: PageTitles.textGen,
        path: PageID.textGen,
      });
    }

    if (hasCardsByPath(PageID.audioGen) || !isEmpty(extensionsData.customizePages.audio.add.cardsContainer)) {
      result.push({
        icon: <AudioPage_Icon className="size-full" />,
        title: PageTitles.audioGen,
        path: PageID.audioGen,
      });
    }

    if (hasCardsByPath(PageID.agents) || !isEmpty(extensionsData.customizePages.agents.add.cardsContainer)) {
      result.push({
        icon: <AgentPage_Icon className="size-full" />,
        title: PageTitles.agents,
        path: PageID.agents,
      });
    }

    if (hasCardsByPath(PageID.tools) || !isEmpty(extensionsData.customizePages.tools.add.cardsContainer)) {
      result.push({
        icon: <ToolsPage_Icon className="size-full" />,
        title: PageTitles.tools,
        path: PageID.tools,
      });
    }

    if (hasCardsByPath(PageID.others) || !isEmpty(extensionsData.customizePages.others.add.cardsContainer)) {
      result.push({
        icon: <OthersPage_Icon className="size-full" />,
        title: PageTitles.others,
        path: PageID.others,
      });
    }

    if (hasCardsByPath(PageID.games) || !isEmpty(extensionsData.customizePages.games.add.cardsContainer)) {
      result.push({
        icon: <GamePage_Icon className="size-full" />,
        title: PageTitles.games,
        path: PageID.games,
      });
    }

    return result;
  }, []);

  return (
    <>
      <NavigationDock key={tabID} tabId={tabID} pageID={pageID} items={contentItems} />
      {!isEmpty(contentBar) && contentBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
};

/**
 * Navigation component for settings and system pages (Dashboard, Plugins, Settings).
 * Displays badges for updates and sync status.
 */
export function SettingsNav({tabID, pageID}: Props) {
  const settingsBar = useMemo(() => extensionsData.navBar.addButton.settingsBar, []);

  const syncList = usePluginsState('syncList');
  const appUpdateAvailable = useSettingsState('updateAvailable');
  const isLoggedIn = useUserState('isLoggedIn');
  const userData = useUserState('userData');

  const settingsItems: NavItem[] = useMemo(() => {
    const dashboardBadge = appUpdateAvailable;
    const pluginsBadge = !isEmpty(syncList) ? syncList.length : false;

    const dashboardIcon = isLoggedIn ? (
      <Avatar className="size-full">
        <Avatar.Image src={getCacheUrl(userData.imageUrl)} />
        <Avatar.Fallback>{getFallbackString(userData.name)}</Avatar.Fallback>
      </Avatar>
    ) : (
      <DashboardPage_Icon className="size-full" />
    );

    return [
      {
        icon: dashboardIcon,
        title: PageTitles.dashboard,
        path: PageID.dashboard,
        badge: dashboardBadge,
      },
      {
        icon: <PluginPage_Icon className="size-full" />,
        title: PageTitles.plugins,
        path: PageID.plugins,
        badge: pluginsBadge,
      },
      {icon: <SettingPage_Icon className="size-full" />, title: PageTitles.settings, path: PageID.settings},
    ];
  }, [syncList, appUpdateAvailable, isLoggedIn, userData]);

  return (
    <>
      <NavigationDock key={tabID} tabId={tabID} pageID={pageID} items={settingsItems} />
      {!isEmpty(settingsBar) && settingsBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
}
