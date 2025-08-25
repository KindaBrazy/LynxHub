import {AvailablePages} from '@lynx_module/types';
import {Result} from 'antd';
import {LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {FC, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useGetCardsByPath} from '../../Modules/ModuleLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {PageID} from '../../Utils/Constants';
import Page from '../Pages/Page';
import LynxCardWrapper from './Card/LynxCard-Wrapper';
import NavigateModulesPage from './NavigateModulesPage';

export function GetComponentsByPath({routePath, extensionsElements}: {routePath: string; extensionsElements?: FC[]}) {
  // Support legacy modules paths
  const pagePath: AvailablePages = useMemo(() => {
    if (routePath === PageID.audioGen) return '/audioGenerationPage';
    if (routePath === PageID.imageGen) return '/imageGenerationPage';
    if (routePath === PageID.textGen) return '/textGenerationPage';

    return routePath as AvailablePages;
  }, [routePath]);

  const cards = useGetCardsByPath(pagePath);
  const installedCards = useCardsState('installedCards');
  const pinnedCards = useCardsState('pinnedCards');

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
            extra={<NavigateModulesPage size="md" />}
            title="Oops! No cards to display right now"
            subTitle="Please install related modules to see cards"
          />
        </Page>
      ) : (
        <>
          <LayoutGroup id={`${routePath}_cards`}>
            {isNil(ReplaceCards) ? (
              <>
                {sortedCards.map(card => {
                  const isInstalled = installedCards.some(iCard => iCard.id === card.id);
                  return (
                    <LynxCardWrapper cardData={card} isInstalled={isInstalled} key={`${card.id}-card-wrapper-key`} />
                  );
                })}
              </>
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
}
