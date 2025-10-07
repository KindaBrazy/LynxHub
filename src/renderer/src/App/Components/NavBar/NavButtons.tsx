import {isEmpty} from 'lodash';
import {ReactNode, useMemo} from 'react';

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
import NavButton from './NavButton';

type PagesType = {
  path: string;
  navButton: {
    title: string;
    icon: ReactNode;
    badge?: boolean;
  };
};

const GetPages = ({Pages}: {Pages: PagesType[]}) => {
  const syncList = usePluginsState('syncList');
  const appUpdateAvailable = useSettingsState('updateAvailable');

  return Pages.map(page => {
    const {navButton, path} = page;
    const {icon, title} = navButton;

    const dashboardBadge = navButton.title === 'Dashboard' && appUpdateAvailable;
    const pluginsBadge = navButton.title === 'Plugins' && !isEmpty(syncList) ? syncList.length : false;

    return (
      <NavButton title={title} pageId={path} key={`navBtn-${path}`} badge={dashboardBadge || pluginsBadge}>
        {icon}
      </NavButton>
    );
  });
};

export const ContentPagesButtons = () => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const pagesData: PagesType[] = useMemo(() => {
    const result: PagesType[] = [
      {navButton: {icon: <Home_Icon className="size-full" />, title: PageTitles.home}, path: PageID.home},
    ];

    if (hasCardsByPath(PageID.imageGen) || hasCardsByPath('/imageGenerationPage')) {
      result.push({
        navButton: {icon: <ImageGeneration_Icon className="size-full" />, title: PageTitles.imageGen},
        path: PageID.imageGen,
      });
    }

    if (hasCardsByPath(PageID.textGen) || hasCardsByPath('/textGenerationPage')) {
      result.push({
        navButton: {icon: <TextGeneration_Icon className="size-full" />, title: PageTitles.textGen},
        path: PageID.textGen,
      });
    }

    if (hasCardsByPath(PageID.audioGen) || hasCardsByPath('/audioGenerationPage')) {
      result.push({
        navButton: {icon: <AudioGeneration_Icon className="size-full" />, title: PageTitles.audioGen},
        path: PageID.audioGen,
      });
    }

    if (hasCardsByPath(PageID.agents)) {
      result.push({
        navButton: {icon: <Robot_Icon className="size-full" />, title: PageTitles.agents},
        path: PageID.agents,
      });
    }

    if (hasCardsByPath(PageID.others)) {
      result.push({
        navButton: {icon: <MagicStickDuo_Icon className="size-full" />, title: PageTitles.others},
        path: PageID.others,
      });
    }

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        navButton: {
          icon: <Rocket_Icon className="size-full" />,
          title: PageTitles.tools,
        },
        path: PageID.tools,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
      result.push({
        navButton: {
          icon: <GamePad_Icon className="size-full" />,
          title: PageTitles.games,
        },
        path: PageID.games,
      });
    }

    return result;
  }, []);

  return (
    <>
      <GetPages Pages={pagesData} />
      {!isEmpty(contentBar) && contentBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
};

const SettingsPages: PagesType[] = [
  {navButton: {icon: <UserDuo_Icon className="size-full" />, title: PageTitles.dashboard}, path: PageID.dashboard},
  {navButton: {icon: <Plugins_Icon className="size-full" />, title: PageTitles.plugins}, path: PageID.plugins},
  {navButton: {icon: <Tuning_Icon className="size-full" />, title: PageTitles.settings}, path: PageID.settings},
];

export function SettingsPagesButtons() {
  const settingsBar = useMemo(() => extensionsData.navBar.addButton.settingsBar, []);

  return (
    <>
      <GetPages Pages={SettingsPages} />
      {!isEmpty(settingsBar) && settingsBar.map((NavButton, index) => <NavButton key={index} />)}
    </>
  );
}
