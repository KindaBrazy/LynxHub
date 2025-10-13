import {Result} from 'antd';
import {LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {FC, memo, useMemo} from 'react';

import {AvailablePageIDs} from '../../../../../cross/CrossConstants';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useGetCardsByPath, useHasArguments} from '../../Modules/ModuleLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import Page from '../Pages/Page';
import RenderCardList from './Card/RenderCardList';
import NavigatePluginsPage from './NavigatePluginsPage';

export const GetComponentsByPath = memo(
  ({routePath, extensionsElements}: {routePath: AvailablePageIDs; extensionsElements?: FC[]}) => {
    const cards = useGetCardsByPath(routePath);
    const installedCards = useCardsState('installedCards');
    const pinnedCards = useCardsState('pinnedCards');
    const hasArguments = useHasArguments();

    const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

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
              extra={<NavigatePluginsPage size="md" />}
              title="Oops! No cards to display right now"
              subTitle="Please install related modules to see cards"
            />
          </Page>
        ) : (
          <>
            <LayoutGroup id={`${routePath}_cards`}>
              {isNil(ReplaceCards) ? (
                <RenderCardList sortedCards={sortedCards} hasArguments={hasArguments} installedCards={installedCards} />
              ) : (
                <ReplaceCards cards={sortedCards} />
              )}
            </LayoutGroup>
            {extensionsElements?.map((Comp, index) => (
              <Comp key={index} />
            ))}
          </>
        )}
      </div>
    );
  },
);
