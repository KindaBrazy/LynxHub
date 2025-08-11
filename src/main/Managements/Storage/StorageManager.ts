import {platform} from 'node:os';

import lodash from 'lodash';
import _ from 'lodash';

import {ChosenArgumentsData} from '../../../cross/CrossTypes';
import {compareUrls, isValidURL} from '../../../cross/CrossUtils';
import {
  BrowserHistoryData,
  CustomRunBehaviorData,
  HomeCategory,
  PreCommands,
  PreOpen,
  PreOpenData,
  RecentlyOperation,
  StorageOperation,
  storageUtilsChannels,
} from '../../../cross/IpcChannelAndTypes';
import {InstalledCard, InstalledCards} from '../../../cross/StorageTypes';
import {appManager, cardsValidator, moduleManager} from '../../index';
import {
  getAbsolutePath,
  getExePath,
  getRelativePath,
  isPortable,
  lynxDecryptString,
  lynxDecryptStrings,
  lynxEncryptString,
  lynxEncryptStrings,
} from '../../Utilities/Utils';
import BaseStorage from './BaseStorage';

class StorageManager extends BaseStorage {
  private decryptedBrowserData!: BrowserHistoryData;

  constructor() {
    super();
  }

  public decryptBrowserData() {
    const rawData = this.getData('browser');
    this.decryptedBrowserData = {
      recentAddress: lynxDecryptStrings(rawData.recentAddress),
      favoriteAddress: lynxDecryptStrings(rawData.favoriteAddress),
      historyAddress: lynxDecryptStrings(rawData.historyAddress),
      favIcons: rawData.favIcons.map(item => ({
        url: lynxDecryptString(item.url),
        favIcon: lynxDecryptString(item.favIcon),
      })),
    };
  }

  private getPreCommands(id: string): string[] {
    return this.getData('cardsConfig').preCommands.find(preCommand => preCommand.cardId === id)?.data || [];
  }

  private getCustomRun(id: string): string[] {
    return this.getData('cardsConfig').customRun.find(customRun => customRun.cardId === id)?.data || [];
  }

  private getPreOpen(id: string): PreOpenData {
    return this.getData('cardsConfig').preOpen.find(preOpen => preOpen.cardId === id)?.data || [];
  }

  private getArgs(cardId: string) {
    return this.getData('cardsConfig').args.find(arg => arg.cardId === cardId);
  }

  private setArgs(cardId: string, args: ChosenArgumentsData) {
    const currentArgs = this.getData('cardsConfig').args;
    const existingArgIndex = currentArgs.findIndex(arg => arg.cardId === cardId);

    if (existingArgIndex !== -1) {
      currentArgs[existingArgIndex] = {cardId, ...args};
    } else {
      currentArgs.push({cardId, ...args});
    }

    this.updateData('cardsConfig', {args: currentArgs});
  }

  public getPreOpenById(cardId: string) {
    return this.getData('cardsConfig').preOpen.find(preOpen => preOpen.cardId === cardId);
  }

  public getPreCommandById(cardId: string) {
    return this.getData('cardsConfig').preCommands.find(preOpen => preOpen.cardId === cardId);
  }

  public getCustomRunById(cardId: string) {
    return this.getData('cardsConfig').customRun.find(preOpen => preOpen.cardId === cardId);
  }

  public async getCardArgumentsById(cardId: string) {
    const args = this.getArgs(cardId);
    if (args) return args;

    const returnArgs = await moduleManager?.getMethodsById(cardId)?.().readArgs?.();
    const result: ChosenArgumentsData = {
      activePreset: 'Default',
      data: [{preset: 'Default', arguments: returnArgs || []}],
    };
    this.setArgs(cardId, result);
    return result;
  }

  public async setCardArguments(cardId: string, args: ChosenArgumentsData) {
    this.setArgs(cardId, args);

    const result = args.data.find(arg => arg.preset === args.activePreset)?.arguments || [];

    await moduleManager?.getMethodsById(cardId)?.().saveArgs?.(result);
  }

  public addInstalledCard(card: InstalledCard) {
    const storedCards = this.getData('cards').installedCards;

    const cardExists = storedCards.some(c => c.id === card.id);

    if (!cardExists) {
      if (card.dir && isPortable()) {
        card.dir = getRelativePath(getExePath(), card.dir);
      }
      const installedCards: InstalledCards = [...storedCards, card];

      this.updateData('cards', {installedCards});

      appManager?.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
    }
    cardsValidator?.changedCards();
  }

