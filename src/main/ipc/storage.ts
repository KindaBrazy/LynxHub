import storageChannels, {storageUtilsChannels} from '@lynx_common/consts/ipcChannels/storage';
import {ChosenArgumentsData, ConfirmMenuTypes} from '@lynx_common/types';
import {
  BrowserHistoryData,
  CustomRunBehaviorData,
  HomeCategory,
  MainHT,
  OnPreCommands,
  PreCommands,
  PreOpen,
  PreOpenData,
  RecentlyOperation,
  StorageOperation,
} from '@lynx_common/types/ipc';
import StorageTypes, {InstalledCard, InstalledCards} from '@lynx_common/types/storage';
import classHolder from '@lynx_main/managers/classHolder';
import {app} from 'electron';

import lynxIpc from './lynxIpc';
import {sendToMain} from './sender';

export default function listenStorage() {
  const storageManager = classHolder.storageManager;

  // Sets custom storage data by key
  storageIpc.on.setCustom((key, data) => storageManager.setCustomData(key, data));

  // Gets custom storage data by key
  storageIpc.handle.getCustom(key => storageManager.getCustomData(key));

  // Gets typed storage data by key
  storageIpc.handle.get(key => storageManager.getData(key));

  // Gets all storage data
  storageIpc.handle.getAll(() => storageManager.getAll());

  // Updates storage data partially
  storageIpc.handle.update((key, updateData) => storageManager.updateData(key, updateData));

  // Clears all storage data
  storageIpc.handle.clear(() => storageManager.clearStorage());
}

export function listenStorageUtils() {
  const storageManager = classHolder.storageManager;

  // Sets app to start with system startup
  storageUtilsIpc.on.setSystemStartup(systemStartup => {
    app.setLoginItemSettings({openAtLogin: systemStartup});
    storageManager.updateData('app', {systemStartup});
  });

  // Adds installed card to storage
  storageUtilsIpc.on.addInstalledCard(cardData => storageManager.addInstalledCard(cardData));

  // Removes installed card from storage
  storageUtilsIpc.on.removeInstalledCard(cardId => storageManager.removeInstalledCard(cardId));

  // Adds card to auto-update list
  storageUtilsIpc.on.addAutoUpdateCard(cardId => storageManager.addAutoUpdateCard(cardId));

  // Removes card from auto-update list
  storageUtilsIpc.on.removeAutoUpdateCard(cardId => storageManager.removeAutoUpdateCard(cardId));

  // Adds card extensions to auto-update list
  storageUtilsIpc.on.addAutoUpdateExtensions(cardId => storageManager.addAutoUpdateExtensions(cardId));

  // Removes card extensions from auto-update list
  storageUtilsIpc.on.removeAutoUpdateExtensions(cardId => storageManager.removeAutoUpdateExtensions(cardId));

  // Manages pinned cards (add, remove, get)
  storageUtilsIpc.handle.pinnedCards((opt, id, pinnedCards) => storageManager.pinnedCardsOpt(opt, id, pinnedCards));

  // Manages recently used cards (add, remove, get)
  storageUtilsIpc.handle.recentlyUsedCards((opt, id) => storageManager.recentlyUsedCardsOpt(opt, id));

  // Manages home category organization
  storageUtilsIpc.handle.homeCategory((opt, data) => storageManager.handleHomeCategoryOperation(opt, data));

  // Manages pre-commands for cards (commands run before card starts)
  storageUtilsIpc.handle.preCommands((opt, data) => storageManager.handlePreCommandOperation(opt, data));

  // Manages custom run commands for cards
  storageUtilsIpc.handle.customRun((opt, data) => storageManager.handleCustomRunOperation(opt, data));

  // Manages pre-open items (files/folders opened before card starts)
  storageUtilsIpc.handle.preOpen((opt, data) => storageManager.handlePreOpenOperation(opt, data));

  // Updates custom run behavior settings
  storageUtilsIpc.on.customRunBehavior(data => storageManager.updateCustomRunBehavior(data));

  // Gets card arguments by card ID
  storageUtilsIpc.handle.getCardArguments(cardId => storageManager.getCardArgumentsById(cardId));

  // Sets card arguments by card ID
  storageUtilsIpc.handle.setCardArguments((cardId, args) => storageManager.setCardArguments(cardId, args));

  // Adds URL to browser recent list
  storageUtilsIpc.on.addBrowserRecent(recentEntry => storageManager.addBrowserRecent(recentEntry));

  // Adds URL to browser favorites
  storageUtilsIpc.on.addBrowserFavorite(favoriteEntry => storageManager.addBrowserFavorite(favoriteEntry));

  // Adds URL to browser history
  storageUtilsIpc.on.addBrowserHistory(historyEntry => storageManager.addBrowserHistory(historyEntry));

  // Adds favicon for browser recent URL
  storageUtilsIpc.on.addBrowserRecentFavIcon((url, favIcon, title) =>
    storageManager.addBrowserFavIcon(url, favIcon, title),
  );

  // Removes URL from browser recent list
  storageUtilsIpc.on.removeBrowserRecent(url => storageManager.removeBrowserRecent(url));

  // Removes URL from browser favorites
  storageUtilsIpc.on.removeBrowserFavorite(url => storageManager.removeBrowserFavorite(url));

  // Removes URL from browser history
  storageUtilsIpc.on.removeBrowserHistory(url => storageManager.removeBrowserHistory(url));

  // Sets confirmation dialog visibility (close, terminate AI, close tab)
  storageUtilsIpc.on.setShowConfirm((type, enable) => storageManager.setShowConfirm(type, enable));

  // Marks notification as read
  storageUtilsIpc.on.addReadNotif(id => storageManager.addReadNotif(id));

  // Sets terminal pre-commands for card
  storageUtilsIpc.on.setCardTerminalPreCommands((id, commands) =>
    storageManager.setCardTerminalPreCommands(id, commands),
  );

  // Unassigns card and optionally clears its configurations
  storageUtilsIpc.handle.unassignCard((id, clearConfigs) => storageManager.unassignCard(id, clearConfigs));

  // Gets browser history data securely
  storageUtilsIpc.handle.getBrowserHistoryData(() => storageManager.getBrowserDataSecurely());
}

