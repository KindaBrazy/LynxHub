import {isEmpty} from 'lodash';
import {ReactNode, useMemo} from 'react';

import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon, Info_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {TextGeneration_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {PageID} from '../../Utils/Constants';
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
  const moduleUpdateAvailable = useSettingsState('moduleUpdateAvailable');
  const extensionsUpdateAvailable = useSettingsState('extensionsUpdateAvailable');
  const appUpdateAvailable = useSettingsState('updateAvailable');

  return Pages.map(page => {
    const {navButton, path} = page;
    const {icon, title} = navButton;

    const moduleBadge = navButton.title === 'Modules' && !isEmpty(moduleUpdateAvailable);
    const extensionBadge = navButton.title === 'Extensions' && !isEmpty(extensionsUpdateAvailable);
    const dashboardBadge = navButton.title === 'Dashboard' && appUpdateAvailable;

    return (
      <NavButton
        title={title}
        pageId={path}
        key={`navBtn-${path}`}
        badge={moduleBadge || dashboardBadge || extensionBadge}>
        {icon}
      </NavButton>
    );
  });
};

export const ContentPagesButtons = () => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const pagesData: PagesType[] = useMemo(() => {
    const result: PagesType[] = [
      {navButton: {icon: <Home_Icon className="size-full" />, title: 'Home'}, path: PageID.homePageID},
      {
        navButton: {icon: <ImageGeneration_Icon className="size-full" />, title: 'Image Generation'},
        path: PageID.imageGenPageID,
      },
      {
        navButton: {icon: <TextGeneration_Icon className="size-full" />, title: 'Text Generation'},
        path: PageID.textGenPageID,
      },
      {
        navButton: {icon: <AudioGeneration_Icon className="size-full" />, title: 'Audio Generation'},
        path: PageID.audioGenPageID,
      },
    ];

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        navButton: {
          icon: <Rocket_Icon className="size-full" />,
          title: 'Tools',
        },
        path: PageID.toolsPageID,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
      result.push({
        navButton: {
          icon: <GamePad_Icon className="size-full" />,
          title: 'Games',
        },
        path: PageID.gamesPageID,
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
  {navButton: {icon: <Info_Icon className="size-full" />, title: 'Dashboard'}, path: PageID.dashboardPageID},
  {navButton: {icon: <Extensions2_Icon className="size-full" />, title: 'Modules'}, path: PageID.modulesPageID},
  {navButton: {icon: <Extensions_Icon className="size-full" />, title: 'Extensions'}, path: PageID.extensionsPageID},
  {navButton: {icon: <Slider_Icon className="size-full" />, title: 'Settings'}, path: PageID.settingsPageID},
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
