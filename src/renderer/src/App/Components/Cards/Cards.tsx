import {Result} from 'antd';
import {LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {FC, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useGetCardsByPath} from '../../Modules/ModuleLoader';
import {AvailablePages} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import Page from '../Pages/Page';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

export function GetComponentsByPath({routePath, extensionsElements}: {routePath: string; extensionsElements?: FC[]}) {
  const cards = useGetCardsByPath(routePath as AvailablePages);
  const installedCards = useCardsState('installedCards');
  const pinnedCards = useCardsState('pinnedCards');

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  const sortedCards = useMemo(() => {
    const pin = compact(cards?.filter(card => pinnedCards.includes(card.id)));
    const rest = compact(cards?.filter(card => !pinnedCards.includes(card.id)));
    return [...pin, ...rest];
  }, [cards, pinnedCards]);

  return (
    <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
      {isEmpty(sortedCards) && isEmpty(extensionsElements) ? (
        <Page className="content-center">
          <Result
            status="info"
            title="Oops! No cards to display right now"
            subTitle="Please install related modules to see cards"
          />
        </Page>
      ) : (
        <>
          <LayoutGroup id={`${routePath}_cards`}>
            {isNil(ReplaceCards) ? (
              sortedCards.map((card, index) => {
                const isInstalled = installedCards.some(iCard => iCard.id === card.id);
                const context = new CardsDataManager(card, isInstalled);
                return (
                  <CardContext.Provider value={context} key={`cardProv-${index}`}>
                    {ReplaceComponent ? (
                      <ReplaceComponent context={context} key={`${card.id}-card-key`} />
                    ) : (
                      <LynxCard key={`${card.id}-card-key`} />
                    )}
                  </CardContext.Provider>
                );
              })
            ) : (
              <ReplaceCards cards={sortedCards} />
            )}
          </LayoutGroup>
          {extensionsElements?.map((Comp, index) => <Comp key={index} />)}
        </>
      )}
    </div>
  );
}