  public removeInstalledCard(id: string) {
    const storedCards = this.getData('cards').installedCards;

    const installedCards = storedCards.filter(card => card.id !== id);

    this.updateData('cards', {installedCards});

    appManager?.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
    cardsValidator?.changedCards();
  }

  public removeInstalledCardByPath(dir: string) {
    const installedCards = this.getData('cards').installedCards.filter(
      card => getAbsolutePath(getExePath(), card.dir || '') !== getAbsolutePath(getExePath(), dir),
    );
    this.updateData('cards', {installedCards});
    appManager?.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
  }

  public addAutoUpdateCard(cardId: string) {
    const storedAutoUpdateCards = this.getData('cards').autoUpdateCards;

    const cardExists = lodash.includes(storedAutoUpdateCards, cardId);

    if (!cardExists) {
      const result: string[] = [...storedAutoUpdateCards, cardId];

      this.updateData('cards', {autoUpdateCards: [...storedAutoUpdateCards, cardId]});

      appManager?.getWebContent()?.send(storageUtilsChannels.onAutoUpdateCards, result);
    }
  }

  public removeAutoUpdateCard(cardId: string) {
    const storedAutoUpdateCards = this.getData('cards').autoUpdateCards;

    const updatedAutoUpdateCards = lodash.filter(storedAutoUpdateCards, id => id !== cardId);

    this.updateData('cards', {autoUpdateCards: updatedAutoUpdateCards});

    appManager?.getWebContent()?.send(storageUtilsChannels.onAutoUpdateCards, updatedAutoUpdateCards);
  }

  public addAutoUpdateExtensions(cardId: string) {
    const storedAutoUpdateExtensions = this.getData('cards').autoUpdateExtensions;

    const extensionsExists = lodash.includes(storedAutoUpdateExtensions, cardId);

    if (!extensionsExists) {
      const result: string[] = [...storedAutoUpdateExtensions, cardId];

      this.updateData('cards', {autoUpdateExtensions: [...storedAutoUpdateExtensions, cardId]});

      appManager?.getWebContent()?.send(storageUtilsChannels.onAutoUpdateExtensions, result);
    }
  }

  public removeAutoUpdateExtensions(cardId: string) {
    const storedAutoUpdateExtensions = this.getData('cards').autoUpdateExtensions;

    const updatedAutoUpdateExtensions = lodash.filter(storedAutoUpdateExtensions, id => id !== cardId);

    this.updateData('cards', {autoUpdateExtensions: updatedAutoUpdateExtensions});

    appManager?.getWebContent()?.send(storageUtilsChannels.onAutoUpdateExtensions, updatedAutoUpdateExtensions);
  }

