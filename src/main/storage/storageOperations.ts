import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import {storageUtilsChannels} from '@lynx_common/consts/ipcChannels/storage';
import {ChosenArgumentsData, ConfirmMenuTypes} from '@lynx_common/types';
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
import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import {InstalledCard, InstalledCards} from '@lynx_common/types/storage';
import {compareUrls, isValidURL, terminalLineEnding} from '@lynx_common/utils';
import {sendToMain} from '@lynx_main/ipc/sender';
import classHolder from '@lynx_main/managers/classHolder';
import {
  decryptString,
  decryptStrings,
  encryptString,
  encryptStrings,
  getAbsolutePath,
  getExePath,
  getRelativePath,
  isPortable,
} from '@lynx_main/utils';
import AddBreadcrumb_Main from '@lynx_main/utils/breadcrumbs';
import axios from 'axios';
import {uniqBy} from 'lodash-es';

import {AUTH_LOGIN_KEY} from '../monitoring/auth';
import {getTokens} from '../monitoring/token';
import BaseStorage from './index';

/**
 * Storage manager extending BaseStorage with high-level operations.
 * Handles card management, browser data encryption, and configuration operations.
 */
class StorageManager extends BaseStorage {
  private decryptedBrowserData!: BrowserHistoryData;

  constructor() {
    super();
  }

  /**
   * Helper: Adds an item to a string array if it doesn't exist, updates storage, and notifies renderer.
   * @param arrayKey - The key of the array in the storage.
   * @param cardId - The ID of the card to add.
   * @param channel - The IPC channel to notify.
   */
  private addToCardStringArray(
    arrayKey: 'autoUpdateCards' | 'autoUpdateExtensions' | 'pinnedCards',
    cardId: string,
    channel: string,
  ): void {
    const currentArray = this.getData('cards')[arrayKey];
    if (currentArray.includes(cardId)) return;

    const updatedArray = [...currentArray, cardId];

    this.updateData('cards', {[arrayKey]: updatedArray});
    sendToMain(channel, updatedArray);
  }

  /**
   * Helper: Removes an item from a string array, updates storage, and notifies renderer.
   * @param arrayKey - The key of the array in the storage.
   * @param cardId - The ID of the card to remove.
   * @param channel - The IPC channel to notify.
   */
  private removeFromCardStringArray(
    arrayKey: 'autoUpdateCards' | 'autoUpdateExtensions' | 'pinnedCards',
    cardId: string,
    channel: string,
  ): void {
    const currentArray = this.getData('cards')[arrayKey];
    const updatedArray = currentArray.filter(id => id !== cardId);

    this.updateData('cards', {[arrayKey]: updatedArray});
    sendToMain(channel, updatedArray);
  }

