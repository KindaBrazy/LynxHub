import Agents from '@lynx/pages/agents';
import AudioGenerationPage from '@lynx/pages/audio';
import DashboardPage from '@lynx/pages/dashboard';
import GamesPage from '@lynx/pages/games';
import HomePage from '@lynx/pages/home';
import ImageGenerationPage from '@lynx/pages/image';
import OthersPage from '@lynx/pages/others';
import PluginsPage from '@lynx/pages/plugins';
import SettingsPage from '@lynx/pages/settings';
import TextGenerationPage from '@lynx/pages/text';
import ToolsPage from '@lynx/pages/tools';
import {PageID} from '@lynx_common/consts';
import {TabInfo} from '@lynx_common/types';
import type {HTMLMotionProps} from 'framer-motion';
import type {SimpleGitProgressEvent} from 'simple-git';

/**
 * Mapping of internal page IDs to their renderer components.
 */
export const PageComponents = {
  [PageID.home]: HomePage,
  [PageID.imageGen]: ImageGenerationPage,
  [PageID.textGen]: TextGenerationPage,
  [PageID.audioGen]: AudioGenerationPage,

  [PageID.tools]: ToolsPage,
  [PageID.games]: GamesPage,
  [PageID.others]: OthersPage,
  [PageID.agents]: Agents,

  [PageID.dashboard]: DashboardPage,
  [PageID.plugins]: PluginsPage,
  [PageID.settings]: SettingsPage,
};

export const REMOVE_MODAL_DELAY: number = 500;

/**
 * Base palette used by terminal/theme-related helpers.
 */
const colors = {
  black: `rgba(0, 0, 0, 1)`,
  danger: `rgba(220, 38, 38, 1)`,
  success: `rgba(23, 201, 100, 1)`,

  primary: `rgba(73, 66, 228, 1)`,
  nearBlack: `rgba(25, 25, 25, 1)`,
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

/**
 * Shared motion variants used for modal enter/exit transitions.
 */
export const modalMotionProps: Omit<HTMLMotionProps<'section'>, 'ref'> = {
  variants: {
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: {
          duration: 0.4,
          ease: 'easeOut',
        },
        scale: {
          duration: 0.4,
          ease: 'easeOut',
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
        ease: 'easeOut',
      },
      y: 'var(--slide-exit)',
    },
  },
};

/**
 * Default tab descriptor used when creating or resetting tabs.
 */
export const defaultTabItem: TabInfo = {
  id: 'tab',
  title: 'Home',
  isLoading: false,
  isTerminal: false,
  pageID: PageID.home,
  favIcon: {show: false, url: ''},
};
