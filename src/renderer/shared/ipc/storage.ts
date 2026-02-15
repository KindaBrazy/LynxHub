import storageChannels, {storageUtilsChannels} from '@lynx_common/consts/ipcChannels/storage';
import {ChosenArgumentsData, ConfirmMenuTypes} from '@lynx_common/types';
import {
  BrowserHistoryData,
  CustomRunBehaviorData,
  HomeCategory,
  OnPreCommands,
  PreCommands,
  PreOpen,
  PreOpenData,
  RecentlyOperation,
  StorageOperation,
} from '@lynx_common/types/ipc';
import StorageTypes, {InstalledCard, InstalledCards} from '@lynx_common/types/storage';

import lynxIpc from './lynxIpc';

const storageIpc = {
  // Gets custom storage data by key
  getCustom: (key: string) => lynxIpc.invoke<any>(storageChannels.getCustom, key),

  // Sets custom storage data by key
  setCustom: (key: string, data: any) => lynxIpc.send(storageChannels.setCustom, key, data),

  // Gets typed storage data by key
  get: <K extends keyof StorageTypes>(key: K) => lynxIpc.invoke<StorageTypes[K]>(storageChannels.get, key),

  // Gets all storage data
  getAll: () => lynxIpc.invoke<StorageTypes>(storageChannels.getAll),

  // Updates storage data partially
  update: <K extends keyof StorageTypes>(key: K, updateData: Partial<StorageTypes[K]>) =>
    lynxIpc.invoke<void>(storageChannels.update, key, updateData),

  // Clears all storage data
  clear: () => lynxIpc.invoke<void>(storageChannels.clear),
};

