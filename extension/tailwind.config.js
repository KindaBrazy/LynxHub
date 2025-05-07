import {heroui} from '@heroui/react';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['extension/src/renderer/**/*.{html,tsx}'],
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            danger: {
              DEFAULT: '#dc2626',
            },
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
            danger: {
              DEFAULT: '#dc2626',
            },
            primary: {
              DEFAULT: '#00A9FF',
            },
            secondary: {
              DEFAULT: '#d500f9',
            },
          },
        },
      },
    }),
    typography(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        GradientDark:
          'linear-gradient(to right top, #212121, #202020, #1f1f1f, #1e1e1e, #1d1d1d, ' +
          '#1c1c1c, #1b1b1b, #1a1a1a, #181818, #161616, #141414, #121212)',
        GradientLight:
          'linear-gradient(to right top, #f3f3f3, #f3f3f3, #f3f3f3, #f3f3f3, #f3f3f3, ' +
          '#f4f4f5, #f4f4f6, #f4f5f8, #f3f7fc, #f0fafe, #eefdfe, #eefffc)',
      },
      colors: {
        LynxOrange: '#FF5F00',
        LynxRaisinBlack: '#212121',

        LynxWhiteSecond: '#f6f6f6',
        LynxWhiteThird: '#ececec',
        LynxWhiteFourth: '#e1e1e1',
        LynxWhiteFifth: '#d0d0d0',

        DarkGray: '#424242',
      },
    },
    fontFamily: {
      JetBrainsMono: ['JetBrainsMono', 'sans-serif'],
      Nunito: ['Nunito', 'sans-serif'],
    },
  },
};
