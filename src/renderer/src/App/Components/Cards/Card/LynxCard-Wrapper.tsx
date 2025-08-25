import {LoadedCardData} from '@lynx_module/types';
import {createContext, useContext, useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {CardState, CardStore, createCardStore} from '../CardStore';
import LynxCard from './LynxCard';

const CardStoreContext = createContext<CardStore | null>(null);

type Props = {cardData: LoadedCardData; isInstalled: boolean; hasArguments: boolean};

export default function LynxCardWrapper({cardData, isInstalled, hasArguments}: Props) {
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  const storeValue = useMemo(
    () => createCardStore({...cardData, isInstalled, hasArguments}),
    [cardData, isInstalled, hasArguments],
  );

  return (
    <CardStoreContext.Provider value={storeValue}>
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
