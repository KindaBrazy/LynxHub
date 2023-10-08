/** @type {import('tailwindcss').Config } */
export default {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,ejs}'],
  theme: {
    extend: {
      colors: {
        LynxRaisinBlack: '#212121',
        LynxWhiteSecond: '#f6f6f6',
        LynxWhiteThird: '#ececec',
        LynxWhiteFourth: '#e1e1e1',
        LynxWhiteFifth: '#d0d0d0',
        LynxBlue: '#4942E4',
        LynxPurple: '#9400FF',
      },
      boxShadow: {
        SideBar: '0px 0px 7px 0px rgba(0,0,0,0.2)',
        Card: '0px 10px 15px -3px rgba(0,0,0,0.2)',
        TopShadow: '0px -10px 18px -3px rgba(0,0,0,0.2',
      },
    },
    fontFamily: {
      Lato: ['Lato', 'sans-serif'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
