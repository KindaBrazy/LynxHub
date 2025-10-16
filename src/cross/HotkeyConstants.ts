import {LynxHotkey} from './IpcChannelAndTypes';

export const Hotkey_Names = {
  fullscreen: 'fullscreen',
  toggleNav: 'toggleNav',
  toggleAiView: 'toggleAiView',

  closeTab: 'closeTab',
  newTab: 'newTab',
  newBrowserTab: 'newBrowserTab',
  newTerminalTab: 'newTerminalTab',
  newBrowserTerminalTab: 'newBrowserTerminalTab',
  refreshTab: 'refreshTab',
  switchTab: 'switchTab',
  nextTab: 'nextTab',
  prevTab: 'prevTab',

  findInPage: 'findInPage',
};

export const Hotkey_Titles = {
  fullscreen: 'Fullscreen',
  toggleNav: 'Nav Bar',
  toggleAiView: 'Toggle View',

  closeTab: 'Close Tab',
  newTab: 'New Tab',
  newBrowserTab: 'Browser Tab',
  newTerminalTab: 'Terminal Tab',
  newBrowserTerminalTab: 'Combo Tab',
  refreshTab: 'Refresh Tab',
  switchTab: 'Switch Tab',
  nextTab: 'Next Tab',
  prevTab: 'Prevoius Tab',

  findInPage: 'Find in web page',
};

export const Hotkey_Desc = {
  fullscreen: 'Use this hotkey to switch between fullscreen and windowed modes.',
  toggleNav: 'Use this hotkey to show or hide the navigation panel.',
  toggleAiView: 'Use this hotkey to toggle between terminal and browser views.',

  closeTab: 'Use this hotkey to close the active tab.',
  newTab: 'Use this hotkey to open a new tab.',
  newBrowserTab: 'Use this hotkey to open a new browser tab.',
  newTerminalTab: 'Use this hotkey to open a new terminal tab.',
  newBrowserTerminalTab: 'Use this hotkey to open a combined browser and terminal tab.',
  refreshTab: 'Use this hotkey to reload the current tab.',
  switchTab: 'Use this hotkey to switch between tabs.',
  nextTab: 'Use this hotkey to switch to the next tabs.',
  prevTab: 'Use this hotkey to switch to the previous tabs.',

  findInPage: 'Use this hotkey to search for text within the current web page.',
};

export const Get_Default_Hotkeys = (platform: 'darwin' | 'linux' | 'win32' | string): LynxHotkey[] => {
  return [
    {
      name: Hotkey_Names.fullscreen,
      meta: false,
      alt: false,
      control: false,
      shift: false,
      key: platform === 'darwin' ? 'f12' : 'f11',
    },
    {
      name: Hotkey_Names.toggleNav,
      meta: false,
      alt: true,
      control: false,
      shift: false,
      key: 'a',
    },
    {
      name: Hotkey_Names.toggleAiView,
      meta: false,
      alt: true,
      control: false,
      shift: false,
      key: 'q',
    },

    {
      name: Hotkey_Names.closeTab,
      meta: false,
      alt: false,
      control: true,
      shift: false,
      key: 'w',
    },
    {
      name: Hotkey_Names.refreshTab,
      meta: false,
      alt: false,
      control: false,
      shift: false,
      key: 'f5',
    },
    {
      name: Hotkey_Names.switchTab,
      meta: false,
      alt: false,
      control: true,
      shift: false,
      key: 'tab',
    },
    {
      name: Hotkey_Names.nextTab,
      meta: false,
      alt: true,
      control: false,
      shift: false,
      key: 'arrowright',
    },
    {
      name: Hotkey_Names.prevTab,
      meta: false,
      alt: true,
      control: false,
      shift: false,
      key: 'arrowleft',
    },
    {
      name: Hotkey_Names.newTab,
      meta: false,
      alt: false,
      control: true,
      shift: false,
      key: 't',
    },
    {
      name: Hotkey_Names.newBrowserTab,
      meta: false,
      alt: false,
      control: true,
      shift: true,
      key: 't',
    },
    {
      name: Hotkey_Names.newTerminalTab,
      meta: false,
      alt: true,
      control: true,
      shift: false,
      key: 't',
    },
    {
      name: Hotkey_Names.newBrowserTerminalTab,
      meta: false,
      alt: false,
      control: true,
      shift: false,
      key: 'e',
    },
    {
      name: Hotkey_Names.findInPage,
      meta: false,
      alt: false,
      control: true,
      shift: false,
      key: 'f',
    },
  ];
};
