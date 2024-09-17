import {getIconByName, IconNameType} from '../../../assets/icons/SvgIconsContainer';
import {useSettingsState} from '../../Redux/App/SettingsReducer';
import {audioGenRoutePath} from '../Pages/ContentPages/AudioGenerationPage';
import {homeRoutePath} from '../Pages/ContentPages/Home/HomePage';
import {imageGenRoutePath} from '../Pages/ContentPages/ImageGenerationPage';
import {textGenRoutePath} from '../Pages/ContentPages/TextGenerationPage';
import {dashboardRoutePath} from '../Pages/SettingsPages/Dashboard/DashboardPage';
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

const ContentPages: PagesType[] = [
  {navButton: {icon: 'Home', title: 'Home'}, path: homeRoutePath},
  {navButton: {icon: 'ImageGeneration', title: 'Image Generation'}, path: imageGenRoutePath},
  {navButton: {icon: 'TextGeneration', title: 'Text Generation'}, path: textGenRoutePath},
  {navButton: {icon: 'AudioGeneration', title: 'Audio Generation'}, path: audioGenRoutePath},
];

const SettingsPages: PagesType[] = [
  {navButton: {icon: 'Extensions2', title: 'Modules'}, path: modulesRoutePath},
  {navButton: {icon: 'Settings', title: 'Settings'}, path: settingsRoutePath},
  {navButton: {icon: 'Dashboard', title: 'Dashboard'}, path: dashboardRoutePath},
];

const GetPages = ({Pages}: {Pages: PagesType[]}) => {
  const moduleUpdateAvailable = useSettingsState('moduleUpdateAvailable');
  const appUpdateAvailable = useSettingsState('updateAvailable');

  return Pages.map(page => {
    const {navButton, path} = page;
    const {icon, title} = navButton;

    const moduleBadge = navButton.title === 'Modules' && moduleUpdateAvailable;
    const dashboardBadge = navButton.title === 'Dashboard' && appUpdateAvailable;

    return (
      <NavButton title={title} pageId={path} key={`navBtn-${path}`} badge={moduleBadge || dashboardBadge}>
        {getIconByName(icon, {className: 'size-full'})}
      </NavButton>
    );
  });
};

export function ContentPagesButtons() {
  return <GetPages Pages={ContentPages} />;
}

export function SettingsPagesButtons() {
  return <GetPages Pages={SettingsPages} />;
}
