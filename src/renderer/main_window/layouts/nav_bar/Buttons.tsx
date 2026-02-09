import {extensionsData} from '@lynx/plugins/extensions/loader';
import {hasCardsByPath} from '@lynx/plugins/modules';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {NavItem} from '@lynx/types';
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
import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import NavigationDock from './Dock';

export const ContentsNav = () => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const contentItems: NavItem[] = useMemo(() => {
    const result: NavItem[] = [
      {icon: <HomePage_Icon className="size-full" />, title: PageTitles.home, path: PageID.home},
    ];

    if (hasCardsByPath(PageID.imageGen) || hasCardsByPath('/imageGenerationPage')) {
      result.push({
        icon: <ImagePage_Icon className="size-full" />,
        title: PageTitles.imageGen,
        path: PageID.imageGen,
      });
    }

    if (hasCardsByPath(PageID.textGen) || hasCardsByPath('/textGenerationPage')) {
      result.push({
        icon: <TextPage_Icon className="size-full scale-110" />,
        title: PageTitles.textGen,
        path: PageID.textGen,
      });
    }

    if (hasCardsByPath(PageID.audioGen) || hasCardsByPath('/audioGenerationPage')) {
      result.push({
        icon: <AudioPage_Icon className="size-full" />,
        title: PageTitles.audioGen,
        path: PageID.audioGen,
      });
    }

    if (hasCardsByPath(PageID.agents)) {
      result.push({
        icon: <AgentPage_Icon className="size-full" />,
        title: PageTitles.agents,
        path: PageID.agents,
      });
    }

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        icon: <ToolsPage_Icon className="size-full" />,
        title: PageTitles.tools,
        path: PageID.tools,
      });
    }

    if (hasCardsByPath(PageID.others)) {
      result.push({
        icon: <OthersPage_Icon className="size-full" />,
        title: PageTitles.others,
        path: PageID.others,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
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
      <NavigationDock items={contentItems} />
      {!isEmpty(contentBar) && contentBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
};

export function SettingsNav() {
  const settingsBar = useMemo(() => extensionsData.navBar.addButton.settingsBar, []);

  const syncList = usePluginsState('syncList');
  const appUpdateAvailable = useSettingsState('updateAvailable');

  const settingsItems: NavItem[] = useMemo(() => {
    const dashboardBadge = appUpdateAvailable;
    const pluginsBadge = !isEmpty(syncList) ? syncList.length : false;

    return [
      {
        icon: <DashboardPage_Icon className="size-full" />,
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
  }, [syncList, appUpdateAvailable]);

  return (
    <>
      <NavigationDock items={settingsItems} />
      {!isEmpty(settingsBar) && settingsBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
}
