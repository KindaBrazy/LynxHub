import {Rectangle} from 'electron';

import {StorageChosenArgumentsData} from './CrossTypes';
import {
  AgentTypes,
  CustomRunBehaviorStore,
  DarkModeTypes,
  FavIcons,
  HomeCategory,
  LynxHotkey,
  StoragePreOpenData,
  TaskbarStatus,
  TerminalCursorInactiveStyle,
  TerminalCursorStyle,
  TerminalUseConpty,
  TooltipStatus,
} from './IpcChannelAndTypes';

export type InstalledCard = {
  id: string;
  dir?: string;
};

export type InstalledCards = InstalledCard[];

type StorageTypes = {
  storage: {
    version: number;
  };
  cards: {
    installedCards: InstalledCards;
    autoUpdateCards: string[];
    autoUpdateExtensions: string[];
    checkUpdateInterval: number;
    pinnedCards: string[];
    recentlyUsedCards: string[];
    zoomFactor: number;
    duplicated: {ogID: string; id: string; title: string}[];
    cardTerminalPreCommands: {id: string; commands: string[]}[];
  };
  cardsConfig: {
    preCommands: {cardId: string; data: string[]}[];
    customRun: {cardId: string; data: string[]}[];
    customRunBehavior: CustomRunBehaviorStore;
    preOpen: StoragePreOpenData;
    args: StorageChosenArgumentsData;
  };
  app: {
    closeConfirm: boolean;
    terminateAIConfirm: boolean;
    closeTabConfirm: boolean;
    openLastSize: boolean;
    dynamicAppTitle: boolean;
    openLinkExternal: boolean;
    hardwareAcceleration: boolean;
    lastSize:
      | {
          maximized: boolean;
          bounds: Rectangle | undefined;
        }
      | undefined;
    homeCategory: HomeCategory;
    darkMode: DarkModeTypes;
    taskbarStatus: TaskbarStatus;
    tooltipStatus: TooltipStatus;
    systemStartup: boolean;
    startMinimized: boolean;
    startMaximized: boolean;
    startupLastActivePage: boolean;
    lastPage: string;
    hotkeys: LynxHotkey[];
    initialized: boolean;
    inited: boolean;
    appDataDir: string;
    disableLoadingAnimations: boolean;
    collectErrors: boolean;
    addBreadcrumbs: boolean;
  };
  terminal: {
    outputColor: boolean;
    useConpty: TerminalUseConpty;
    scrollBack: number;
    fontSize: number;
    cursorStyle: TerminalCursorStyle;
    cursorInactiveStyle: TerminalCursorInactiveStyle;
    blinkCursor: boolean;
    resizeDelay: number;
    closeTabOnExit: boolean;
    enableLigatures: boolean;
    cdHistory: string[];
    quickCommands: {label: string; command: string}[];
  };
  browser: {
    recentAddress: string[];
    favoriteAddress: string[];
    historyAddress: string[];
    favIcons: FavIcons[];
    userAgent: AgentTypes;
    customUserAgent: string;
    downloadLocation: string;
    downloadBehavior: 'ask' | 'default';
    clearedDownloads: string[];
    volumeSettings: {
      globalMuted: boolean;
      tabVolumes: {[cardId: string]: number};
    };
  };
  notification: {
    readNotifs: string[];
  };
  plugin: {
    migrated: boolean;
    disabledCards: string[];
  };
  performance: {
    forceColorProfile: 'default' | 'srgb' | 'display-p3' | 'color-spin-gamma24';
    highDpiSupport: boolean;
    autoplayPolicy:
      | 'default'
      | 'no-user-gesture-required'
      | 'user-gesture-required'
      | 'document-user-activation-required';
    enableAcceleratedVideoDecode: boolean;
    jsMaxOldSpaceSize: 2048 | 4096 | 8192;
    ignoreGpuBlacklist: boolean;
    diskCacheSize: 0 | 268435456 | 536870912 | 1073741824;
    enableWebAssemblySimd: boolean;
    forceHighPerformanceGpu: boolean;
    disableGpuVsync: boolean;
    disableFrameRateLimit: boolean;
    enableGpuRasterization: boolean;
    enableZeroCopy: boolean;
  };
};

export default StorageTypes;
