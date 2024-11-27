import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import {getIconByName, IconNameType} from '../../../assets/icons/SvgIconsContainer';
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
    icon: IconNameType;
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
        {getIconByName(icon, {className: 'size-full'})}
      </NavButton>
    );
  });
};

export const ContentPagesButtons = () => {
  const contentBar = useMemo(() => extensionsData.navBar.addButton.contentBar, []);

  const pagesData: PagesType[] = useMemo(() => {
    const result: PagesType[] = [
      {navButton: {icon: 'Home', title: 'Home'}, path: homeRoutePath},
      {navButton: {icon: 'ImageGeneration', title: 'Image Generation'}, path: imageGenRoutePath},
      {navButton: {icon: 'TextGeneration', title: 'Text Generation'}, path: textGenRoutePath},
      {navButton: {icon: 'AudioGeneration', title: 'Audio Generation'}, path: audioGenRoutePath},
    ];

    if (!isEmpty(extensionsData.customizePages.tools.addComponent)) {
      result.push({
        navButton: {
          icon: 'Rocket',
          title: 'Tools',
        },
        path: toolsRoutePath,
      });
    }

    if (!isEmpty(extensionsData.customizePages.games.addComponent)) {
      result.push({
        navButton: {
          icon: 'GamePad',
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
  {navButton: {icon: 'Dashboard', title: 'Dashboard'}, path: dashboardRoutePath},
  {navButton: {icon: 'Extensions2', title: 'Modules'}, path: modulesRoutePath},
  {navButton: {icon: 'Extensions', title: 'Extensions'}, path: extensionsRoutePath},
  {navButton: {icon: 'Slider', title: 'Settings'}, path: settingsRoutePath},
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
