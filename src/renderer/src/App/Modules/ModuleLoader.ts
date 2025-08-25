import {
  ArgumentsData,
  AvailablePages,
  CardData,
  CardModules,
  CardRendererMethods,
  LoadedArguments,
  LoadedCardData,
  LoadedMethods,
} from '@lynx_module/types';
import {RendererModuleImportType} from '@lynx_module/types';
import {useSyncExternalStore} from 'react';

import {extractGitUrl, isDev} from '../../../../cross/CrossUtils';
import rendererIpc from '../RendererIpc';
import {searchInStrings} from '../Utils/UtilFunctions';

/** TODO: Add these:
 * Have have Arguments
 * searchData in CardsByCategory
 *  */

let allModules: CardModules = [];
let allCards: CardData[] = [];

let allCardData: LoadedCardData[] = [];
let allCardArguments: LoadedArguments[] = [];
let allCardMethods: LoadedMethods[] = [];

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

const useAllCards = (): CardData[] => useSyncExternalStore(subscribe, () => allCards);
const useAllModules = (): CardModules => useSyncExternalStore(subscribe, () => allModules);

const useAllCardData = (): LoadedCardData[] => useSyncExternalStore(subscribe, () => allCardData);
const useAllCardArguments = (): LoadedArguments[] => useSyncExternalStore(subscribe, () => allCardArguments);
const useAllCardMethods = (): LoadedMethods[] => useSyncExternalStore(subscribe, () => allCardMethods);

const splitCardData = (card: CardData) => {
  const {arguments: args, methods, ...restOfCard} = card;
  allCardData.push(restOfCard);
  allCardArguments.push({id: card.id, arguments: args});
  allCardMethods.push({id: card.id, methods});
};

/**
 * Retrieves the arguments for a specific card.
 * @param id The ID of the card.
 * @returns The arguments data or undefined if not found.
 */
const useGetArgumentsByID = (id: string): ArgumentsData | undefined =>
  useAllCardArguments().find(card => card.id === id)?.arguments;

const useHasArguments = (id: string): boolean => {
  const args = useGetArgumentsByID(id);
  return !!args && Object.keys(args).length > 0;
};

const useSearchCards = (searchValue: string) => {
  const allCards = useAllCardData();
  const searchData = allCards.map(card => ({
    id: card.id,
    data: [card.description, card.title, extractGitUrl(card.repoUrl).owner, extractGitUrl(card.repoUrl).repo],
  }));
  return allCards.filter(card => searchInStrings(searchValue, searchData.find(data => data.id === card.id)?.data));
};

/**
 * Retrieves all cards associated with a specific path.
 * @param path The path to filter cards by.
 * @returns An array of cards or undefined if no module matches the path.
 */
const useGetCardsByPath = (path: AvailablePages): CardData[] | undefined =>
  useAllModules().find(module => module.routePath === path)?.cards;

const getCardMethod = <T extends keyof CardRendererMethods>(
  cardMethods: LoadedMethods[],
  id: string,
  method: T,
): CardRendererMethods[T] | undefined => {
  return cardMethods.find(card => card.id === id)?.methods?.[method] as CardRendererMethods[T] | undefined;
};

const useGetInstallType = (id: string) => useAllCardData().find(card => card.id === id)?.installationType || 'others';
const useGetUninstallType = (id: string) =>
  useAllCardData().find(card => card.id === id)?.uninstallType || 'removeFolder';

/**
 * Duplicate a card
 */
const duplicateCard = (id: string, defaultID?: string, defaultTitle?: string) => {
  let newId: string = '';
  let newTitle: string = '';
  let routePath: string = '';

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

  splitCardData(duplicatedCard);

  emitChange();

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
    allCardData = allCardData.filter(card => card.id !== id);
    allCardArguments = allCardArguments.filter(arg => arg.id !== id);
    allCardMethods = allCardMethods.filter(method => method.id !== id);
    emitChange();
  }
};

async function emitLoaded(
  _newAllModules: CardModules,
  _newAllCards: CardData[],
  _newCardData: LoadedCardData[],
  _newCardArguments: LoadedArguments[],
  _newCardMethods: LoadedMethods[],
) {
  const {duplicated} = await rendererIpc.storage.get('cards');

  allModules = _newAllModules;
  allCards = _newAllCards;
  allCardData = _newCardData;
  allCardArguments = _newCardArguments;
  allCardMethods = _newCardMethods;

  duplicated.forEach(item => duplicateCard(item.ogID, item.id, item.title));

  emitChange();
}

/**
 * Loads all modules and their associated cards.
 * This function fetches module data, imports the corresponding modules,
 * and sets the `allModules` and `allCards` variables.
 */
const loadModules = async () => {
  // Set up the reload listener initially
  rendererIpc.module.onReload(() => {
    loadModules();
  });

  try {
    let importedModules: {path: string; module: RendererModuleImportType}[];

    if (isDev()) {
      const devImport = await import('../../../../../module/src/renderer');
      importedModules = [{path: 'dev', module: devImport}];
    } else {
      const moduleData = await rendererIpc.module.getModulesData();

      // Use Promise.all for concurrent module imports
      importedModules = await Promise.all(
        moduleData.map(async path => {
          const module = await import(/* @vite-ignore */ `${path}/scripts/renderer.mjs?${Date.now()}`);
          return {path, module};
        }),
      );
    }

    const newAllModules: CardModules = [];
    const newAllCards: CardData[] = [];

    const newCardData: LoadedCardData[] = [];
    const newCardArguments: LoadedArguments[] = [];
    const newCardMethods: LoadedMethods[] = [];

    // Optimize module and card aggregation using reduce for better performance
    importedModules.reduce((acc, {module}) => {
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

          mod.cards.forEach(splitCardData);
        }
      });

      return acc;
    }, {});

    await emitLoaded(newAllModules, newAllCards, newCardData, newCardArguments, newCardMethods);
  } catch (error) {
    console.error('Error importing modules:', error);
    throw error;
  }
};

export type ModuleData = {
  allModules: CardModules;
  allCards: CardData[];
  useGetArgumentsByID: (id: string) => ArgumentsData | undefined;
  useGetCardsByPath: (path: AvailablePages) => CardData[] | undefined;
  getCardMethod: <T extends keyof CardRendererMethods>(
    cards: CardData[],
    id: string,
    method: T,
  ) => CardRendererMethods[T] | undefined;
};

export {
  allCards,
  allModules,
  duplicateCard,
  getCardMethod,
  loadModules,
  removeDuplicatedCard,
  useAllCards,
  useAllModules,
  useGetArgumentsByID,
  useGetCardsByPath,
  useGetInstallType,
  useGetUninstallType,
  useHasArguments,
};

export default loadModules;
