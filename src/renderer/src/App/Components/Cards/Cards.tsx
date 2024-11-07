import {Result} from 'antd';
import {compact, isEmpty} from 'lodash';
import {useMemo} from 'react';

import {useModules} from '../../Modules/ModulesContext';
import {AvailablePages} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import Page from '../Pages/Page';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

export function GetComponentsByPath({routePath}: {routePath: string}) {
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
    <div className="flex size-full flex-row flex-wrap gap-7 overflow-y-scroll scrollbar-hide">
      {isEmpty(sortedCards) ? (
        <Page className="content-center">
          <Result
            status="info"
            title="Oops! No cards to display right now"
            subTitle="Please install related modules to see cards"
          />
        </Page>
      ) : (
        sortedCards!.map((card, index) => {
          const isInstalled = installedCards.some(iCard => iCard.id === card.id);
          return (
            <CardContext.Provider key={`cardProv-${index}`} value={new CardsDataManager(card, isInstalled)}>
              <LynxCard key={`${card.id}-card-key`} />
            </CardContext.Provider>
          );
        })
      )}
    </div>
  );
}
