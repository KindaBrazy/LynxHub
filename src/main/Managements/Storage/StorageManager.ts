import lodash from 'lodash';
import _ from 'lodash';

import {ChosenArgumentsData} from '../../../cross/CrossTypes';
import {compareUrls} from '../../../cross/CrossUtils';
import {
  BrowserRecent,
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
import {appManager, cardsValidator, moduleManager, storageManager} from '../../index';
import {getAbsolutePath, getExePath, getRelativePath, isPortable} from '../../Utilities/Utils';
import {getAppDataPath} from '../AppDataManager';
import BaseStorage from './BaseStorage';

class StorageManager extends BaseStorage {
  constructor() {
    super();
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
    let dir = this.getData('cards').installedCards.find(card => card.id === cardId)?.dir;
    if (isPortable()) {
      dir = getAbsolutePath(getExePath(), dir || '');
    }

    const configPath = getAppDataPath();
    const storage = {
      get: (key: string) => storageManager.getCustomData(key),
      set: (key: string, data: any) => storageManager.setCustomData(key, data),
    };
    const returnArgs = await moduleManager.getMethodsById(cardId)?.readArgs?.(dir, configPath, storage);
    const result: ChosenArgumentsData = {
      activePreset: 'Default',
      data: [{preset: 'Default', arguments: returnArgs || []}],
    };
    this.setArgs(cardId, result);
    return result;
  }

  public async setCardArguments(cardId: string, args: ChosenArgumentsData) {
    this.setArgs(cardId, args);
    let dir = this.getData('cards').installedCards.find(card => card.id === cardId)?.dir;
    if (isPortable()) {
      dir = getAbsolutePath(getExePath(), dir || '');
    }

    const result = args.data.find(arg => arg.preset === args.activePreset)?.arguments || [];

    const configPath = getAppDataPath();
    const storage = {
      get: (key: string) => storageManager.getCustomData(key),
      set: (key: string, data: any) => storageManager.setCustomData(key, data),
    };
    await moduleManager.getMethodsById(cardId)?.saveArgs?.(result, dir, configPath, storage);
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

      appManager.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
    }
    cardsValidator.changedCards();
  }

  public removeInstalledCard(id: string) {
    const storedCards = this.getData('cards').installedCards;

    const installedCards = storedCards.filter(card => card.id !== id);

    this.updateData('cards', {installedCards});

    appManager.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
    cardsValidator.changedCards();
  }

  public removeInstalledCardByPath(dir: string) {
    const installedCards = this.getData('cards').installedCards.filter(
      card => getAbsolutePath(getExePath(), card.dir || '') !== getAbsolutePath(getExePath(), dir),
    );
    this.updateData('cards', {installedCards});
    appManager.getWebContent()?.send(storageUtilsChannels.onInstalledCards, installedCards);
  }

  public addAutoUpdateCard(cardId: string) {
    const storedAutoUpdateCards = this.getData('cards').autoUpdateCards;

    const cardExists = lodash.includes(storedAutoUpdateCards, cardId);

    if (!cardExists) {
      const result: string[] = [...storedAutoUpdateCards, cardId];

      this.updateData('cards', {autoUpdateCards: [...storedAutoUpdateCards, cardId]});

      appManager.getWebContent()?.send(storageUtilsChannels.onAutoUpdateCards, result);
    }
  }

  public removeAutoUpdateCard(cardId: string) {
    const storedAutoUpdateCards = this.getData('cards').autoUpdateCards;

    const updatedAutoUpdateCards = lodash.filter(storedAutoUpdateCards, id => id !== cardId);

    this.updateData('cards', {autoUpdateCards: updatedAutoUpdateCards});

    appManager.getWebContent()?.send(storageUtilsChannels.onAutoUpdateCards, updatedAutoUpdateCards);
  }

  public addAutoUpdateExtensions(cardId: string) {
    const storedAutoUpdateExtensions = this.getData('cards').autoUpdateExtensions;

    const extensionsExists = lodash.includes(storedAutoUpdateExtensions, cardId);

    if (!extensionsExists) {
      const result: string[] = [...storedAutoUpdateExtensions, cardId];

      this.updateData('cards', {autoUpdateExtensions: [...storedAutoUpdateExtensions, cardId]});

      appManager.getWebContent()?.send(storageUtilsChannels.onAutoUpdateExtensions, result);
    }
  }

  public removeAutoUpdateExtensions(cardId: string) {
    const storedAutoUpdateExtensions = this.getData('cards').autoUpdateExtensions;

    const updatedAutoUpdateExtensions = lodash.filter(storedAutoUpdateExtensions, id => id !== cardId);

    this.updateData('cards', {autoUpdateExtensions: updatedAutoUpdateExtensions});

    appManager.getWebContent()?.send(storageUtilsChannels.onAutoUpdateExtensions, updatedAutoUpdateExtensions);
  }

  public addPinnedCard(cardId: string) {
    const storedPinnedCards = this.getData('cards').pinnedCards;

    const cardExists = lodash.includes(storedPinnedCards, cardId);

    if (!cardExists) {
      const result: string[] = [...storedPinnedCards, cardId];

      this.updateData('cards', {pinnedCards: [...storedPinnedCards, cardId]});

      appManager.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, result);
    }
  }

  public removePinnedCard(cardId: string) {
    const storedPinnedCards = this.getData('cards').pinnedCards;

    const updatedPinnedCards = lodash.filter(storedPinnedCards, id => id !== cardId);

    this.updateData('cards', {pinnedCards: updatedPinnedCards});

    appManager.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, updatedPinnedCards);
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
        appManager.getWebContent()?.send(storageUtilsChannels.onPinnedCardsChange, pinnedCards);
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

    appManager.getWebContent()?.send(storageUtilsChannels.onRecentlyUsedCardsChange, result);
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
    appManager.getWebContent()?.send(storageUtilsChannels.onHomeCategory, data);
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

    appManager.getWebContent()?.send(storageUtilsChannels.onPreCommands, {commands, id: cardId});

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

    appManager.getWebContent()?.send(storageUtilsChannels.onPreCommands, {commands, id: cardId});
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

    appManager.getWebContent()?.send(storageUtilsChannels.onCustomRun, {commands: custom, id: cardId});
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

    appManager.getWebContent()?.send(storageUtilsChannels.onCustomRun, {commands, id: cardId});
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
    const isMaximized = appManager.getMainWindow()?.isMaximized() || false;
    const bounds = appManager.getMainWindow()?.getBounds();

    const prevBounds = this.getData('app').lastSize?.bounds;

    this.updateData('app', {
      lastSize: {
        maximized: isMaximized,
        bounds: isMaximized ? prevBounds : bounds,
      },
    });
  }

  public async addBrowserRecent(recentEntry: BrowserRecent) {
    let recentAddress = this.getData('browser').recentAddress;
    let existUrlIndex = -1;

    for (let i = 0; i < recentAddress.length; i++) {
      if (await compareUrls(recentAddress[i].url, recentEntry.url)) {
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

    this.updateData('browser', {recentAddress});
  }

  public async addBrowserRecentFavIcon(url: string, favIcon: string) {
    const recentAddress = this.getData('browser').recentAddress;

    for (const recent of recentAddress) {
      const isSame = await compareUrls(recent.url, url);
      if (isSame) {
        recent.favIcon = favIcon;
        break;
      }
    }

    this.updateData('browser', {recentAddress});
  }

  public removeBrowserRecent(url: string) {
    const recentAddress = this.getData('browser').recentAddress;

    this.updateData('browser', {recentAddress: recentAddress.filter(address => address.url !== url)});
  }

  public getBrowserRecent(): BrowserRecent[] {
    return this.getData('browser').recentAddress;
  }

  public setShowConfirm(type: 'closeConfirm' | 'terminateAIConfirm' | 'closeTabConfirm', enable: boolean) {
    const prevState = this.getData('app');
    prevState[type] = enable;

    appManager.getWebContent()?.send(storageUtilsChannels.onConfirmChange, type, enable);

    this.write();
  }
}

export default StorageManager;
