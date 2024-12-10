import {isEmpty} from 'lodash';
import {ReactNode, useMemo} from 'react';

import {AudioGeneration_Icon, Extensions_Icon, Extensions2_Icon} from '../../../assets/icons/SvgIcons/SvgIcons1';
import {Home_Icon, ImageGeneration_Icon} from '../../../assets/icons/SvgIcons/SvgIcons2';
import {TextGeneration_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {Dashboard_Icon, Slider_Icon} from '../../../assets/icons/SvgIcons/SvgIcons4';
import {GamePad_Icon, Rocket_Icon} from '../../../assets/icons/SvgIcons/SvgIcons5';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useSettingsState} from '../../Redux/App/SettingsReducer';
import {audioGenRoutePath} from '../Pages/ContentPages/AudioGenerationPage';
import {gamesRoutePath} from '../Pages/ContentPages/GamesPage';
import {homeRoutePath} from '../Pages/ContentPages/Home/HomePage';
import {imageGenRoutePath} from '../Pages/ContentPages/ImageGenerationPage';
import {textGenRoutePath} from '../Pages/ContentPages/TextGenerationPage';
import {toolsRoutePath} from '../Pages/ContentPages/ToolsPage';
import {dashboardRoutePath} from '../Pages/SettingsPages/Dashboard/DashboardPage';
import {extensionsRoutePath} from '../Pages/SettingsPages/Extensions/ExtensionsPage';
import {modulesRoutePath} from '../Pages/SettingsPages/Modules/ModulesPage';
import {settingsRoutePath} from '../Pages/SettingsPages/Settings/SettingsPage';
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

    const moduleBadge = navButton.title === 'Modules' && moduleUpdateAvailable;
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
      {navButton: {icon: <Home_Icon className="size-full" />, title: 'Home'}, path: homeRoutePath},
      {
        navButton: {icon: <ImageGeneration_Icon className="size-full" />, title: 'Image Generation'},
        path: imageGenRoutePath,
      },
      {
        navButton: {icon: <TextGeneration_Icon className="size-full" />, title: 'Text Generation'},
        path: textGenRoutePath,
      },
      {
        navButton: {icon: <AudioGeneration_Icon className="size-full" />, title: 'Audio Generation'},
        path: audioGenRoutePath,
      },
    ];

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        navButton: {
          icon: <Rocket_Icon className="size-full" />,
          title: 'Tools',
        },
        path: toolsRoutePath,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
      result.push({
        navButton: {
          icon: <GamePad_Icon className="size-full" />,
          title: 'Games',
        },
        path: gamesRoutePath,
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
  {navButton: {icon: <Dashboard_Icon className="size-full" />, title: 'Dashboard'}, path: dashboardRoutePath},
  {navButton: {icon: <Extensions2_Icon className="size-full" />, title: 'Modules'}, path: modulesRoutePath},
  {navButton: {icon: <Extensions_Icon className="size-full" />, title: 'Extensions'}, path: extensionsRoutePath},
  {navButton: {icon: <Slider_Icon className="size-full" />, title: 'Settings'}, path: settingsRoutePath},
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
