import {platform} from 'node:os';

import {storageUtilsChannels} from '@lynx_common/consts/ipc_channels/storage';
import {
  BrowserHistoryData,
  CustomRunBehaviorData,
  HomeCategory,
  PreCommands,
  PreOpen,
  PreOpenData,
  RecentlyOperation,
  StorageOperation,
} from '@lynx_common/types/ipc';
import lodash from 'lodash';

import {ChosenArgumentsData, ConfirmMenuTypes} from '../../common/types';
import {InstalledCard, InstalledCards} from '../../common/types/storage';
import {compareUrls, isValidURL} from '../../common/utils';
import classHolder from '../core/class_holder';
import {storageUtilsIpc} from '../ipc/storage';
import {
  getAbsolutePath,
  getExePath,
  getRelativePath,
  isPortable,
  lynxDecryptString,
  lynxDecryptStrings,
  lynxEncryptString,
  lynxEncryptStrings,
} from '../utils';
import BaseStorage from './index';

/**
 * Storage manager extending BaseStorage with high-level operations
 * Handles card management, browser data encryption, and configuration operations
 */
class StorageManager extends BaseStorage {
  private decryptedBrowserData!: BrowserHistoryData;

  constructor() {
    super();
  }

  /**
   * Helper: Adds an item to a string array if it doesn't exist, updates storage, and notifies renderer
   */
  private addToCardStringArray(
    arrayKey: 'autoUpdateCards' | 'autoUpdateExtensions' | 'pinnedCards',
    cardId: string,
    channel: string,
  ): void {
    const currentArray = this.getData('cards')[arrayKey];
    if (lodash.includes(currentArray, cardId)) return;

    const updatedArray = [...currentArray, cardId];

    this.updateData('cards', {[arrayKey]: updatedArray});
    storageUtilsIpc.send.onArrayUpdate(channel, updatedArray);
  }

  /**
   * Helper: Removes an item from a string array, updates storage, and notifies renderer
   */
  private removeFromCardStringArray(
    arrayKey: 'autoUpdateCards' | 'autoUpdateExtensions' | 'pinnedCards',
    cardId: string,
    channel: string,
  ): void {
    const currentArray = this.getData('cards')[arrayKey];
    const updatedArray = currentArray.filter(id => id !== cardId);

    this.updateData('cards', {[arrayKey]: updatedArray});
    storageUtilsIpc.send.onArrayUpdate(channel, updatedArray);
  }

  /**
   * Helper: Finds or creates a card config entry and returns its index
   */
  private findOrCreateCardConfig<T extends {cardId: string; data: any}>(
    configArray: T[],
    cardId: string,
    createDefault: () => T,
  ): {index: number; item: T} {
    const index = configArray.findIndex(item => item.cardId === cardId);
    if (index !== -1) {
      return {index, item: configArray[index]};
    }
    const newItem = createDefault();
    configArray.push(newItem);
    return {index: configArray.length - 1, item: newItem};
  }

  /**
   * Helper: Adds a URL to a browser array, moving existing entry to front if found
   */
  private async addBrowserUrl(
    arrayKey: 'recentAddress' | 'favoriteAddress' | 'historyAddress',
    url: string,
  ): Promise<void> {
    let addressArray = this.getBrowserDataSecurely()[arrayKey];
    let existUrlIndex = -1;

    // Find existing URL by comparing normalized URLs
    for (let i = 0; i < addressArray.length; i++) {
      if (!isValidURL([addressArray[i], url])) continue;
      if (await compareUrls(addressArray[i], url)) {
        existUrlIndex = i;
        break;
      }
    }

    // Move to front if exists, otherwise prepend
    if (existUrlIndex !== -1) {
      addressArray = [url, ...addressArray.slice(0, existUrlIndex), ...addressArray.slice(existUrlIndex + 1)];
    } else {
      addressArray = [url, ...addressArray];
    }

    this.updateBrowserDataSecurely({[arrayKey]: addressArray});
  }

  /**
   * Helper: Removes a URL from a browser array
   */
  private removeBrowserUrl(arrayKey: 'recentAddress' | 'favoriteAddress' | 'historyAddress', url: string): void {
    const addressArray = this.getBrowserDataSecurely()[arrayKey];
    this.updateBrowserDataSecurely({[arrayKey]: addressArray.filter(address => address !== url)});
  }

