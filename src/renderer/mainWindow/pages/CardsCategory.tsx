import RenderCardList from '@lynx/components/card/RenderList';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import NavigateToPluginsButton from '@lynx/components/NavigateToPluginsButton';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useAllCardDataWithPath, useSearchCards} from '@lynx/plugins/modules';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon} from '@lynx_assets/icons/Icons_Colorful';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {Inbox, PinCircle} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {memo, useId, useMemo} from 'react';

import {CardContainerClasses} from './CardsContainer';
import HomeCategory from './home/Category';

// ─── Private helpers ─────────────────────────────────────────────────────────

/**
 * Custom hook that filters the full card list down to the provided IDs,
 * preserving original ordering of `cardIds`.
 */
const useCardsById = (cardIds: string[]): LoadedCardData[] => {
  const allCards = useAllCardDataWithPath();

  return useMemo(() => allCards.filter(card => cardIds.includes(card.id)), [cardIds, allCards]);
};

/** Renders a filtered card list by an array of IDs. */
const CardsByIds = ({cardIds, cat}: {cardIds: string[]; cat: string}) => {
  const cards = useCardsById(cardIds);
  // Extension point: plugins can completely replace the card renderer.
  const ReplaceCards = extensionsData.cards.replace;

  return (
    <LayoutGroup id={`${cat}_cards_category`}>
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          isEmpty(cards) ? (
            <EmptyStateCard
              className="size-full"
              bodyClassName="gap-y-3"
              icon={<Inbox size={40} />}
              title="No Card to Display!"
              action={<NavigateToPluginsButton />}
              description="Please install at least one module in plugins page."
            />
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

/** Renders every available card, delegating to the plugin replace-slot if present. */
const AllCards = () => {
  const allCards = useAllCardDataWithPath();
  // Extension point: plugins may add custom category content after the main list.
  const allCategory = extensionsData.customizePages.home.add.allCategory;
  // Extension point: plugins can completely replace the card renderer.
  const ReplaceCards = extensionsData.cards.replace;

  if (isEmpty(allCards) && isEmpty(allCategory)) {
    return (
      <EmptyStateCard
        className="size-full"
        bodyClassName="gap-y-3"
        icon={<Inbox size={40} />}
        title="No Card to Display!"
        action={<NavigateToPluginsButton />}
        description="Please install at least one module in plugins page."
      />
    );
  }

  return (
    <LayoutGroup id="all_cards_category">
      <AnimatePresence>
        {isNil(ReplaceCards) ? <RenderCardList cards={allCards} /> : <ReplaceCards cards={allCards} />}
      </AnimatePresence>
    </LayoutGroup>
  );
};

// ─── Exported category sections ───────────────────────────────────────────────

/** Renders the "PINNED" home page category section. */
export const PinnedCars = memo(() => {
  const pinnedCards = useCardsState('pinnedCards');

  // Extension point: plugins may inject custom items alongside pinned cards.
  const pinCategory = extensionsData.customizePages.home.add.pinCategory;

  const id = useId();

  return (
    <HomeCategory
      title="PINNED"
      subTitle="Quick Access to Your Top AI Tools"
      icon={<Pin_Color_Icon id={'home_category_pin' + id} className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(pinnedCards) && isEmpty(pinCategory) ? (
          <EmptyStateCard
            className="size-full"
            bodyClassName="gap-y-3"
            title="No pinned card!"
            icon={<PinCircle size={45} />}
            description="Pin your favorite cards to easily access them here."
          />
        ) : (
          <>
            <CardsByIds cat="pinned" cardIds={pinnedCards} />
            {...pinCategory.map((Pin, index) => <Pin key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

/** Renders the "RECENTLY USED" home page category section. */
export const RecentlyCards = memo(() => {
  const recentlyUsedCards = useCardsState('recentlyUsedCards');

  // Extension point: plugins may inject custom items alongside recently-used cards.
  const recentlyCategory = extensionsData.customizePages.home.add.recentlyCategory;

  const id = useId();

  return (
    <HomeCategory
      title="RECENTLY USED"
      subTitle="Your Most Recent AI Interactions"
      icon={<History_Color_Icon className={CardContainerClasses} id={'home_category_history' + id} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {!isEmpty(recentlyUsedCards) && isEmpty(recentlyCategory) ? (
          <EmptyStateCard
            className="size-full"
            bodyClassName="gap-y-3"
            icon={<Inbox size={40} />}
            description="No Recently Used Card to Display!"
          />
        ) : (
          <>
            <CardsByIds cat="recently" cardIds={recentlyUsedCards} />
            {...recentlyCategory.map((Recent, index) => <Recent key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

/** Renders the "All" home page category section showing every available card. */
export const AllCardsSection = memo(() => {
  const id = useId();

  return (
    <HomeCategory
      title="All"
      subTitle="Explore the Complete List of AI Interfaces"
      icon={<Apps_Color_Icon className={CardContainerClasses} id={'home_category_app_color' + id} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        <AllCards />
      </div>
    </HomeCategory>
  );
});

/** Props for the CardsBySearch component. */
export interface CardsBySearchProps {
  /** The active search string used to filter cards. */
  searchValue: string;
}

/**
 * Renders a filtered list of cards that match the current search query.
 * Delegates to the plugin replace-slot when one is registered.
 */
export function CardsBySearch({searchValue}: CardsBySearchProps) {
  const filteredCards = useSearchCards(searchValue);
  // Extension point: plugins can completely replace the card renderer.
  const ReplaceCards = extensionsData.cards.replace;

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <EmptyStateCard bodyClassName="gap-y-3" description="No cards match your search." />
      ) : isNil(ReplaceCards) ? (
        <RenderCardList cards={filteredCards} />
      ) : (
        <ReplaceCards cards={filteredCards} />
      )}
    </div>
  );
}
