import {TRANSITION_EASINGS} from '@heroui/framer-utils';
import {SimpleGitProgressEvent} from 'simple-git';

import {TabInfo} from '../../../../cross/CrossTypes';

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