  /**
   * Decrypts browser data and caches it for secure access
   * Must be called before accessing browser data securely
   */
  public decryptBrowserData() {
    const rawData = this.getData('browser');
    this.decryptedBrowserData = {
      recentAddress: lynxDecryptStrings(rawData.recentAddress),
      favoriteAddress: lynxDecryptStrings(rawData.favoriteAddress),
      historyAddress: lynxDecryptStrings(rawData.historyAddress),
      favIcons: rawData.favIcons.map(item => ({
        url: lynxDecryptString(item.url),
        favIcon: lynxDecryptString(item.favIcon),
        title: item.title ? lynxDecryptString(item.title) : undefined,
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

  /**
   * Gets card arguments, loading from module if not cached
   */
  public async getCardArgumentsById(cardId: string) {
    const {moduleManager} = classHolder;
    const args = this.getArgs(cardId);
    if (args) return args;

    // Load arguments from module if not in storage
    const returnArgs = await moduleManager?.getMethodsById(cardId)?.().readArgs?.();
    const result: ChosenArgumentsData = {
      activePreset: 'Default',
      data: [{preset: 'Default', arguments: returnArgs || []}],
    };
    this.setArgs(cardId, result);
    return result;
  }

  public async setCardArguments(cardId: string, args: ChosenArgumentsData) {
    const {moduleManager} = classHolder;
    this.setArgs(cardId, args);

    const result = args.data.find(arg => arg.preset === args.activePreset)?.arguments || [];

    await moduleManager?.getMethodsById(cardId)?.().saveArgs?.(result);
  }

  public addInstalledCard(card: InstalledCard) {
    const {cardsValidator} = classHolder;
    const storedCards = this.getData('cards').installedCards;

    const cardExists = storedCards.some(c => c.id === card.id);

    if (!cardExists) {
      if (card.dir && isPortable()) {
        card.dir = getRelativePath(getExePath(), card.dir);
      }
      const installedCards: InstalledCards = [...storedCards, card];

      this.updateData('cards', {installedCards});

      storageUtilsIpc.send.onInstalledCards(installedCards);
    }
    cardsValidator?.changedCards();
  }

  public removeInstalledCard(id: string) {
    const {cardsValidator} = classHolder;
    const storedCards = this.getData('cards').installedCards;

    const installedCards = storedCards.filter(card => card.id !== id);

    this.updateData('cards', {installedCards});

    storageUtilsIpc.send.onInstalledCards(installedCards);
    cardsValidator?.changedCards();
  }

  public removeInstalledCardByPath(dir: string) {
    const installedCards = this.getData('cards').installedCards.filter(
      card => getAbsolutePath(getExePath(), card.dir || '') !== getAbsolutePath(getExePath(), dir),
    );
    this.updateData('cards', {installedCards});
    storageUtilsIpc.send.onInstalledCards(installedCards);
  }

  public addAutoUpdateCard(cardId: string) {
    this.addToCardStringArray('autoUpdateCards', cardId, storageUtilsChannels.onAutoUpdateCards);
  }

  public removeAutoUpdateCard(cardId: string) {
    this.removeFromCardStringArray('autoUpdateCards', cardId, storageUtilsChannels.onAutoUpdateCards);
  }

  public addAutoUpdateExtensions(cardId: string) {
    this.addToCardStringArray('autoUpdateExtensions', cardId, storageUtilsChannels.onAutoUpdateExtensions);
  }

  public removeAutoUpdateExtensions(cardId: string) {
    this.removeFromCardStringArray('autoUpdateExtensions', cardId, storageUtilsChannels.onAutoUpdateExtensions);
  }

  public addPinnedCard(cardId: string) {
    this.addToCardStringArray('pinnedCards', cardId, storageUtilsChannels.onPinnedCardsChange);
  }

  public removePinnedCard(cardId: string) {
    this.removeFromCardStringArray('pinnedCards', cardId, storageUtilsChannels.onPinnedCardsChange);
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
        storageUtilsIpc.send.onPinnedCardsChange(pinnedCards || []);
        break;
    }

    return result;
  }

  public updateRecentlyUsedCards(id: string) {
    const newArray = lodash.without(this.getData('cards').recentlyUsedCards, id);
    // Add the id to the beginning of the array
    newArray.unshift(id);
    // Keep only the last 5 elements
    const result = lodash.take(newArray, 5);

    this.updateData('cards', {recentlyUsedCards: result});

    storageUtilsIpc.send.onRecentlyUsedCardsChange(result);
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
    storageUtilsIpc.send.onHomeCategory(data);
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
    const {item} = this.findOrCreateCardConfig(preCommands, cardId, () => ({cardId, data: []}));

    item.data.push(command);
    storageUtilsIpc.send.onPreCommands({commands: item.data, id: cardId});
    this.updateData('cardsConfig', {preCommands});
  }

  public setPreCommand(cardId: string, commands: string[]): void {
    const preCommands = this.getData('cardsConfig').preCommands;
    const {item} = this.findOrCreateCardConfig(preCommands, cardId, () => ({cardId, data: []}));

    item.data = commands;
    this.updateData('cardsConfig', {preCommands});
  }

  public removePreCommand(cardId: string, index: number): void {
    const preCommands = this.getData('cardsConfig').preCommands;
    const indexFound = preCommands.findIndex(item => item.cardId === cardId);

    if (indexFound !== -1) {
      preCommands[indexFound].data.splice(index, 1);
      storageUtilsIpc.send.onPreCommands({commands: preCommands[indexFound].data, id: cardId});
      this.updateData('cardsConfig', {preCommands});
    }
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
    const {item} = this.findOrCreateCardConfig(customRun, cardId, () => ({cardId, data: []}));

    item.data.push(command);
    storageUtilsIpc.send.onCustomRun({commands: item.data, id: cardId});
    this.updateData('cardsConfig', {customRun});
  }

  public setCustomRun(cardId: string, commands: string[]): void {
    const customRun = this.getData('cardsConfig').customRun;
    const {item} = this.findOrCreateCardConfig(customRun, cardId, () => ({cardId, data: []}));

    item.data = commands;
    this.updateData('cardsConfig', {customRun});
  }

  public removeCustomRun(cardId: string, index: number): void {
    const customRun = this.getData('cardsConfig').customRun;
    const indexFound = customRun.findIndex(item => item.cardId === cardId);

    if (indexFound !== -1) {
      customRun[indexFound].data.splice(index, 1);

      storageUtilsIpc.send.onCustomRun({commands: customRun[indexFound].data, id: cardId});

      this.updateData('cardsConfig', {customRun});
    }
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

  public addPreOpen(cardId: string, open: {type: 'folder' | 'file'; path: string}): void {
    const preOpen = this.getData('cardsConfig').preOpen;
    const existCustomRun = preOpen.findIndex(custom => custom.cardId === cardId);

    let targetOpen = open;
    if (targetOpen.path && isPortable()) {
      targetOpen = {type: targetOpen.type, path: getRelativePath(getExePath(), open.path)};
    }

    if (existCustomRun !== -1) {
      preOpen[existCustomRun].data.push(targetOpen);
    } else {
      preOpen.push({cardId, data: [targetOpen]});
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

  /**
   * Updates custom run behavior for a card, merging with defaults if new
   */
  public updateCustomRunBehavior(data: Partial<CustomRunBehaviorData>) {
    if (!data.cardID) return;

    let customRunBehavior = this.getData('cardsConfig').customRunBehavior;
    const existCustom = customRunBehavior.findIndex(command => command.cardID === data.cardID);

    if (existCustom !== -1) {
      // Merge with existing behavior
      customRunBehavior[existCustom] = {...customRunBehavior[existCustom], ...data};
    } else {
      // Create new entry with defaults
      customRunBehavior = [
        ...customRunBehavior,
        {
          ...{
            cardID: data.cardID,
            browser: 'appBrowser',
            terminal: 'runScript',
            urlCatch: {
              type: 'module',
              moduleDelay: 0,
              delay: 5,
              customUrl: undefined,
              findLine: undefined,
            },
          },
          ...data,
        },
      ];
    }

    this.updateData('cardsConfig', {customRunBehavior});
  }

  /**
   * Updates the last window size/position
   * Preserves previous bounds if window is maximized
   */
  public updateLastSize() {
    const {appManager} = classHolder;
    const isMaximized = appManager?.getMainWindow()?.isMaximized() || false;
    const bounds = appManager?.getMainWindow()?.getBounds();

    const prevBounds = this.getData('app').lastSize?.bounds;

    this.updateData('app', {
      lastSize: {
        maximized: isMaximized,
        bounds: isMaximized ? prevBounds : bounds, // Keep previous bounds when maximized
      },
    });
  }

  public getBrowserDataSecurely(): BrowserHistoryData {
    return this.decryptedBrowserData;
  }

  /**
   * Updates browser data: updates decrypted cache and encrypts before storing
   */
  public updateBrowserDataSecurely(data: Partial<BrowserHistoryData>): void {
    const encryptedData: Partial<BrowserHistoryData> = structuredClone(data);

    // Update decrypted cache
    this.decryptedBrowserData = {
      ...this.decryptedBrowserData,
      ...encryptedData,
    };

    // Encrypt data before storing
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
        title: item.title ? lynxEncryptString(item.title) : undefined,
      }));
    }

    this.updateData('browser', encryptedData);
  }

  public async addBrowserRecent(recentEntry: string) {
    await this.addBrowserUrl('recentAddress', recentEntry);
  }

  /**
   * Adds or updates a favicon for a URL
   * Updates existing entry if URL matches, otherwise adds new entry
   */
  public async addBrowserFavIcon(url: string, icon: string, title?: string) {
    const favIcons = this.getBrowserDataSecurely().favIcons;
    let updatedExisting: boolean = false;

    // Check if favicon for this URL already exists
    for (const favIcon of favIcons) {
      if (!isValidURL([favIcon.url, url])) continue;

      const isSame = await compareUrls(favIcon.url, url);
      if (isSame) {
        favIcon.favIcon = icon;
        if (title) favIcon.title = title;
        updatedExisting = true;
        break;
      }
    }

    // Add new entry if not found
    if (!updatedExisting) favIcons.push({url, favIcon: icon, title});

    this.updateBrowserDataSecurely({favIcons});
  }

  /**
   * Updates the title for an existing favicon entry
   */
  public async updateBrowserFavIconTitle(url: string, title: string) {
    const favIcons = this.getBrowserDataSecurely().favIcons;

    for (const favIcon of favIcons) {
      if (!isValidURL([favIcon.url, url])) continue;

      const isSame = await compareUrls(favIcon.url, url);
      if (isSame) {
        favIcon.title = title;
        this.updateBrowserDataSecurely({favIcons});
        break;
      }
    }
  }

  public async addBrowserFavorite(favoriteEntry: string) {
    await this.addBrowserUrl('favoriteAddress', favoriteEntry);
  }

  public async addBrowserHistory(historyEntry: string) {
    await this.addBrowserUrl('historyAddress', historyEntry);
  }

  public removeBrowserRecent(url: string) {
    this.removeBrowserUrl('recentAddress', url);
  }

  public removeBrowserFavorite(url: string) {
    this.removeBrowserUrl('favoriteAddress', url);
  }

  public removeBrowserHistory(url: string) {
    this.removeBrowserUrl('historyAddress', url);
  }

  public setShowConfirm(type: ConfirmMenuTypes, enable: boolean) {
    const prevState = this.getData('app');
    prevState[type] = enable;

    storageUtilsIpc.send.onConfirmChange(type, enable);

    this.write();
  }

  public addReadNotif(id: string) {
    const prevReadNotifs = this.getData('notification').readNotifs;

    if (prevReadNotifs.includes(id)) return;

    this.updateData('notification', {readNotifs: [...prevReadNotifs, id]});
  }

  /**
   * Sets terminal pre-commands for a card
   * Adds platform-specific line endings (CRLF for Windows, LF for Unix)
   */
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

  /**
   * Unassigns a card and optionally clears all its configurations
   */
  public unassignCard(id: string, clearConfigs: boolean) {
    const cards = this.getData('cards');
    const cardsConfig = this.getData('cardsConfig');

    this.removeInstalledCard(id);

    if (clearConfigs) {
      // Remove card from all card lists
      cards.autoUpdateCards = cards.autoUpdateCards.filter(card => card !== id);
      cards.autoUpdateExtensions = cards.autoUpdateExtensions.filter(card => card !== id);
      cards.pinnedCards = cards.pinnedCards.filter(card => card !== id);
      cards.recentlyUsedCards = cards.recentlyUsedCards.filter(card => card !== id);

      // Remove all card configurations
      cardsConfig.customRun = cardsConfig.customRun.filter(card => card.cardId !== id);
      cardsConfig.preOpen = cardsConfig.preOpen.filter(card => card.cardId !== id);
      cardsConfig.preCommands = cardsConfig.preCommands.filter(card => card.cardId !== id);
      cardsConfig.customRunBehavior = cardsConfig.customRunBehavior.filter(card => card.cardID !== id);
      cardsConfig.args = cardsConfig.args.filter(card => card.cardId !== id);
    }
  }
}

export default StorageManager;
