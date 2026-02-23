import {heroui} from '@heroui/react';

const sharedThemeColors = {
  danger: {
    DEFAULT: '#dc2626',
  },
} as const;

/**
 * Shared HeroUI Tailwind plugin configuration used by child-window renderers.
 */
export default heroui({
  themes: {
    dark: {
      colors: {
        ...sharedThemeColors,
        primary: {
          DEFAULT: '#0050EF',
        },
        secondary: {
          DEFAULT: '#AA00FF',
        },
      },
    },
    light: {
      colors: {
        ...sharedThemeColors,
        primary: {
          DEFAULT: '#00A9FF',
        },
        secondary: {
          DEFAULT: '#d500f9',
        },
      },
    },
  },
});
