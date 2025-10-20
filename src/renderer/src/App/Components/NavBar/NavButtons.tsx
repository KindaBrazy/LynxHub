import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import {PageID, PageTitles} from '../../../../../cross/CrossConstants';
import {
  AudioGeneration_Icon,
  GamePad_Icon,
  Home_Icon,
  ImageGeneration_Icon,
  MagicStickDuo_Icon,
  Plugins_Icon,
  Robot_Icon,
  Rocket_Icon,
  TextGeneration_Icon,
  Tuning_Icon,
  UserDuo_Icon,
} from '../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {hasCardsByPath} from '../../Modules/ModuleLoader';
import {usePluginsState} from '../../Redux/Reducer/PluginsReducer';
import {useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {NavItem} from '../../Utils/Types';
import NavigationDock from './NavigationDock';

export const ContentsNav = () => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const contentItems: NavItem[] = useMemo(() => {
    const result: NavItem[] = [{icon: <Home_Icon className="size-full" />, title: PageTitles.home, path: PageID.home}];

    if (hasCardsByPath(PageID.imageGen) || hasCardsByPath('/imageGenerationPage')) {
      result.push({
        icon: <ImageGeneration_Icon className="size-full" />,
        title: PageTitles.imageGen,
        path: PageID.imageGen,
      });
    }

    if (hasCardsByPath(PageID.textGen) || hasCardsByPath('/textGenerationPage')) {
      result.push({
        icon: <TextGeneration_Icon className="size-full" />,
        title: PageTitles.textGen,
        path: PageID.textGen,
      });
    }

    if (hasCardsByPath(PageID.audioGen) || hasCardsByPath('/audioGenerationPage')) {
      result.push({
        icon: <AudioGeneration_Icon className="size-full" />,
        title: PageTitles.audioGen,
        path: PageID.audioGen,
      });
    }

    if (hasCardsByPath(PageID.agents)) {
      result.push({
        icon: <Robot_Icon className="size-full" />,
        title: PageTitles.agents,
        path: PageID.agents,
      });
    }

    if (hasCardsByPath(PageID.others)) {
      result.push({
        icon: <MagicStickDuo_Icon className="size-full" />,
        title: PageTitles.others,
        path: PageID.others,
      });
    }

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        icon: <Rocket_Icon className="size-full" />,
        title: PageTitles.tools,
        path: PageID.tools,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
      result.push({
        icon: <GamePad_Icon className="size-full" />,
        title: PageTitles.games,
        path: PageID.games,
      });
    }

    return result;
  }, []);

  return (
    <>
      <NavigationDock maxItems={5} items={contentItems} />
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
        icon: <UserDuo_Icon className="size-full" />,
        title: PageTitles.dashboard,
        path: PageID.dashboard,
        badge: dashboardBadge,
      },
      {
        icon: <Plugins_Icon className="size-full" />,
        title: PageTitles.plugins,
        path: PageID.plugins,
        badge: pluginsBadge,
      },
      {icon: <Tuning_Icon className="size-full" />, title: PageTitles.settings, path: PageID.settings},
    ];
  }, [syncList, appUpdateAvailable]);

  return (
    <>
      <NavigationDock items={settingsItems} />
      {!isEmpty(settingsBar) && settingsBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
}
