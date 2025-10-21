import {compact} from 'lodash';
import {useSyncExternalStore} from 'react';

import {AvailablePageIDs} from '../../../../cross/CrossConstants';
import {extractGitUrl, isDev} from '../../../../cross/CrossUtils';
import {
  ArgumentsData,
  CardData,
  CardModules,
  CardRendererMethods,
  LoadedArguments,
  LoadedCardData,
  LoadedMethods,
  RendererModuleImportType,
} from '../../../../cross/plugin/ModuleTypes';
import rendererIpc from '../RendererIpc';
import {searchInStrings} from '../Utils/UtilFunctions';

type CardSearchData = {id: string; data: string[]}[];

let allModules: CardModules = [];
let allCards: CardData[] = [];

let allCardDataWithPath: LoadedCardData[] = [];
let allCardArguments: LoadedArguments[] = [];
let allCardMethods: LoadedMethods[] = [];
let allCardSearchData: CardSearchData = [];
let hasArguments: Set<string> = new Set([]);

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const useAllModules = (): CardModules => useSyncExternalStore(subscribe, () => allModules);

const useAllCardDataWithPath = (): LoadedCardData[] => useSyncExternalStore(subscribe, () => allCardDataWithPath);
const useAllCardArguments = (): LoadedArguments[] => useSyncExternalStore(subscribe, () => allCardArguments);
const useAllCardMethods = (): LoadedMethods[] => useSyncExternalStore(subscribe, () => allCardMethods);
const useAllCardSearchData = (): CardSearchData => useSyncExternalStore(subscribe, () => allCardSearchData);
const useHasArguments = (): Set<string> => useSyncExternalStore(subscribe, () => hasArguments);

const splitCardData = (card: CardData, routePath: AvailablePageIDs, originalId: string) => {
  const {arguments: args, methods, ...restOfCard} = card;

  const originalIndex = allCardDataWithPath.findIndex(c => c.id === originalId);

  if (originalIndex !== -1) {
    allCardDataWithPath = [
      ...allCardDataWithPath.slice(0, originalIndex + 1),
      {...restOfCard, routePath},
      ...allCardDataWithPath.slice(originalIndex + 1),
    ];

    allCardArguments = [
      ...allCardArguments.slice(0, originalIndex + 1),
      {id: card.id, arguments: args},
      ...allCardArguments.slice(originalIndex + 1),
    ];

    allCardMethods = [
      ...allCardMethods.slice(0, originalIndex + 1),
      {id: card.id, methods},
      ...allCardMethods.slice(originalIndex + 1),
    ];

    allCardSearchData = [
      ...allCardSearchData.slice(0, originalIndex + 1),
      {
        id: card.id,
        data: [card.description, card.title, extractGitUrl(card.repoUrl).owner, extractGitUrl(card.repoUrl).repo],
      },
      ...allCardSearchData.slice(originalIndex + 1),
    ];
  } else {
    // If original card is not found, add the new data to the end of a new array
    allCardDataWithPath = [...allCardDataWithPath, {...restOfCard, routePath}];
    allCardArguments = [...allCardArguments, {id: card.id, arguments: args}];
    allCardMethods = [...allCardMethods, {id: card.id, methods}];
    allCardSearchData = [
      ...allCardSearchData,
      {
        id: card.id,
        data: [card.description, card.title, extractGitUrl(card.repoUrl).owner, extractGitUrl(card.repoUrl).repo],
      },
    ];
  }

  if (args) hasArguments.add(card.id);
};

/**
 * Retrieves the arguments for a specific card.
 * @param id The ID of the card.
 * @returns The arguments data or undefined if not found.
 */
const useGetArgumentsByID = (id: string): ArgumentsData | undefined =>
  useAllCardArguments().find(card => card.id === id)?.arguments;

const useSearchCards = (searchValue: string) => {
  const searchData = useAllCardSearchData();
  return allCardDataWithPath.filter(card =>
    searchInStrings(searchValue, searchData.find(data => data.id === card.id)?.data),
  );
};

