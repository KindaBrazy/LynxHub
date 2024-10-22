import {Result} from 'antd';
import {isEmpty} from 'lodash';

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

  return (
    <div className="flex size-full flex-row flex-wrap gap-7 overflow-y-scroll scrollbar-hide">
      {isEmpty(cards) ? (
        <Page className="content-center">
          <Result
            status="info"
            title="Oops! No cards to display right now"
            subTitle="Please install related modules to see cards"
          />
        </Page>
      ) : (
        cards!.map((card, index) => {
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
