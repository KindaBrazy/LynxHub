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

/**
 * Duplicate a card
 * @param id The card id to duplicate.
 */
const duplicateCard = (id: string) => {
  let newCard: CardData | undefined = undefined;
  let ogPath: string = '';
  const newId = `${id}_${Date.now()}`;

  allModules.forEach(page => {
    const found = page.cards.find(card => card.id === id);
    if (found) {
      newCard = {...found, id: newId};
      ogPath = page.routePath;
    }
  });

  if (!newCard) return;

  allModules.map(page => {
    if (page.routePath !== ogPath) return page;
    return {routePath: page.routePath, cards: [...page.cards, newCard]};
  });

  allCards = [...allCards, newCard];

  emitChange();
};

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

    allModules = newAllModules;
    allCards = newAllCards;
    emitChange();
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
  useAllCards,
  useGetArgumentsByID,
  useGetCardsByPath,
  useGetInstallType,
};

export default loadModules;
