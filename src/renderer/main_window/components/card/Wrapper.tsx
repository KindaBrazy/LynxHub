import {extensionsData} from '@lynx/plugins/extensions/loader';
import {CardState} from '@lynx_common/types';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {createContext, memo, useContext, useMemo} from 'react';

import LynxCard from './Card';
import {CardStore, createCardStore} from './store';

const CardStoreContext = createContext<CardStore | null>(null);

type Props = {cardData: LoadedCardData; isInstalled: boolean; hasArguments: boolean};

const Wrapper = memo(({cardData, isInstalled, hasArguments}: Props) => {
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

export default Wrapper;

export const useCardStore = <T,>(selector: (state: CardState) => T): T => {
  const store = useContext(CardStoreContext);
  if (!store) throw new Error('Missing CardStoreContext.Provider');
  return store(selector);
};
