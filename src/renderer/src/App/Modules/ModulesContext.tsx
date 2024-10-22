import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';

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

type ModulesContextData = {
  allModules: CardModules;
  allCards: CardData[];
  loadingModules: boolean;
  getArgumentsByID: (id: string) => ArgumentsData | undefined;
  getAllMethods: (id: string) => CardRendererMethods | undefined;
  getCardsByPath: (path: AvailablePages) => CardData[] | undefined;
  getMethod: <T extends keyof CardRendererMethods>(id: string, method: T) => CardRendererMethods[T] | undefined;
};

export const ModulesContext = createContext<ModulesContextData>({
  allModules: [],
  allCards: [],
  loadingModules: true,
  getArgumentsByID: () => undefined,
  getAllMethods: () => undefined,
  getMethod: () => undefined,
  getCardsByPath: () => undefined,
});

/** Load app modules and pass to children with context */
const ModulesProvider = ({children}: {children: ReactNode}) => {
  const [allModules, setAllModules] = useState<CardModules>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [loadingModules, setLoadingModules] = useState<boolean>(true);

  useEffect(() => {
    const loadAllModules = async () => {
      setLoadingModules(true);
      try {
        const moduleData = await rendererIpc.module.getModulesData();
        const importedModules = await Promise.all(
          moduleData.map(path => import(/* @vite-ignore */ `${path}/scripts/renderer.mjs?${Date.now()}`)),
        );

        const newAllModules = importedModules.reduce((acc: CardModules, importedModule: RendererModuleImportType) => {
          importedModule.setCurrentBuild?.(APP_BUILD_NUMBER);
          importedModule.default.forEach(module => {
            const existingModuleIndex = acc.findIndex(md => md.routePath === module.routePath);
            if (existingModuleIndex !== -1) {
              acc[existingModuleIndex].cards = [
                ...acc[existingModuleIndex].cards,
                ...module.cards.filter(card => !acc[existingModuleIndex].cards.some(c => c.id === card.id)),
              ];
            } else {
              acc.push(module);
            }
          });
          return acc;
        }, []);

        setAllModules(newAllModules);
        setAllCards(newAllModules.flatMap(({cards}) => cards));
      } catch (error) {
        console.error('Error importing modules:', error);
      } finally {
        setLoadingModules(false);
      }
    };

    loadAllModules();

    rendererIpc.module.onReload(() => {
      loadAllModules();
    });
  }, []);

  const getArgumentsByID = useCallback(
    (id: string) => {
      return allCards.find(card => card.id === id)?.arguments;
    },
    [allCards],
  );

  const getCardsByPath = useCallback(
    (path: AvailablePages): CardData[] | undefined => {
      return allModules.find(module => module.routePath === path)?.cards;
    },
    [allModules],
  );

  const getAllMethods = useCallback(
    (id: string): CardRendererMethods | undefined => {
      return allCards.find(card => card.id === id)?.methods;
    },
    [allCards],
  );

  const getMethod = useCallback(
    <T extends keyof CardRendererMethods>(id: string, method: T): CardRendererMethods[T] | undefined => {
      const card = allCards.find(card => card.id === id);
      return card?.methods[method] as CardRendererMethods[T] | undefined;
    },
    [allCards],
  );

  const contextValue: ModulesContextData = useMemo((): ModulesContextData => {
    return {
      allModules,
      allCards,
      loadingModules,
      getArgumentsByID,
      getAllMethods,
      getMethod,
      getCardsByPath,
    };
  }, [allModules, loadingModules]);

  return <ModulesContext.Provider value={contextValue}>{children}</ModulesContext.Provider>;
};

export const useModules = () => {
  return useContext(ModulesContext);
};

export default ModulesProvider;
