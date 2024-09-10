import {DiscordRPC, StorageChosenArgumentsData} from './CrossTypes';
import {
  CustomRunBehaviorStore,
  DarkModeTypes,
  HomeCategory,
  LynxHotkeys,
  StoragePreOpenData,
  TaskbarStatus,
  TooltipStatus,
} from './IpcChannelAndTypes';

export type InstalledCard = {
  id: string;
  dir: string;
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
    pinnedCards: string[];
    recentlyUsedCards: string[];
    cardCompactMode: boolean;
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
    homeCategory: HomeCategory;
    darkMode: DarkModeTypes;
    taskbarStatus: TaskbarStatus;
    tooltipStatus: TooltipStatus;
    systemStartup: boolean;
    startMinimized: boolean;
    startupLastActivePage: boolean;
    lastPage: string;
    discordRP: DiscordRPC;
    hotkeys: LynxHotkeys;
    initialized: boolean;
    appDataDir: string;
  };
};

export default StorageTypes;
