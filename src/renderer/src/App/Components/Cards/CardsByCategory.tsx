import {Empty} from 'antd';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useModules} from '../../Modules/ModulesContext';
import {CardData} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import {getDevInfo} from '../../Utils/LocalStorage';
import {searchInStrings} from '../../Utils/UtilFunctions';
import HomeCategory from '../Pages/ContentPages/Home/HomeCategory';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

/**
 * Custom hook that returns cards by their IDs
 * @param cardIds Array of card IDs
 * @returns Array of CardData objects
 */
const useCardsById = (cardIds: string[]): CardData[] => {
  const {allCards} = useModules();

  const cards = useMemo(() => {
    return cardIds.map(cardId => allCards.find(card => card && card.id === cardId)) as CardData[];
  }, [allCards, cardIds]);

  return cards.filter(Boolean);
};

/**
 * Renders a list of cards by their IDs
 */
const CardsById = ({cardIds, cat}: {cardIds: string[]; cat: string}) => {
  const installedCards = useCardsState('installedCards');
  const cards = useCardsById(cardIds);
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  return (
    <LayoutGroup id={`${cat}_cards_category`}>
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          cards.map(card => (
            <CardContext.Provider
              key={`cardProv-${card.id}`}
              value={new CardsDataManager(card, installedCardSet.has(card.id))}>
              <LynxCard key={`${card.id}-card-key`} />
            </CardContext.Provider>
          ))
        ) : (
          <ReplaceCards cards={cards} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

/** Renders all available cards */
const AllCards = () => {
  const {allCards} = useModules();
  const installedCards = useCardsState('installedCards');
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  const allCategory = useMemo(() => extensionsData.customizePages.home.add.allCategory, []);
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  const pinnedCards = useCardsState('pinnedCards');

  const sortedCards = useMemo(() => {
    const pin = compact(allCards?.filter(card => pinnedCards.includes(card.id)));
    const rest = compact(allCards?.filter(card => !pinnedCards.includes(card.id)));
    return [...pin, ...rest];
  }, [allCards, pinnedCards]);

  if (isEmpty(sortedCards) && isEmpty(allCategory))
    return <Empty className="size-full" description="No Card to Display!" />;

  return (
    <LayoutGroup id="all_cards_category">
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          sortedCards.map(card => (
            <CardContext.Provider
              key={`cardProv-${card.id}`}
              value={new CardsDataManager(card, installedCardSet.has(card.id))}>
              <LynxCard key={`${card.id}-card-key`} />
              {...allCategory.map((All, index) => <All key={index} />)}
            </CardContext.Provider>
          ))
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
  const installedCards = useCardsState('installedCards');

  const pinCategory = useMemo(() => extensionsData.customizePages.home.add.pinCategory, []);

  const validPinnedCards = useMemo(() => {
    return pinnedCards.filter(pinnedCardId => installedCards.some(installedCard => installedCard.id === pinnedCardId));
  }, [pinnedCards, installedCards]);

  return (
    <HomeCategory title="PINNED" icon="Pin_Color" subTitle="Quick Access to Your Top AI Tools">
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(validPinnedCards) && isEmpty(pinCategory) ? (
          <Empty className="size-full" description="No Pinned Card to Display!" />
        ) : (
          <>
            <CardsById cat="pinned" cardIds={validPinnedCards} />
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
  const installedCards = useCardsState('installedCards');

  const recentlyCategory = useMemo(() => extensionsData.customizePages.home.add.recentlyCategory, []);

  const validRecentlyUsed = useMemo(() => {
    return recentlyUsedCards.filter(recentlyUsedCardId =>
      installedCards.some(installedCard => installedCard.id === recentlyUsedCardId),
    );
  }, [recentlyUsedCards, installedCards]);

  return (
    <HomeCategory icon="History_Color" title="RECENTLY USED" subTitle="Your Most Recent AI Interactions">
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(validRecentlyUsed) && isEmpty(recentlyCategory) ? (
          <Empty className="size-full" description="No Recently Used Card to Display!" />
        ) : (
          <>
            <CardsById cat="recently" cardIds={validRecentlyUsed} />
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
    <HomeCategory title="All" icon="Apps_Color" subTitle="Explore the Complete List of AI Interfaces">
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        <AllCards />
      </div>
    </HomeCategory>
  );
});

export function CardsBySearch({searchValue}: {searchValue: string}) {
  const installedCards = useCardsState('installedCards');
  const {allCards} = useModules();

  const searchData = useMemo(() => {
    return allCards.map(card => ({id: card.id, data: [card.description, card.title, getDevInfo(card.repoUrl)?.name]}));
  }, [allCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => searchInStrings(searchValue, searchData.find(data => data.id === card.id)?.data));
  }, [searchValue, searchData]);

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <Empty className="w-full" description="No cards match your search." />
      ) : isNil(ReplaceCards) ? (
        filteredCards.map((card, index) => {
          const isInstalled = installedCards.some(iCard => iCard.id === card.id);
          return (
            <CardContext.Provider key={`cardProv-${index}`} value={new CardsDataManager(card, isInstalled)}>
              <LynxCard key={`${card.id}-card-key`} />
            </CardContext.Provider>
          );
        })
      ) : (
        <ReplaceCards cards={filteredCards} />
      )}
    </div>
  );
}