  /**
   * Helper: Finds or creates a card config entry and returns its index.
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
   * Helper: Finds existing URL index by comparing normalized URLs.
   */
  private async findUrlIndex(addressArray: string[], url: string): Promise<number> {
    for (let i = 0; i < addressArray.length; i++) {
      if (!isValidURL([addressArray[i], url])) continue;
      if (await compareUrls(addressArray[i], url)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Helper: Adds a URL to a browser array, moving existing entry to front if found.
   */
  private async addBrowserUrl(
    arrayKey: 'recentAddress' | 'favoriteAddress' | 'historyAddress',
    url: string,
  ): Promise<void> {
    const addressArray = this.getBrowserDataSecurely()[arrayKey];
    const existingUrlIndex = await this.findUrlIndex(addressArray, url);

    // Move to front if exists, otherwise prepend
    const updatedArray =
      existingUrlIndex !== -1
        ? [url, ...addressArray.slice(0, existingUrlIndex), ...addressArray.slice(existingUrlIndex + 1)]
        : [url, ...addressArray];

    this.updateBrowserDataSecurely({[arrayKey]: updatedArray});
  }

  /**
   * Helper: Removes a URL from a browser array.
   */
  private removeBrowserUrl(arrayKey: 'recentAddress' | 'favoriteAddress' | 'historyAddress', url: string): void {
    const addressArray = this.getBrowserDataSecurely()[arrayKey];
    this.updateBrowserDataSecurely({[arrayKey]: addressArray.filter(address => address !== url)});
  }

  /**
   * Decrypts browser data and caches it for secure access.
   * Must be called before accessing browser data securely.
   */
  public decryptBrowserData(): void {
    const rawData = this.getData('browser');
    this.decryptedBrowserData = {
      recentAddress: decryptStrings(rawData.recentAddress),
      favoriteAddress: decryptStrings(rawData.favoriteAddress),
      historyAddress: decryptStrings(rawData.historyAddress),
      favIcons: rawData.favIcons.map(item => ({
        url: decryptString(item.url),
        favIcon: decryptString(item.favIcon),
        title: item.title ? decryptString(item.title) : undefined,
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

    AddBreadcrumb_Main(
      `Card Arguments Configured: cardId:${cardId}, activePreset:${args.activePreset}, ` +
        `args:${JSON.stringify(args.data)}`,
    );
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
   * Gets card arguments, loading from module if not cached.
   */
  public async getCardArgumentsById(cardId: string): Promise<ChosenArgumentsData> {
    const moduleManager = await classHolder.waitForClass('moduleManager');
    const args = this.getArgs(cardId);
    if (args) return args;

    const getResult = (argData?: ChosenArgument[]) => {
      return {
        activePreset: 'Default',
        data: [{preset: 'Default', arguments: argData || []}],
      };
    };

    const moduleMethods = moduleManager.getMethodsById(cardId);
    if (!moduleMethods) return getResult();
    const argReader = moduleMethods().readArgs;
    if (!argReader) return getResult();

    // Load arguments from module if not in storage
    const returnArgs = await argReader();

    const result = getResult(returnArgs);
    this.setArgs(cardId, result);

    return result;
  }

  public async setCardArguments(cardId: string, args: ChosenArgumentsData): Promise<void> {
    const moduleManager = await classHolder.waitForClass('moduleManager');
    this.setArgs(cardId, args);

    const result = args.data.find(arg => arg.preset === args.activePreset)?.arguments || [];

    const moduleMethods = moduleManager.getMethodsById(cardId);
    if (!moduleMethods) return;
    const argSaver = moduleMethods().saveArgs;
    if (!argSaver) return;

    await argSaver(result);
  }

  public addInstalledCard(card: InstalledCard): void {
    classHolder.waitForClass('cardsValidator').then(cardsValidator => {
      const storedCards = this.getData('cards').installedCards;

      const cardExists = storedCards.some(c => c.id === card.id);

      if (!cardExists) {
        if (card.dir && isPortable()) {
          card.dir = getRelativePath(getExePath(), card.dir);
        }
        const installedCards: InstalledCards = [...storedCards, card];

        this.updateData('cards', {installedCards});

        sendToMain(storageUtilsChannels.onInstalledCards, uniqBy(installedCards, 'id'));

        cardsValidator.changedCards();
      }
    });
  }

  public removeInstalledCard(id: string): void {
    classHolder.waitForClass('cardsValidator').then(cardsValidator => {
      const storedCards = this.getData('cards').installedCards;

      const installedCards = storedCards.filter(card => card.id !== id);

      this.updateData('cards', {installedCards});

      sendToMain(storageUtilsChannels.onInstalledCards, installedCards);

      cardsValidator.changedCards();
    });
  }

  public removeInstalledCardByPath(dir: string): void {
    const installedCards = this.getData('cards').installedCards.filter(
      card => getAbsolutePath(getExePath(), card.dir || '') !== getAbsolutePath(getExePath(), dir),
    );
    this.updateData('cards', {installedCards});
    sendToMain(storageUtilsChannels.onInstalledCards, installedCards);
  }

  public addAutoUpdateCard(cardId: string): void {
    this.addToCardStringArray('autoUpdateCards', cardId, storageUtilsChannels.onAutoUpdateCards);
  }

  public removeAutoUpdateCard(cardId: string): void {
    this.removeFromCardStringArray('autoUpdateCards', cardId, storageUtilsChannels.onAutoUpdateCards);
  }

  public addAutoUpdateExtensions(cardId: string): void {
    this.addToCardStringArray('autoUpdateExtensions', cardId, storageUtilsChannels.onAutoUpdateExtensions);
  }

  public removeAutoUpdateExtensions(cardId: string): void {
    this.removeFromCardStringArray('autoUpdateExtensions', cardId, storageUtilsChannels.onAutoUpdateExtensions);
  }

  public addPinnedCard(cardId: string): void {
    this.addToCardStringArray('pinnedCards', cardId, storageUtilsChannels.onPinnedCardsChange);
  }

  public removePinnedCard(cardId: string): void {
    this.removeFromCardStringArray('pinnedCards', cardId, storageUtilsChannels.onPinnedCardsChange);
  }

  /**
   * Generic handler for storage operations with consistent patterns.
   */
  private handleGenericStorageOperation<T>(
    opt: StorageOperation | RecentlyOperation,
    handlers: {
      add?: () => void;
      remove?: () => void;
      get?: () => T;
      set?: () => void;
      update?: () => void;
    },
  ): T | undefined {
    switch (opt) {
      case 'add':
        handlers.add?.();
        break;
      case 'remove':
        handlers.remove?.();
        break;
      case 'get':
        return handlers.get?.();
      case 'set':
        handlers.set?.();
        break;
      case 'update':
        handlers.update?.();
        break;
    }
    return undefined;
  }

  public pinnedCardsOpt(opt: StorageOperation, id: string, pinnedCards?: string[]): string[] {
    return (
      this.handleGenericStorageOperation<string[]>(opt, {
        add: () => this.addPinnedCard(id),
        remove: () => this.removePinnedCard(id),
        get: () => this.getData('cards').pinnedCards,
        set: () => {
          this.updateData('cards', {pinnedCards});
          sendToMain(storageUtilsChannels.onPinnedCardsChange, pinnedCards || []);
        },
      }) || []
    );
  }

  public updateRecentlyUsedCards(id: string): void {
    // Remove if exists, then add to front
    const newArray = this.getData('cards').recentlyUsedCards.filter(cardId => cardId !== id);
    newArray.unshift(id);
    const result = newArray.slice(0, 5);

    this.updateData('cards', {recentlyUsedCards: result});
    sendToMain(storageUtilsChannels.onRecentlyUsedCardsChange, result);
  }

  public recentlyUsedCardsOpt(opt: RecentlyOperation, id: string): string[] {
    return (
      this.handleGenericStorageOperation<string[]>(opt, {
        update: () => this.updateRecentlyUsedCards(id),
        get: () => this.getData('cards').recentlyUsedCards,
      }) || []
    );
  }

  public setHomeCategory(data: string[]): void {
    this.updateData('app', {homeCategory: data});
    sendToMain(storageUtilsChannels.onHomeCategory, data);
  }

  public handleHomeCategoryOperation(opt: StorageOperation, data: string[]): HomeCategory {
    return (
      this.handleGenericStorageOperation<HomeCategory>(opt, {
        set: () => this.setHomeCategory(data),
        get: () => this.getData('app').homeCategory,
      }) || []
    );
  }

  /**
   * Generic handler for card command operations (preCommands, customRun).
   */
  private handleCardCommandOperation(
    configKey: 'preCommands' | 'customRun',
    operation: 'add' | 'set' | 'remove',
    cardId: string,
    commandData: string | string[] | number,
    ipcChannel?: (data: {commands: string[]; id: string}) => void,
  ): void {
    const configArray = this.getData('cardsConfig')[configKey];
    AddBreadcrumb_Main(
      `Card Config Command Operation: key:${configKey}, operation:${operation}, ` +
        `cardId:${cardId}, payload:${JSON.stringify(commandData)}`,
    );

    switch (operation) {
      case 'add': {
        const {item} = this.findOrCreateCardConfig(configArray, cardId, () => ({cardId, data: []}));
        item.data.push(commandData as string);
        ipcChannel?.({commands: item.data, id: cardId});
        this.updateData('cardsConfig', {[configKey]: configArray});
        break;
      }

      case 'set': {
        const {item} = this.findOrCreateCardConfig(configArray, cardId, () => ({cardId, data: []}));
        item.data = commandData as string[];
        this.updateData('cardsConfig', {[configKey]: configArray});
        break;
      }

      case 'remove': {
        const indexFound = configArray.findIndex(item => item.cardId === cardId);
        if (indexFound !== -1) {
          configArray[indexFound].data.splice(commandData as number, 1);
          ipcChannel?.({commands: configArray[indexFound].data, id: cardId});
          this.updateData('cardsConfig', {[configKey]: configArray});
        }
        break;
      }
    }
  }

  public addPreCommand(cardId: string, command: string): void {
    this.handleCardCommandOperation('preCommands', 'add', cardId, command, commands =>
      sendToMain(storageUtilsChannels.onPreCommands, commands),
    );
  }

  public setPreCommand(cardId: string, commands: string[]): void {
    this.handleCardCommandOperation('preCommands', 'set', cardId, commands);
  }

  public removePreCommand(cardId: string, index: number): void {
    this.handleCardCommandOperation('preCommands', 'remove', cardId, index, commands =>
      sendToMain(storageUtilsChannels.onPreCommands, commands),
    );
  }

  public handlePreCommandOperation(opt: StorageOperation, data: PreCommands): string[] {
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
        if (Array.isArray(data.command)) this.setPreCommand(data.id, data.command);
        break;
    }

    return result;
  }

  public addCustomRun(cardId: string, command: string): void {
    this.handleCardCommandOperation('customRun', 'add', cardId, command, commands =>
      sendToMain(storageUtilsChannels.onCustomRun, commands),
    );
  }

  public setCustomRun(cardId: string, commands: string[]): void {
    this.handleCardCommandOperation('customRun', 'set', cardId, commands);
  }

  public removeCustomRun(cardId: string, index: number): void {
    this.handleCardCommandOperation('customRun', 'remove', cardId, index, commands =>
      sendToMain(storageUtilsChannels.onCustomRun, commands),
    );
  }

  public handleCustomRunOperation(opt: StorageOperation, data: PreCommands): string[] {
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
        if (Array.isArray(data.command)) this.setCustomRun(data.id, data.command);
        break;
    }

    return result;
  }

  public addPreOpen(cardId: string, open: {type: 'folder' | 'file'; path: string}): void {
    const preOpen = this.getData('cardsConfig').preOpen;
    const existingCustomRunIndex = preOpen.findIndex(custom => custom.cardId === cardId);

    let targetOpen = open;
    if (targetOpen.path && isPortable()) {
      targetOpen = {type: targetOpen.type, path: getRelativePath(getExePath(), open.path)};
    }

    AddBreadcrumb_Main(`Card Pre-Open Added: cardId:${cardId}, type:${targetOpen.type}, ` + `path:${targetOpen.path}`);

    if (existingCustomRunIndex !== -1) {
      preOpen[existingCustomRunIndex].data.push(targetOpen);
    } else {
      preOpen.push({cardId, data: [targetOpen]});
    }
    this.updateData('cardsConfig', {preOpen});
  }

  public removePreOpen(cardId: string, index: number): void {
    const preOpen = this.getData('cardsConfig').preOpen;
    const existCommand = preOpen.findIndex(command => command.cardId === cardId);

    if (existCommand !== -1) {
      const removedItem = preOpen[existCommand].data[index];
      AddBreadcrumb_Main(`Card Pre-Open Removed: cardId:${cardId}, item:${JSON.stringify(removedItem)}`);
      preOpen[existCommand].data.splice(index, 1);
    }
    this.updateData('cardsConfig', {preOpen});
  }

  public handlePreOpenOperation(opt: StorageOperation, data: PreOpen): PreOpenData {
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
   * Updates custom run behavior for a card, merging with defaults if new.
   */
  public updateCustomRunBehavior(data: Partial<CustomRunBehaviorData>): void {
    if (!data.cardID) return;

    AddBreadcrumb_Main(`Card Run Behavior Updated: cardId:${data.cardID}, payload:${JSON.stringify(data)}`);

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
   * Updates the last window size/position.
   * Preserves previous bounds if window is maximized.
   */
  public updateLastSize(): void {
    classHolder.waitForClass('appManager').then(appManager => {
      const isMaximized = appManager.getMainWindow()?.isMaximized() || false;
      const bounds = appManager.getMainWindow()?.getBounds();

      const prevBounds = this.getData('app').lastSize?.bounds;

      this.updateData('app', {
        lastSize: {
          maximized: isMaximized,
          bounds: isMaximized ? prevBounds : bounds, // Keep previous bounds when maximized
        },
      });
    });
  }

  public getBrowserDataSecurely(): BrowserHistoryData {
    return this.decryptedBrowserData;
  }

  /**
   * Updates browser data: updates decrypted cache and encrypts before storing.
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
      encryptedData.recentAddress = encryptStrings(encryptedData.recentAddress);
    }
    if (encryptedData.favoriteAddress) {
      encryptedData.favoriteAddress = encryptStrings(encryptedData.favoriteAddress);
    }
    if (encryptedData.historyAddress) {
      encryptedData.historyAddress = encryptStrings(encryptedData.historyAddress);
    }
    if (encryptedData.favIcons) {
      encryptedData.favIcons = encryptedData.favIcons.map(item => ({
        url: encryptString(item.url),
        favIcon: encryptString(item.favIcon),
        title: item.title ? encryptString(item.title) : undefined,
      }));
    }

    this.updateData('browser', encryptedData);
  }

  public async addBrowserRecent(recentEntry: string): Promise<void> {
    await this.addBrowserUrl('recentAddress', recentEntry);
  }

  /**
   * Adds or updates a favicon for a URL.
   * Updates existing entry if URL matches, otherwise adds new entry.
   */
  public async addBrowserFavIcon(url: string, icon: string, title?: string): Promise<void> {
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
   * Updates the title for an existing favicon entry.
   */
  public async updateBrowserFavIconTitle(url: string, title: string): Promise<void> {
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

  public async addBrowserFavorite(favoriteEntry: string): Promise<void> {
    await this.addBrowserUrl('favoriteAddress', favoriteEntry);
  }

  public async addBrowserHistory(historyEntry: string): Promise<void> {
    await this.addBrowserUrl('historyAddress', historyEntry);
  }

  public removeBrowserRecent(url: string): void {
    this.removeBrowserUrl('recentAddress', url);
  }

  public removeBrowserFavorite(url: string): void {
    this.removeBrowserUrl('favoriteAddress', url);
  }

  public removeBrowserHistory(url: string): void {
    this.removeBrowserUrl('historyAddress', url);
  }

  public setShowConfirm(type: ConfirmMenuTypes, enable: boolean): void {
    const prevState = this.getData('app');
    prevState[type] = enable;

    sendToMain(storageUtilsChannels.onConfirmChange, type, enable);

    this.write();
  }

  public addReadNotif(id: string): void {
    const prevReadNotifs = this.getData('notification').readNotifs;

    if (prevReadNotifs.includes(id)) return;

    this.updateData('notification', {readNotifs: [...prevReadNotifs, id]});

    // Asynchronously sync the dismissal to the website if logged in
    getTokens(AUTH_LOGIN_KEY)
      .then(async token => {
        if (token) {
          try {
            await axios.post(
              `${LYNXHUB_WEBSITE}/api/notifications/dismiss`,
              {notificationId: id},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                timeout: 5000,
              },
            );
          } catch (error) {
            console.error(
              'Failed to sync notification dismissal to website:',
              axios.isAxiosError(error) ? error.message : error,
            );
          }
        }
      })
      .catch(err => {
        console.error('Error retrieving login token for notification dismissal sync:', err);
      });
  }

  /**
   * Sets terminal pre-commands for a card.
   * Adds platform-specific line endings (CRLF for Windows, LF for Unix).
   */
  public setCardTerminalPreCommands(id: string, commands: string[]): void {
    const commandLines = commands.map(command => `${command}${terminalLineEnding}`);
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
   * Unassigns a card and optionally clears all its configurations.
   */
  public unassignCard(id: string, clearConfigs: boolean): void {
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
