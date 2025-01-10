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

/**
 * Retrieves the arguments for a specific card.
 * @param id The ID of the card.
 * @returns The arguments data or undefined if not found.
 */
const getArgumentsByID = (id: string): ArgumentsData | undefined => allCards.find(card => card.id === id)?.arguments;

/**
 * Retrieves all cards associated with a specific path.
 * @param path The path to filter cards by.
 * @returns An array of cards or undefined if no module matches the path.
 */
const getCardsByPath = (path: AvailablePages): CardData[] | undefined =>
  allModules.find(module => module.routePath === path)?.cards;

/**
 * Retrieves a specific method for a specific card.
 * @param id The ID of the card.
 * @param method The name of the method to retrieve.
 * @returns The method or undefined if not found.
 */
const getMethod = <T extends keyof CardRendererMethods>(id: string, method: T): CardRendererMethods[T] | undefined =>
  allCards.find(card => card.id === id)?.methods?.[method] as CardRendererMethods[T] | undefined;

const getInstallType = (id: string) => allCards.find(card => card.id === id)?.installationType || 'others';

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
  getArgumentsByID: (id: string) => ArgumentsData | undefined;
  getCardsByPath: (path: AvailablePages) => CardData[] | undefined;
  getMethod: <T extends keyof CardRendererMethods>(id: string, method: T) => CardRendererMethods[T] | undefined;
};

export {allCards, allModules, getArgumentsByID, getCardsByPath, getInstallType, getMethod};

export default loadModules;
