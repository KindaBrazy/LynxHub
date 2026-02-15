import {HeroToastPlacement} from '@lynx_common/types';
import {LynxHotkey, LynxInput, OnUpdatingExtensions, TooltipStatus} from '@lynx_common/types/ipc';
import StorageTypes, {InstalledCards} from '@lynx_common/types/storage';

import {RunningCard, UpdatingCards} from './index';

export type AppState = {
  darkMode: boolean;
  onFocus: boolean;
  maximized: boolean;
  fullscreen: boolean;
  isOnline: boolean;
  navBar: boolean;
  appTitle: string | undefined;
  toastPlacement: HeroToastPlacement;

  initializer: {
    showWizard: boolean;
    isUpgradeFlow: boolean;
  };
};

export type CardsState = {
  installedCards: InstalledCards;
  autoUpdate: string[];
  autoUpdateExtensions: string[];
  updatingExtensions: OnUpdatingExtensions | undefined;
  checkUpdateInterval: number;

  updatingCards: UpdatingCards;
  updateAvailable: string[];

  pinnedCards: string[];
  recentlyUsedCards: string[];
  runningCard: RunningCard[];
  homeCategory: string[];
  duplicates: {ogID: string; id: string; title: string}[];

  activeTab: string;

  browserDomReadyIds: string[];
};

export type HotkeysState = {
  hotkeys: LynxHotkey[];
  input: LynxInput;

  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isMetaPressed: boolean;
  key: string;
  type: 'keyUp' | 'keyDown' | string;

  copyPressed: boolean;
};

export type SettingState = {
  tooltipLevel: TooltipStatus;

  closeConfirm: boolean;
  closeTabConfirm: boolean;
  terminateAIConfirm: boolean;
  openLastSize: boolean;
  dynamicAppTitle: boolean;
  openLinkExternal: boolean;
  hardwareAcceleration: boolean;
  disableLoadingAnimations: boolean;

  updatedModules: string[];
  newModules: string[];

  updateAvailable: boolean;
  checkCustomUpdate: boolean;

  searchValue: string;
  searchWords: string[];
  selectedSection: string;
};

export type TerminalState = StorageTypes['terminal'];

export type VolumeState = {
  // Per-tab volume levels (0-100)
  tabVolumes: {[tabId: string]: number};

  // Per-tab mute states
  tabMuted: {[tabId: string]: boolean};

  // Per-tab audio playing states
  tabAudioPlaying: {[tabId: string]: boolean};

  // Global mute state
  globalMuted: boolean;
};

export type PreloadState = {
  app: AppState;
  cards: CardsState;
  hotkeys: HotkeysState;
  settings: SettingState;
  terminal: TerminalState;
  volume: VolumeState;
};
