import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {APP_BUILD_NUMBER} from '../../../../cross/CrossConstants';
import rendererIpc from '../RendererIpc';
import {ArgumentsData, CardData, CardModules, RendererModuleImportType} from './types';

type ModulesContextData = {
  allModules: CardModules;
  allCards: CardData[];
  isLoading: boolean;
  getArgumentsByID: (id: string) => ArgumentsData | undefined;
};

export const ModulesContext = createContext<ModulesContextData>({
  allModules: [],
  allCards: [],
  isLoading: true,
  getArgumentsByID: () => undefined,
});

/** Load app modules and pass to children with context */
const ModulesProvider = ({children}) => {
  const [allModules, setAllModules] = useState<CardModules>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAllModules = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
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

  const contextValue: ModulesContextData = useMemo((): ModulesContextData => {
    return {
      allModules,
      allCards,
      isLoading,
      getArgumentsByID,
    };
  }, [allModules, isLoading]);

  return <ModulesContext.Provider value={contextValue}>{children}</ModulesContext.Provider>;
};

export const useModules = () => {
  return useContext(ModulesContext);
};

export default ModulesProvider;
