import {useSyncExternalStore} from 'react';

import {APP_BUILD_NUMBER} from '../../../../cross/CrossConstants';
import rendererIpc from '../RendererIpc';
import {
  ArgumentsData,
  AvailablePages,
  CardData,
  CardModules,
  CardRendererMethods,
  RendererModuleImportType,
} from './types';

let allModules: CardModules = [];
let allCards: CardData[] = [];

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

/**
 * Retrieves the arguments for a specific card.
 * @param id The ID of the card.
 * @returns The arguments data or undefined if not found.
 */
const useGetArgumentsByID = (id: string): ArgumentsData | undefined =>
  useAllCards().find(card => card.id === id)?.arguments;

const useGetTitleByID = (id: string | undefined): string | undefined =>
  useAllCards().find(card => card.id === id)?.title;

/**
 * Retrieves all cards associated with a specific path.
 * @param path The path to filter cards by.
 * @returns An array of cards or undefined if no module matches the path.
 */
const useGetCardsByPath = (path: AvailablePages): CardData[] | undefined =>
  useAllModules().find(module => module.routePath === path)?.cards;

const getCardMethod = <T extends keyof CardRendererMethods>(
  cards: CardData[],
  id: string,
  method: T,
): CardRendererMethods[T] | undefined => {
  return cards.find(card => card.id === id)?.methods?.[method] as CardRendererMethods[T] | undefined;
};

const useGetInstallType = (id: string) => useAllCards().find(card => card.id === id)?.installationType || 'others';
const useGetUninstallType = (id: string) => useAllCards().find(card => card.id === id)?.uninstallType || 'removeFolder';

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
    emitChange();
  }
};

async function emitLoaded(newAllModules: CardModules, newAllCards: CardData[]) {
  const {duplicated} = await rendererIpc.storage.get('cards');

  allModules = newAllModules;
  allCards = newAllCards;

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
    const moduleData = await rendererIpc.module.getModulesData();

    // Use Promise.all for concurrent module imports
    const importedModules = await Promise.all(
      moduleData.map(async path => {
        const module = await import(/* @vite-ignore */ `${path}/scripts/renderer.mjs?${Date.now()}`);
        return {path, module};
      }),
    );

    const newAllModules: CardModules = [];
    const newAllCards: CardData[] = [];

    // Optimize module and card aggregation using reduce for better performance
    importedModules.reduce((acc, {module}) => {
      const importedModule = module as RendererModuleImportType;

      importedModule.setCurrentBuild?.(APP_BUILD_NUMBER);

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
        }
      });

      return acc;
    }, {});

    await emitLoaded(newAllModules, newAllCards);
  } catch (error) {
    console.error('Error importing modules:', error);
    throw error; // Re-throw to allow for handling at a higher level if needed
  }
};

// Set up the reload listener initially
rendererIpc.module.onReload(() => {
  loadModules();
});

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
  removeDuplicatedCard,
  useAllCards,
  useGetArgumentsByID,
  useGetCardsByPath,
  useGetInstallType,
  useGetTitleByID,
  useGetUninstallType,
};

export default loadModules;