  public addPinnedCard(cardId: string) {
    const storedPinnedCards = this.getData('cards').pinnedCards;

    const cardExists = lodash.includes(storedPinnedCards, cardId);

    if (!cardExists) {
      const result: string[] = [...storedPinnedCards, cardId];

      this.updateData('cards', {pinnedCards: [...storedPinnedCards, cardId]});

      appManager?.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, result);
    }
  }

  public removePinnedCard(cardId: string) {
    const storedPinnedCards = this.getData('cards').pinnedCards;

    const updatedPinnedCards = lodash.filter(storedPinnedCards, id => id !== cardId);

    this.updateData('cards', {pinnedCards: updatedPinnedCards});

    appManager?.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, updatedPinnedCards);
  }

  public pinnedCardsOpt(opt: StorageOperation, id: string, pinnedCards?: string[]) {
    let result: string[] = [];

    switch (opt) {
      case 'add':
        this.addPinnedCard(id);
        break;

      case 'remove':
        this.removePinnedCard(id);
        break;

      case 'get':
        result = this.getData('cards').pinnedCards;
        break;

      case 'set':
        this.updateData('cards', {pinnedCards});
        appManager?.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, pinnedCards);
        break;
    }

    return result;
  }

  public updateRecentlyUsedCards(id: string) {
    const newArray = _.without(this.getData('cards').recentlyUsedCards, id);
    // Add the id to the beginning of the array
    newArray.unshift(id);
    // Keep only the last 5 elements
    const result = _.take(newArray, 5);

    this.updateData('cards', {recentlyUsedCards: result});

    appManager?.getWebContent()?.send(storageUtilsChannels.onRecentlyUsedCardsChange, result);
  }

  public recentlyUsedCardsOpt(opt: RecentlyOperation, id: string) {
    let result: string[] = [];

    switch (opt) {
      case 'update':
        this.updateRecentlyUsedCards(id);
        break;

      case 'get':
        result = this.getData('cards').recentlyUsedCards;
        break;
    }

    return result;
  }

  public setHomeCategory(data: string[]) {
    this.updateData('app', {homeCategory: data});
    appManager?.getWebContent()?.send(storageUtilsChannels.onHomeCategory, data);
  }

  public homeCategoryOpt(opt: StorageOperation, data: string[]) {
    let result: HomeCategory = [];

    switch (opt) {
      case 'set':
        this.setHomeCategory(data);
        break;

      case 'get':
        result = this.getData('app').homeCategory;
        break;
    }

    return result;
  }

  public addPreCommand(cardId: string, command: string): void {
    const preCommands = this.getData('cardsConfig').preCommands;
    const existCommand = preCommands.findIndex(command => command.cardId === cardId);

    let commands: string[];

    if (existCommand !== -1) {
      preCommands[existCommand].data.push(command);
      commands = preCommands[existCommand].data;
    } else {
      commands = [command];
      preCommands.push({cardId, data: [command]});
    }

    appManager?.getWebContent()?.send(storageUtilsChannels.onPreCommands, {commands, id: cardId});

    this.updateData('cardsConfig', {preCommands});
  }

  public setPreCommand(cardId: string, commands: string[]): void {
    const preCommands = this.getData('cardsConfig').preCommands;
    const existCommand = preCommands.findIndex(command => command.cardId === cardId);

    if (existCommand !== -1) {
      preCommands[existCommand].data = commands;
    } else {
      preCommands.push({cardId, data: commands});
    }
    this.updateData('cardsConfig', {preCommands});
  }

  public removePreCommand(cardId: string, index: number): void {
    const preCommands = this.getData('cardsConfig').preCommands;
    const existCommand = preCommands.findIndex(command => command.cardId === cardId);

    let commands: string[] = [];

    if (existCommand !== -1) {
      preCommands[existCommand].data.splice(index, 1);
      commands = preCommands[existCommand].data;
    }

    appManager?.getWebContent()?.send(storageUtilsChannels.onPreCommands, {commands, id: cardId});
    this.updateData('cardsConfig', {preCommands});
  }

  public preCommandOpt(opt: StorageOperation, data: PreCommands) {
    let result: string[] = [];

    switch (opt) {
      case 'add':
        if (typeof data.command === 'string') this.addPreCommand(data.id, data.command);
        break;

      case 'remove':
        if (typeof data.command === 'number') this.removePreCommand(data.id, data.command);
        break;

      case 'get':
        result = this.getPreCommands(data.id);
        break;

      case 'set':
        if (lodash.isArray(data.command)) this.setPreCommand(data.id, data.command);
        break;
    }

    return result;
  }

  public addCustomRun(cardId: string, command: string): void {
    const customRun = this.getData('cardsConfig').customRun;
    const existCustomRun = customRun.findIndex(custom => custom.cardId === cardId);

    let custom: string[];

    if (existCustomRun !== -1) {
      customRun[existCustomRun].data.push(command);
      custom = customRun[existCustomRun].data;
    } else {
      custom = [command];
      customRun.push({cardId, data: [command]});
    }

    appManager?.getWebContent()?.send(storageUtilsChannels.onCustomRun, {commands: custom, id: cardId});
    this.updateData('cardsConfig', {customRun});
  }

  public setCustomRun(cardId: string, commands: string[]): void {
    const customRun = this.getData('cardsConfig').customRun;
    const existCommand = customRun.findIndex(command => command.cardId === cardId);

    if (existCommand !== -1) {
      customRun[existCommand].data = commands;
    } else {
      customRun.push({cardId, data: commands});
    }
    this.updateData('cardsConfig', {customRun});
  }

  public removeCustomRun(cardId: string, index: number): void {
    const customRun = this.getData('cardsConfig').customRun;
    const existCommand = customRun.findIndex(command => command.cardId === cardId);

    let commands: string[] = [];

    if (existCommand !== -1) {
      customRun[existCommand].data.splice(index, 1);
      commands = customRun[existCommand].data;
    }

    appManager?.getWebContent()?.send(storageUtilsChannels.onCustomRun, {commands, id: cardId});
    this.updateData('cardsConfig', {customRun});
  }

  public customRunOpt(opt: StorageOperation, data: PreCommands) {
    let result: string[] = [];

    switch (opt) {
      case 'add':
        if (typeof data.command === 'string') this.addCustomRun(data.id, data.command);
        break;

      case 'remove':
        if (typeof data.command === 'number') this.removeCustomRun(data.id, data.command);
        break;

      case 'get':
        result = this.getCustomRun(data.id);
        break;

      case 'set':
        if (lodash.isArray(data.command)) this.setCustomRun(data.id, data.command);
        break;
    }

    return result;
  }

  // TODO: Support relative paths for pre open
  public addPreOpen(cardId: string, open: {type: 'folder' | 'file'; path: string}): void {
    const preOpen = this.getData('cardsConfig').preOpen;
    const existCustomRun = preOpen.findIndex(custom => custom.cardId === cardId);

    if (existCustomRun !== -1) {
      preOpen[existCustomRun].data.push(open);
    } else {
      preOpen.push({cardId, data: [open]});
    }
    this.updateData('cardsConfig', {preOpen});
  }

  public removePreOpen(cardId: string, index: number): void {
    const preOpen = this.getData('cardsConfig').preOpen;
    const existCommand = preOpen.findIndex(command => command.cardId === cardId);

    if (existCommand !== -1) {
      preOpen[existCommand].data.splice(index, 1);
    }
    this.updateData('cardsConfig', {preOpen});
  }

  public preOpenOpt(opt: StorageOperation, data: PreOpen): PreOpenData {
    let result: PreOpenData = [];

    switch (opt) {
      case 'add':
        if (typeof data.open === 'object' && data.open) this.addPreOpen(data.id, data.open);
        break;

      case 'remove':
        if (typeof data.open === 'number') this.removePreOpen(data.id, data.open);
        break;

      case 'get':
        result = this.getPreOpen(data.id);
        break;
    }

    return result;
  }

  public updateCustomRunBehavior(data: CustomRunBehaviorData) {
    let customRunBehavior = this.getData('cardsConfig').customRunBehavior;
    const existCustom = customRunBehavior.findIndex(command => command.cardID === data.cardID);

    if (existCustom !== -1) {
      customRunBehavior[existCustom] = data;
    } else {
      customRunBehavior = [...customRunBehavior, data];
    }

    this.updateData('cardsConfig', {customRunBehavior});
  }

  public updateLastSize() {
    const isMaximized = appManager?.getMainWindow()?.isMaximized() || false;
    const bounds = appManager?.getMainWindow()?.getBounds();

    const prevBounds = this.getData('app').lastSize?.bounds;

    this.updateData('app', {
      lastSize: {
        maximized: isMaximized,
        bounds: isMaximized ? prevBounds : bounds,
      },
    });
  }

  public getBrowserDataSecurely(): BrowserHistoryData {
    return this.decryptedBrowserData;
  }

  public updateBrowserDataSecurely(data: Partial<BrowserHistoryData>): void {
    const encryptedData: Partial<BrowserHistoryData> = JSON.parse(JSON.stringify(data));

    this.decryptedBrowserData = {
      ...this.decryptedBrowserData,
      ...encryptedData,
    };

    if (encryptedData.recentAddress) {
      encryptedData.recentAddress = lynxEncryptStrings(encryptedData.recentAddress);
    }
    if (encryptedData.favoriteAddress) {
      encryptedData.favoriteAddress = lynxEncryptStrings(encryptedData.favoriteAddress);
    }
    if (encryptedData.historyAddress) {
      encryptedData.historyAddress = lynxEncryptStrings(encryptedData.historyAddress);
    }
    if (encryptedData.favIcons) {
      encryptedData.favIcons = encryptedData.favIcons.map(item => ({
        url: lynxEncryptString(item.url),
        favIcon: lynxEncryptString(item.favIcon),
      }));
    }

    this.updateData('browser', encryptedData);
  }

  public async addBrowserRecent(recentEntry: string) {
    let recentAddress = this.getBrowserDataSecurely().recentAddress;
    let existUrlIndex = -1;

    for (let i = 0; i < recentAddress.length; i++) {
      if (!isValidURL([recentAddress[i], recentEntry])) continue;

      if (await compareUrls(recentAddress[i], recentEntry)) {
        existUrlIndex = i;
        break;
      }
    }

    if (existUrlIndex !== -1) {
      recentAddress = [
        recentEntry,
        ...recentAddress.slice(0, existUrlIndex),
        ...recentAddress.slice(existUrlIndex + 1),
      ];
    } else {
      recentAddress = [recentEntry, ...recentAddress];
    }

    this.updateBrowserDataSecurely({recentAddress});
  }

  public async addBrowserFavIcon(url: string, icon: string) {
    const favIcons = this.getBrowserDataSecurely().favIcons;
    let updatedExisting: boolean = false;

    for (const favIcon of favIcons) {
      if (!isValidURL([favIcon.url, url])) continue;

      const isSame = await compareUrls(favIcon.url, url);
      if (isSame) {
        favIcon.favIcon = icon;
        updatedExisting = true;
        break;
      }
    }

    if (!updatedExisting) favIcons.push({url, favIcon: icon});

    this.updateBrowserDataSecurely({favIcons});
  }

  public async addBrowserFavorite(favoriteEntry: string) {
    let favoriteAddress = this.getBrowserDataSecurely().favoriteAddress;
    let existUrlIndex = -1;

    for (let i = 0; i < favoriteAddress.length; i++) {
      if (!isValidURL([favoriteAddress[i], favoriteEntry])) continue;

      if (await compareUrls(favoriteAddress[i], favoriteEntry)) {
        existUrlIndex = i;
        break;
      }
    }

    if (existUrlIndex !== -1) {
      favoriteAddress = [
        favoriteEntry,
        ...favoriteAddress.slice(0, existUrlIndex),
        ...favoriteAddress.slice(existUrlIndex + 1),
      ];
    } else {
      favoriteAddress = [favoriteEntry, ...favoriteAddress];
    }

    this.updateBrowserDataSecurely({favoriteAddress});
  }

  public async addBrowserHistory(historyEntry: string) {
    let historyAddress = this.getBrowserDataSecurely().historyAddress;
    let existUrlIndex = -1;

    for (let i = 0; i < historyAddress.length; i++) {
      if (!isValidURL([historyAddress[i], historyEntry])) continue;

      if (await compareUrls(historyAddress[i], historyEntry)) {
        existUrlIndex = i;
        break;
      }
    }

    if (existUrlIndex !== -1) {
      historyAddress = [
        historyEntry,
        ...historyAddress.slice(0, existUrlIndex),
        ...historyAddress.slice(existUrlIndex + 1),
      ];
    } else {
      historyAddress = [historyEntry, ...historyAddress];
    }

    this.updateBrowserDataSecurely({historyAddress});
  }

  public removeBrowserRecent(url: string) {
    const recentAddress = this.getBrowserDataSecurely().recentAddress;

    this.updateBrowserDataSecurely({recentAddress: recentAddress.filter(address => address !== url)});
  }

  public removeBrowserFavorite(url: string) {
    const favoriteAddress = this.getBrowserDataSecurely().favoriteAddress;

    this.updateBrowserDataSecurely({favoriteAddress: favoriteAddress.filter(address => address !== url)});
  }

  public removeBrowserHistory(url: string) {
    const historyAddress = this.getBrowserDataSecurely().historyAddress;

    this.updateBrowserDataSecurely({historyAddress: historyAddress.filter(address => address !== url)});
  }

  public setShowConfirm(type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) {
    const prevState = this.getData('app');
    prevState[type] = enable;

    appManager?.getWebContent()?.send(storageUtilsChannels.onConfirmChange, type, enable);

    this.write();
  }

  public addReadNotif(id: string) {
    const prevReadNotifs = this.getData('notification').readNotifs;

    if (prevReadNotifs.includes(id)) return;

    this.updateData('notification', {readNotifs: [...prevReadNotifs, id]});
  }

  public setCardTerminalPreCommands(id: string, commands: string[]) {
    const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';
    const commandLines = commands.map(command => `${command}${LINE_ENDING}`);
    let cardTerminalPreCommands = this.getData('cards').cardTerminalPreCommands;

    const findIndex = cardTerminalPreCommands.findIndex(command => command.id === id);

    if (findIndex !== -1) {
      cardTerminalPreCommands[findIndex] = {id, commands: commandLines};
    } else {
      cardTerminalPreCommands = [...cardTerminalPreCommands, {id, commands: commandLines}];
    }

    this.updateData('cards', {cardTerminalPreCommands});
  }

  public unassignCard(id: string, clearConfigs: boolean) {
    const cards = this.getData('cards');
    const cardsConfig = this.getData('cardsConfig');

    this.removeInstalledCard(id);

    if (clearConfigs) {
      cards.autoUpdateCards = cards.autoUpdateCards.filter(card => card !== id);
      cards.autoUpdateExtensions = cards.autoUpdateExtensions.filter(card => card !== id);
      cards.pinnedCards = cards.pinnedCards.filter(card => card !== id);
      cards.recentlyUsedCards = cards.recentlyUsedCards.filter(card => card !== id);

      cardsConfig.customRun = cardsConfig.customRun.filter(card => card.cardId !== id);
      cardsConfig.preOpen = cardsConfig.preOpen.filter(card => card.cardId !== id);
      cardsConfig.preCommands = cardsConfig.preCommands.filter(card => card.cardId !== id);
      cardsConfig.customRunBehavior = cardsConfig.customRunBehavior.filter(card => card.cardID !== id);
      cardsConfig.args = cardsConfig.args.filter(card => card.cardId !== id);
    }
  }
}

export default StorageManager;
