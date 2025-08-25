import {LoadedCardData} from '@lynx_module/types';
import {createContext, useContext, useMemo, useRef} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {useHasArguments} from '../../../Modules/ModuleLoader';
import {CardState, CardStore, createCardStore} from '../CardStore';
import LynxCard from './LynxCard';

const CardStoreContext = createContext<CardStore | null>(null);

type Props = {cardData: LoadedCardData; isInstalled: boolean};

export default function LynxCardWrapper({cardData, isInstalled}: Props) {
  const storeRef = useRef<CardStore | null>(null);
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  const hasArguments = useHasArguments(cardData.id);

  if (!storeRef.current) {
    storeRef.current = createCardStore({...cardData, isInstalled, hasArguments});
  }

  return (
    <CardStoreContext.Provider value={storeRef.current}>
      {ReplaceComponent ? (
        <ReplaceComponent key={`${cardData.id}-card-key`} />
      ) : (
        <LynxCard key={`${cardData.id}-card-key`} />
      )}
    </CardStoreContext.Provider>
  );
}

export const useCardStore = <T,>(selector: (state: CardState) => T): T => {
  const store = useContext(CardStoreContext);
  if (!store) throw new Error('Missing CardStoreContext.Provider');
  return store(selector);
};