/**
 * Retrieves all cards associated with a specific path.
 * @param path The path to filter cards by.
 * @returns An array of cards or undefined if no module matches the path.
 */
const useGetCardsByPath = (path: AvailablePageIDs): LoadedCardData[] | undefined =>
  useAllCardDataWithPath().filter(module => module.routePath === path);

const hasCardsByPath = (path: AvailablePageIDs | string): boolean => {
  return allCardDataWithPath.some(card => card.routePath === path);
};

const getCardMethod = <T extends keyof CardRendererMethods>(
  cardMethods: LoadedMethods[],
  id: string,
  method: T,
): CardRendererMethods[T] | undefined => {
  return cardMethods.find(card => card.id === id)?.methods?.[method] as CardRendererMethods[T] | undefined;
};

const useGetInstallType = (id: string) =>
  useAllCardDataWithPath().find(card => card.id === id)?.installationType || 'others';
const useGetUninstallType = (id: string) =>
  useAllCardDataWithPath().find(card => card.id === id)?.uninstallType || 'removeFolder';

/**
 * Duplicate a card
 */
const duplicateCard = (id: string, defaultID?: string, defaultTitle?: string) => {
  let newId: string = '';
  let newTitle: string = '';
  let routePath: AvailablePageIDs = 'imageGen_page';

  // Function to generate the next ID
  const generateNewId = (baseId: string): string => {
    let counter = 2;
    let newId = `${baseId}_${counter}`;

    while (allCards.some(card => card.id === newId)) {
      counter++;
      newId = `${baseId}_${counter}`;
    }

    return newId;
  };

  const generateNewTitle = (ogTitle: string) => {
    let counter = 2;
    let newTitle = `${ogTitle} (${counter})`;

    while (allCards.some(card => card.title === newTitle)) {
      counter++;
      newTitle = `${ogTitle} (${counter})`;
    }

    return newTitle;
  };

  // Use find and map together for efficiency
  let duplicatedCard: CardData | undefined;
  const updatedModules = allModules.map(page => {
    const cardIndex = page.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return page; // Card not found in this page
    }

    // Card found, duplicate and add to the page
    const originalCard = page.cards[cardIndex];
    newId = defaultID || generateNewId(originalCard.id);
    newTitle = defaultTitle || generateNewTitle(originalCard.title);
    duplicatedCard = {...originalCard, id: newId, title: newTitle}; // Add new title
    const updatedCards = [...page.cards];
    updatedCards.splice(cardIndex + 1, 0, duplicatedCard);

    routePath = page.routePath;

    return {...page, cards: updatedCards};
  });

  if (!duplicatedCard) {
    return undefined; // Card not found at all
  }

  allModules = updatedModules;
  allCards = [...allCards, duplicatedCard];

  splitCardData(duplicatedCard, routePath, id);

  emitChange();

  console.log('duplicated');

  return {id: newId, title: newTitle, routePath};
};

const removeDuplicatedCard = (id: string) => {
  let cardRemoved = false;

  // Remove from allModules
  const updatedModules = allModules.map(page => {
    const cardIndex = page.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return page; // Card not found in this page
    }

    cardRemoved = true;
    const updatedCards = [...page.cards];
    updatedCards.splice(cardIndex, 1);

    return {...page, cards: updatedCards};
  });

  // Remove from allCards
  const initialAllCardsLength = allCards.length;
  allCards = allCards.filter(card => card.id !== id);
  if (allCards.length !== initialAllCardsLength) {
    cardRemoved = true;
  }

  if (cardRemoved) {
    allModules = updatedModules;
    allCardDataWithPath = allCardDataWithPath.filter(card => card.id !== id);
    hasArguments.delete(id);
    allCardArguments = allCardArguments.filter(arg => arg.id !== id);
    allCardMethods = allCardMethods.filter(method => method.id !== id);
    allCardSearchData = allCardSearchData.filter(card => card.id !== id);
    emitChange();
  }
};

