import {createContext, memo, useContext, useMemo} from 'react';

import {LoadedCardData} from '../../../../../../cross/plugin/ModuleTypes';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {CardState, CardStore, createCardStore} from '../CardStore';
import LynxCard from './LynxCard';

const CardStoreContext = createContext<CardStore | null>(null);

type Props = {cardData: LoadedCardData; isInstalled: boolean; hasArguments: boolean};

const LynxCardWrapper = memo(({cardData, isInstalled, hasArguments}: Props) => {
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  const storeValue = useMemo(
    () => createCardStore({...cardData, isInstalled, hasArguments}),
    [cardData, isInstalled, hasArguments],
  );

  return (
    <CardStoreContext.Provider value={storeValue}>
      {ReplaceComponent ? (
        <ReplaceComponent useCardStore={useCardStore} key={`${cardData.id}-card-key`} />
      ) : (
        <LynxCard key={`${cardData.id}-card-key`} />
      )}
    </CardStoreContext.Provider>
  );
});

export default LynxCardWrapper;

export const useCardStore = <T,>(selector: (state: CardState) => T): T => {
  const store = useContext(CardStoreContext);
  if (!store) throw new Error('Missing CardStoreContext.Provider');
  return store(selector);
};
