import {TRANSITION_EASINGS} from '@heroui/framer-utils';
import {SimpleGitProgressEvent} from 'simple-git';

import {TabInfo} from '../../../../cross/CrossTypes';
import AudioGenerationPage from '../Components/Pages/ContentPages/AudioGenerationPage';
import GamesPage from '../Components/Pages/ContentPages/GamesPage';
import HomePage from '../Components/Pages/ContentPages/Home/HomePage';
import ImageGenerationPage from '../Components/Pages/ContentPages/ImageGenerationPage';
import TextGenerationPage from '../Components/Pages/ContentPages/TextGenerationPage';
import ToolsPage from '../Components/Pages/ContentPages/ToolsPage';
import DashboardPage from '../Components/Pages/SettingsPages/Dashboard/DashboardPage';
import ExtensionsPage from '../Components/Pages/SettingsPages/Extensions/ExtensionsPage';
import ModulesPage from '../Components/Pages/SettingsPages/Modules/ModulesPage';
import SettingsPage from '../Components/Pages/SettingsPages/Settings/SettingsPage';

export const PageID = {
  homePageID: 'homePage',
  imageGenPageID: 'imageGen',
  audioGenPageID: 'audioGen',
  gamesPageID: 'gamesPage',
  textGenPageID: 'textGen',
  toolsPageID: 'toolsPage',
  dashboardPageID: 'dashboardPage',
  extensionsPageID: 'extensionPage',
  modulesPageID: 'modulesPage',
  settingsPageID: 'settingsPage',
};

export const PageComponents = {
  [PageID.homePageID]: HomePage,
  [PageID.imageGenPageID]: ImageGenerationPage,
  [PageID.textGenPageID]: TextGenerationPage,
  [PageID.audioGenPageID]: AudioGenerationPage,
  [PageID.toolsPageID]: ToolsPage,
  [PageID.gamesPageID]: GamesPage,
  [PageID.dashboardPageID]: DashboardPage,
  [PageID.modulesPageID]: ModulesPage,
  [PageID.extensionsPageID]: ExtensionsPage,
  [PageID.settingsPageID]: SettingsPage,
};

const colors = {
  black: `rgba(0, 0, 0, 1)`,
  danger: `rgba(220, 38, 38, 1)`,
  success: `rgba(23, 201, 100, 1)`,

  primary: `rgba(73, 66, 228, 1)`,
  raisinBlack: `rgba(33, 33, 33, 1)`,
  secondary: `rgba(148, 0, 255, 1)`,
  secondaryWhite: `rgba(216, 0, 255, 1)`,
  transparent: `rgba(0, 0, 0, 0)`,

  white: `rgba(255, 255, 255, 1)`,
  whiteFifth: `rgba(208, 208, 208, 1)`,

  whiteFourth: `rgba(225, 225, 225, 1)`,
  whiteSecond: `rgba(246, 246, 246, 1)`,
  whiteThird: `rgba(236, 236, 236, 1)`,
};

/** Get a color with a custom opacity
 * @param colorName The name of the color
 * @param opacity The opacity value between 0 and 1
 * @returns A color string in rgba format
 */
export const getColor = (colorName: keyof typeof colors, opacity: number = 1) => {
  if (colorName === 'transparent') return colors['transparent'];
  const colorValue = colors[colorName].slice(0, -2);
  return `${colorValue}${opacity})`;
};

export const initGitProgress: SimpleGitProgressEvent = {
  method: '',
  processed: 0,
  progress: 0,
  stage: 'Unknown',
  total: 0,
};

export const modalMotionProps = {
  variants: {
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: {
          duration: 0.4,
          ease: TRANSITION_EASINGS.ease,
        },
        scale: {
          duration: 0.4,
          ease: TRANSITION_EASINGS.ease,
        },
        y: {
          bounce: 0,
          duration: 0.6,
          type: 'spring',
        },
      },
      y: 'var(--slide-enter)',
    },
    exit: {
      opacity: 0,
      scale: 1.1, // HeroUI default 1.03
      transition: {
        duration: 0.3,
        ease: TRANSITION_EASINGS.ease,
      },
      y: 'var(--slide-exit)',
    },
  },
};

export const defaultTabItem: TabInfo = {
  id: 'tab',
  title: 'Home',
  isTerminal: false,
  pageID: PageID.homePageID,
};
