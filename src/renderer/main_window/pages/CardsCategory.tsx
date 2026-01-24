import RenderCardList from '@lynx/components/card/RenderList';
import NavigatePluginsPage from '@lynx/components/NavigatePluginsPage';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAllCardDataWithPath, useSearchCards} from '@lynx/plugins/modules';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon} from '@lynx_assets/icons/Icons_Colorful';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {Empty} from 'antd';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {CardContainerClasses} from './CardsContainer';
import HomeCategory from './home/Category';

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
  const cards = useCardsById(cardIds);

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
            <RenderCardList cards={cards} />
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
  const allCategory = useMemo(() => extensionsData.customizePages.home.add.allCategory, []);
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  const allCards = useAllCardDataWithPath();

  if (isEmpty(allCards) && isEmpty(allCategory))
    return (
      <Empty className="size-full" description="No Card to Display!">
        <NavigatePluginsPage />
      </Empty>
    );

  return (
    <LayoutGroup id="all_cards_category">
      <AnimatePresence>
        {isNil(ReplaceCards) ? <RenderCardList cards={allCards} /> : <ReplaceCards cards={allCards} />}
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
          <Empty
            className="size-full"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Pin your favorite cards to easily access them here."
          />
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
  const filteredCards = useSearchCards(searchValue);
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <Empty className="w-full" description="No cards match your search." />
      ) : isNil(ReplaceCards) ? (
        <RenderCardList cards={filteredCards} />
      ) : (
        <ReplaceCards cards={filteredCards} />
      )}
    </div>
  );
}
