import {Result} from 'antd';
import {LayoutGroup} from 'framer-motion';
import {compact, isEmpty} from 'lodash';
import {FC, useMemo} from 'react';

import {useModules} from '../../Modules/ModulesContext';
import {AvailablePages} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import Page from '../Pages/Page';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

export function GetComponentsByPath({routePath, extensionsElements}: {routePath: string; extensionsElements?: FC[]}) {
  const {getCardsByPath} = useModules();

  const cards = getCardsByPath(routePath as AvailablePages);
  const installedCards = useCardsState('installedCards');
  const pinnedCards = useCardsState('pinnedCards');

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
            {sortedCards.map((card, index) => {
              const isInstalled = installedCards.some(iCard => iCard.id === card.id);
              return (
                <CardContext.Provider key={`cardProv-${index}`} value={new CardsDataManager(card, isInstalled)}>
                  <LynxCard key={`${card.id}-card-key`} />
                </CardContext.Provider>
              );
            })}
          </LayoutGroup>
          {extensionsElements?.map((Comp, index) => <Comp key={index} />)}
        </>
      )}
    </div>
  );
}