export const storageUtilsIpc = {
  send: {
    // Adds installed card to storage
    addInstalledCard: (cardData: InstalledCard) => lynxIpc.send(storageUtilsChannels.addInstalledCard, cardData),
    // Removes installed card from storage
    removeInstalledCard: (cardId: string) => lynxIpc.send(storageUtilsChannels.removeInstalledCard, cardId),

    // Adds card to auto-update list
    addAutoUpdateCard: (cardId: string) => lynxIpc.send(storageUtilsChannels.addAutoUpdateCard, cardId),
    // Removes card from auto-update list
    removeAutoUpdateCard: (cardId: string) => lynxIpc.send(storageUtilsChannels.removeAutoUpdateCard, cardId),

    // Adds card extensions to auto-update list
    addAutoUpdateExtensions: (cardId: string) => lynxIpc.send(storageUtilsChannels.addAutoUpdateExtensions, cardId),
    // Removes card extensions from auto-update list
    removeAutoUpdateExtensions: (cardId: string) =>
      lynxIpc.send(storageUtilsChannels.removeAutoUpdateExtensions, cardId),

    // Updates custom run behavior settings
    updateCustomRunBehavior: (data: Partial<CustomRunBehaviorData>) =>
      lynxIpc.send(storageUtilsChannels.customRunBehavior, data),

    // Sets app to start with system startup
    setSystemStartup: (startup: boolean) => lynxIpc.send(storageUtilsChannels.setSystemStartup, startup),

    // Adds URL to browser recent list
    addBrowserRecent: (recentEntry: string) => lynxIpc.send(storageUtilsChannels.addBrowserRecent, recentEntry),
    // Adds URL to browser favorites
    addBrowserFavorite: (favoriteEntry: string) => lynxIpc.send(storageUtilsChannels.addBrowserFavorite, favoriteEntry),
    // Adds URL to browser history
    addBrowserHistory: (historyEntry: string) => lynxIpc.send(storageUtilsChannels.addBrowserHistory, historyEntry),
    // Adds favicon for browser recent URL
    addBrowserRecentFavIcon: (url: string, favIcon: string, title?: string) =>
      lynxIpc.send(storageUtilsChannels.addBrowserRecentFavIcon, url, favIcon, title),
    // Removes URL from browser recent list
    removeBrowserRecent: (url: string) => lynxIpc.send(storageUtilsChannels.removeBrowserRecent, url),
    // Removes URL from browser favorites
    removeBrowserFavorite: (url: string) => lynxIpc.send(storageUtilsChannels.removeBrowserFavorite, url),
    // Removes URL from browser history
    removeBrowserHistory: (url: string) => lynxIpc.send(storageUtilsChannels.removeBrowserHistory, url),

    // Sets confirmation dialog visibility (close, terminate AI, close tab)
    setShowConfirm: (type: ConfirmMenuTypes, enable: boolean) =>
      lynxIpc.send(storageUtilsChannels.setShowConfirm, type, enable),

    // Marks notification as read
    addReadNotif: (id: string) => lynxIpc.send(storageUtilsChannels.addReadNotif, id),

    // Sets terminal pre-commands for card
    setCardTerminalPreCommands: (id: string, commands: string[]) =>
      lynxIpc.send(storageUtilsChannels.setCardTerminalPreCommands, id, commands),
  },
  invoke: {
    // Manages pinned cards (add, remove, get)
    pinnedCards: (opt: StorageOperation, id: string, pinnedCards?: string[]) =>
      lynxIpc.invoke<string[]>(storageUtilsChannels.pinnedCards, opt, id, pinnedCards),

    // Manages pre-commands for cards (commands run before card starts)
    preCommands: (opt: StorageOperation, data: PreCommands) =>
      lynxIpc.invoke<string[]>(storageUtilsChannels.preCommands, opt, data),

    // Manages custom run commands for cards
    customRun: (opt: StorageOperation, data: PreCommands) =>
      lynxIpc.invoke<string[]>(storageUtilsChannels.customRun, opt, data),

    // Manages pre-open items (files/folders opened before card starts)
    preOpen: (opt: StorageOperation, open: PreOpen) =>
      lynxIpc.invoke<PreOpenData | undefined>(storageUtilsChannels.preOpen, opt, open),

    // Gets card arguments by card ID
    getCardArguments: (cardId: string) =>
      lynxIpc.invoke<ChosenArgumentsData>(storageUtilsChannels.getCardArguments, cardId),
    // Sets card arguments by card ID
    setCardArguments: (cardId: string, args: ChosenArgumentsData) =>
      lynxIpc.invoke<void>(storageUtilsChannels.setCardArguments, cardId, args),

    // Manages recently used cards (add, remove, get)
    recentlyUsedCards: (opt: RecentlyOperation, id: string) =>
      lynxIpc.invoke<string[]>(storageUtilsChannels.recentlyUsedCards, opt, id),

    // Manages home category organization
    homeCategory: (opt: StorageOperation, data: HomeCategory) =>
      lynxIpc.invoke<HomeCategory>(storageUtilsChannels.homeCategory, opt, data),

    // Unassigns card and optionally clears its configurations
    unassignCard: (id: string, clearConfigs: boolean) =>
      lynxIpc.invoke<void>(storageUtilsChannels.unassignCard, id, clearConfigs),

    // Gets browser history data securely
    getBrowserHistoryData: () => lynxIpc.invoke<BrowserHistoryData>(storageUtilsChannels.getBrowserHistoryData),
  },
  on: {
    // Listens for installed cards change events
    onInstalledCards: (result: (cards: InstalledCards) => void) =>
      lynxIpc.on(storageUtilsChannels.onInstalledCards, result),

    // Listens for auto-update cards change events
    onAutoUpdateCards: (result: (cards: string[]) => void) =>
      lynxIpc.on(storageUtilsChannels.onAutoUpdateCards, result),

    // Listens for auto-update extensions change events
    onAutoUpdateExtensions: (result: (cards: string[]) => void) =>
      lynxIpc.on(storageUtilsChannels.onAutoUpdateExtensions, result),

    // Listens for pinned cards change events
    onPinnedCardsChange: (result: (cards: string[]) => void) =>
      lynxIpc.on(storageUtilsChannels.onPinnedCardsChange, result),

    // Listens for pre-commands change events
    onPreCommands: (result: (preCommands: OnPreCommands) => void) =>
      lynxIpc.on(storageUtilsChannels.onPreCommands, result),

    // Listens for custom run commands change events
    onCustomRun: (result: (preCommands: OnPreCommands) => void) => lynxIpc.on(storageUtilsChannels.onCustomRun, result),

    // Listens for recently used cards change events
    onRecentlyUsedCardsChange: (result: (cards: string[]) => void) =>
      lynxIpc.on(storageUtilsChannels.onRecentlyUsedCardsChange, result),

    // Listens for home category change events
    onHomeCategory: (result: (data: HomeCategory) => void) => lynxIpc.on(storageUtilsChannels.onHomeCategory, result),

    // Listens for confirmation dialog setting changes
    onConfirmChange: (result: (type: ConfirmMenuTypes, enable: boolean) => void) =>
      lynxIpc.on(storageUtilsChannels.onConfirmChange, result),
  },
};

export default storageIpc;