async function emitLoaded(
  _newAllModules: CardModules,
  _newAllCards: CardData[],
  _newCardDataWithPath: LoadedCardData[],
  _newCardArguments: LoadedArguments[],
  _newCardMethods: LoadedMethods[],
  _newCardSearchData: CardSearchData,
) {
  const {duplicated} = await rendererIpc.storage.get('cards');

  allModules = _newAllModules;
  allCards = _newAllCards;
  allCardDataWithPath = _newCardDataWithPath;
  allCardArguments = _newCardArguments;
  hasArguments = new Set(_newCardArguments.filter(arg => !!arg.arguments).map(item => item.id));
  allCardMethods = _newCardMethods;
  allCardSearchData = _newCardSearchData;

  duplicated.forEach(item => duplicateCard(item.ogID, item.id, item.title));

  emitChange();
}

/**
 * Loads all modules and their associated cards.
 * This function fetches module data, imports the corresponding modules,
 * and sets the `allModules` and `allCards` variables.
 */
const loadModules = async () => {
  try {
    let importedModules: ({path: string; module: RendererModuleImportType} | null)[];

    if (isDev()) {
      const devImport = await import('../../../../../module/src/renderer');
      importedModules = [{path: 'dev', module: devImport}];
    } else {
      const pluginAddresses = await rendererIpc.plugins.getAddresses();
      const moduleAddresses = pluginAddresses.filter(item => item.type === 'module').map(item => item.address);

      // Use Promise.all for concurrent module imports
      importedModules = await Promise.all(
        moduleAddresses.map(async path => {
          try {
            const module = await import(/* @vite-ignore */ `${path}/scripts/renderer.mjs?${Date.now()}`);
            return {path, module};
          } catch (e) {
            console.error('Failed to load module renderer entry: ', path, 'Error: ', e);
            return null;
          }
        }),
      );
    }

    const newAllModules: CardModules = [];
    const newAllCards: CardData[] = [];

    const newCardDataWithPath: LoadedCardData[] = [];
    const newCardArguments: LoadedArguments[] = [];
    const newCardMethods: LoadedMethods[] = [];
    const newCardSearchData: CardSearchData = [];

    // Optimize module and card aggregation using reduce for better performance
    compact(importedModules).reduce((acc, {module}) => {
      const importedModule = module as RendererModuleImportType;

      importedModule.default.forEach(mod => {
        const existingModuleIndex = newAllModules.findIndex(m => m.routePath === mod.routePath);

        if (existingModuleIndex !== -1) {
          // Add new cards to existing module, avoiding duplicates
          const existingModule = newAllModules[existingModuleIndex];
          mod.cards.forEach(card => {
            if (!existingModule.cards.some(c => c.id === card.id)) {
              existingModule.cards.push(card);
              newAllCards.push(card);
            }
          });
        } else {
          newAllModules.push(mod);
          newAllCards.push(...mod.cards);

          mod.cards.forEach(card => {
            const {arguments: args, methods, ...restOfCard} = card;
            newCardDataWithPath.push({...restOfCard, routePath: mod.routePath});
            newCardArguments.push({id: card.id, arguments: args});
            newCardMethods.push({id: card.id, methods});
            newCardSearchData.push({
              id: card.id,
              data: [card.description, card.title, extractGitUrl(card.repoUrl).owner, extractGitUrl(card.repoUrl).repo],
            });
          });
        }
      });

      return acc;
    }, {});

    await emitLoaded(
      newAllModules,
      newAllCards,
      newCardDataWithPath,
      newCardArguments,
      newCardMethods,
      newCardSearchData,
    );
  } catch (error) {
    console.error('Error importing modules:', error);
  }
};

export {
  allCards,
  allModules,
  duplicateCard,
  getCardMethod,
  hasCardsByPath,
  loadModules,
  removeDuplicatedCard,
  useAllCardArguments,
  useAllCardDataWithPath,
  useAllCardMethods,
  useAllCardSearchData,
  useAllModules,
  useGetArgumentsByID,
  useGetCardsByPath,
  useGetInstallType,
  useGetUninstallType,
  useHasArguments,
  useSearchCards,
};

export default loadModules;
