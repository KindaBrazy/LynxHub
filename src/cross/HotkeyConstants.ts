import {LynxHotkey} from './IpcChannelAndTypes';

export const Hotkey_Names = {
  fullscreen: 'fullscreen',
  toggleNav: 'toggleNav',
  toggleAiView: 'toggleAiView',
};
export const Hotkey_Titles = {
  fullscreen: 'Toggle Fullscreen',
  toggleNav: 'Toggle Navigation Bar',
  toggleAiView: 'Switch AI View',
};
export const Hotkey_Desc = {
  fullscreen: 'Press to switch the app between fullscreen and windowed mode',
  toggleNav: 'Press to show or hide navigation bar',
  toggleAiView: 'Press to switch between terminal and browser views',
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
  ];
};