export const storageIpc = {
  on: {
    setCustom: (callback: (key: string, data: any) => void) => lynxIpc.on(storageChannels.setCustom, callback),
  },
  handle: {
    getCustom: (callback: (key: string) => MainHT<any>) => lynxIpc.handle(storageChannels.getCustom, callback),
    get: (callback: (key: keyof StorageTypes) => MainHT<any>) => lynxIpc.handle(storageChannels.get, callback),
    getAll: (callback: () => MainHT<StorageTypes>) => lynxIpc.handle(storageChannels.getAll, callback),
    update: (
      callback: (key: keyof StorageTypes, updateData: Partial<StorageTypes[keyof StorageTypes]>) => MainHT<void>,
    ) => lynxIpc.handle(storageChannels.update, callback),
    clear: (callback: () => MainHT<void>) => lynxIpc.handle(storageChannels.clear, callback),
  },
};

export const storageUtilsIpc = {
  send: {
    onInstalledCards: (cards: InstalledCards) => sendToMain(storageUtilsChannels.onInstalledCards, cards),
    onPinnedCardsChange: (cards: string[]) => sendToMain(storageUtilsChannels.onPinnedCardsChange, cards),
    onRecentlyUsedCardsChange: (cards: string[]) => sendToMain(storageUtilsChannels.onRecentlyUsedCardsChange, cards),
    onHomeCategory: (data: HomeCategory) => sendToMain(storageUtilsChannels.onHomeCategory, data),
    onPreCommands: (commands: OnPreCommands) => sendToMain(storageUtilsChannels.onPreCommands, commands),
    onCustomRun: (commands: OnPreCommands) => sendToMain(storageUtilsChannels.onCustomRun, commands),
    onConfirmChange: (type: ConfirmMenuTypes, enable: boolean) =>
      sendToMain(storageUtilsChannels.onConfirmChange, type, enable),

    onArrayUpdate: (channel: string, array: string[]) => sendToMain(channel, array),
  },
  on: {
    setSystemStartup: (callback: (systemStartup: boolean) => void) =>
      lynxIpc.on(storageUtilsChannels.setSystemStartup, callback),
    addInstalledCard: (callback: (cardData: InstalledCard) => void) =>
      lynxIpc.on(storageUtilsChannels.addInstalledCard, callback),
    removeInstalledCard: (callback: (cardId: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeInstalledCard, callback),
    addAutoUpdateCard: (callback: (cardId: string) => void) =>
      lynxIpc.on(storageUtilsChannels.addAutoUpdateCard, callback),
    removeAutoUpdateCard: (callback: (cardId: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeAutoUpdateCard, callback),
    addAutoUpdateExtensions: (callback: (cardId: string) => void) =>
      lynxIpc.on(storageUtilsChannels.addAutoUpdateExtensions, callback),
    removeAutoUpdateExtensions: (callback: (cardId: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeAutoUpdateExtensions, callback),
    addBrowserRecentFavIcon: (callback: (url: string, favIcon: string, title?: string) => void) =>
      lynxIpc.on(storageUtilsChannels.addBrowserRecentFavIcon, callback),
    removeBrowserRecent: (callback: (url: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeBrowserRecent, callback),
    removeBrowserFavorite: (callback: (url: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeBrowserFavorite, callback),
    removeBrowserHistory: (callback: (url: string) => void) =>
      lynxIpc.on(storageUtilsChannels.removeBrowserHistory, callback),
    setShowConfirm: (callback: (type: ConfirmMenuTypes, enable: boolean) => void) =>
      lynxIpc.on(storageUtilsChannels.setShowConfirm, callback),
    addReadNotif: (callback: (id: string) => void) => lynxIpc.on(storageUtilsChannels.addReadNotif, callback),
    setCardTerminalPreCommands: (callback: (id: string, commands: string[]) => void) =>
      lynxIpc.on(storageUtilsChannels.setCardTerminalPreCommands, callback),
    addBrowserFavorite: (callback: (favoriteEntry: string) => MainHT<void>) =>
      lynxIpc.on(storageUtilsChannels.addBrowserFavorite, callback),
    customRunBehavior: (callback: (data: Partial<CustomRunBehaviorData>) => MainHT<void>) =>
      lynxIpc.on(storageUtilsChannels.customRunBehavior, callback),
    addBrowserRecent: (callback: (recentEntry: string) => MainHT<void>) =>
      lynxIpc.on(storageUtilsChannels.addBrowserRecent, callback),
    addBrowserHistory: (callback: (historyEntry: string) => MainHT<void>) =>
      lynxIpc.on(storageUtilsChannels.addBrowserHistory, callback),
  },
  handle: {
    pinnedCards: (callback: (opt: StorageOperation, id: string, pinnedCards?: string[]) => MainHT<string[]>) =>
      lynxIpc.handle(storageUtilsChannels.pinnedCards, callback),
    recentlyUsedCards: (callback: (opt: RecentlyOperation, id: string) => MainHT<string[]>) =>
      lynxIpc.handle(storageUtilsChannels.recentlyUsedCards, callback),
    homeCategory: (callback: (opt: StorageOperation, data: string[]) => MainHT<string[]>) =>
      lynxIpc.handle(storageUtilsChannels.homeCategory, callback),
    preCommands: (callback: (opt: StorageOperation, data: PreCommands) => MainHT<string[]>) =>
      lynxIpc.handle(storageUtilsChannels.preCommands, callback),
    customRun: (callback: (opt: StorageOperation, data: PreCommands) => MainHT<string[]>) =>
      lynxIpc.handle(storageUtilsChannels.customRun, callback),
    preOpen: (callback: (opt: StorageOperation, data: PreOpen) => MainHT<PreOpenData>) =>
      lynxIpc.handle(storageUtilsChannels.preOpen, callback),
    getCardArguments: (callback: (cardId: string) => MainHT<ChosenArgumentsData>) =>
      lynxIpc.handle(storageUtilsChannels.getCardArguments, callback),
    setCardArguments: (callback: (cardId: string, args: ChosenArgumentsData) => MainHT<void>) =>
      lynxIpc.handle(storageUtilsChannels.setCardArguments, callback),
    unassignCard: (callback: (id: string, clearConfigs: boolean) => MainHT<void>) =>
      lynxIpc.handle(storageUtilsChannels.unassignCard, callback),
    getBrowserHistoryData: (callback: () => MainHT<BrowserHistoryData>) =>
      lynxIpc.handle(storageUtilsChannels.getBrowserHistoryData, callback),
  },
};
