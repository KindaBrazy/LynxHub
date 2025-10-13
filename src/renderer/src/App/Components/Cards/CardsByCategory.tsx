import {Empty} from 'antd';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {LoadedCardData} from '../../../../../cross/plugin/ModuleTypes';
import {Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon} from '../../../assets/icons/SvgIcons/SvgIconsColor';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAllCardDataWithPath, useHasArguments, useSearchCards} from '../../Modules/ModuleLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {CardContainerClasses} from '../Pages/CardContainer';
import HomeCategory from '../Pages/ContentPages/Home/HomeCategory';
import RenderCardList from './Card/RenderCardList';
import NavigatePluginsPage from './NavigatePluginsPage';

/**
 * Custom hook that returns cards by their IDs
 * @param cardIds Array of card IDs
 * @returns Array of CardData objects
 */
const useCardsById = (cardIds: string[]): LoadedCardData[] => {
  const allCards = useAllCardDataWithPath();

  return useMemo(() => {
    return allCards.filter(card => cardIds.includes(card.id));
  }, [cardIds, allCards]);
};

/**
 * Renders a list of cards by their IDs
 */
const CardsById = ({cardIds, cat}: {cardIds: string[]; cat: string}) => {
  const installedCards = useCardsState('installedCards');
  const cards = useCardsById(cardIds);
  const hasArguments = useHasArguments();

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  return (
    <LayoutGroup id={`${cat}_cards_category`}>
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          isEmpty(cards) ? (
            <Empty className="size-full" description="No Card to Display!">
              <NavigatePluginsPage />
            </Empty>
          ) : (
            <RenderCardList sortedCards={cards} hasArguments={hasArguments} installedCards={installedCards} />
          )
        ) : (
          <ReplaceCards cards={cards} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

/** Renders all available cards */
const AllCards = () => {
  const installedCards = useCardsState('installedCards');

  const allCategory = useMemo(() => extensionsData.customizePages.home.add.allCategory, []);
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  const allCards = useAllCardDataWithPath();
  const hasArguments = useHasArguments();
  const pinnedCards = useCardsState('pinnedCards');

  const sortedCards = useMemo(() => {
    const pin = compact(allCards?.filter(card => pinnedCards.includes(card.id)));
    const rest = compact(allCards?.filter(card => !pinnedCards.includes(card.id)));
    return [...pin, ...rest];
  }, [pinnedCards, allCards]);

  if (isEmpty(sortedCards) && isEmpty(allCategory))
    return (
      <Empty className="size-full" description="No Card to Display!">
        <NavigatePluginsPage />
      </Empty>
    );

  return (
    <LayoutGroup id="all_cards_category">
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          <RenderCardList sortedCards={sortedCards} hasArguments={hasArguments} installedCards={installedCards} />
        ) : (
          <ReplaceCards cards={sortedCards} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

/** Renders the "PINNED" category section */
export const PinnedCars = memo(() => {
  const pinnedCards = useCardsState('pinnedCards');

  const pinCategory = useMemo(() => extensionsData.customizePages.home.add.pinCategory, []);

  return (
    <HomeCategory
      title="PINNED"
      subTitle="Quick Access to Your Top AI Tools"
      icon={<Pin_Color_Icon id="home_category_pin" className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(pinnedCards) && isEmpty(pinCategory) ? (
          <Empty className="size-full" description="No Pinned Card to Display!" />
        ) : (
          <>
            <CardsById cat="pinned" cardIds={pinnedCards} />
            {...pinCategory.map((Pin, index) => <Pin key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "RECENTLY USED" category section
export const RecentlyCards = memo(() => {
  const recentlyUsedCards = useCardsState('recentlyUsedCards');

  const recentlyCategory = useMemo(() => extensionsData.customizePages.home.add.recentlyCategory, []);

  return (
    <HomeCategory
      title="RECENTLY USED"
      subTitle="Your Most Recent AI Interactions"
      icon={<History_Color_Icon id="home_category_history" className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(recentlyUsedCards) && isEmpty(recentlyCategory) ? (
          <Empty className="size-full" description="No Recently Used Card to Display!" />
        ) : (
          <>
            <CardsById cat="recently" cardIds={recentlyUsedCards} />
            {...recentlyCategory.map((Recent, index) => <Recent key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "All" category section
export const AllCardsSection = memo(() => {
  return (
    <HomeCategory
      title="All"
      subTitle="Explore the Complete List of AI Interfaces"
      icon={<Apps_Color_Icon id="home_category_app_color" className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        <AllCards />
      </div>
    </HomeCategory>
  );
});

export function CardsBySearch({searchValue}: {searchValue: string}) {
  const installedCards = useCardsState('installedCards');
  const filteredCards = useSearchCards(searchValue);
  const hasArguments = useHasArguments();
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <Empty className="w-full" description="No cards match your search." />
      ) : isNil(ReplaceCards) ? (
        <RenderCardList
          batchSize={2}
          startDelay={0}
          batchDelay={50}
          sortedCards={filteredCards}
          hasArguments={hasArguments}
          installedCards={installedCards}
        />
      ) : (
        <ReplaceCards cards={filteredCards} />
      )}
    </div>
  );
}
