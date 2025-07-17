import {Rectangle} from 'electron';

import {DiscordRPC, StorageChosenArgumentsData} from './CrossTypes';
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
    cardCompactMode: boolean;
    cardsDevImage: boolean;
    cardsDevName: boolean;
    cardsDesc: boolean;
    cardsRepoInfo: boolean;
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
    startupLastActivePage: boolean;
    lastPage: string;
    discordRP: DiscordRPC;
    hotkeys: LynxHotkey[];
    initialized: boolean;
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
  };
  browser: {
    recentAddress: string[];
    favoriteAddress: string[];
    historyAddress: string[];
    favIcons: FavIcons[];
    userAgent: AgentTypes;
    customUserAgent: string;
  };
  notification: {
    readNotifs: string[];
  };
};

export default StorageTypes;
