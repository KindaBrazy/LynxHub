import {Empty} from 'antd';
import {AnimatePresence} from 'framer-motion';
import {isEmpty} from 'lodash';
import {memo, useMemo} from 'react';

import {useModules} from '../../Modules/ModulesContext';
import {CardData} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import {getDevInfo} from '../../Utils/LocalStorage';
import {searchInStrings} from '../../Utils/UtilFunctions';
import HomeCategory from '../Pages/ContentPages/Home/HomeCategory';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

/**
 * Custom hook to fetch cards by their IDs
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
const CardsById = ({cardIds}: {cardIds: string[]}) => {
  const installedCards = useCardsState('installedCards');
  const cards = useCardsById(cardIds);
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  if (isEmpty(cards)) return <Empty className="size-full" description="No Card to Display!" />;

  return (
    <AnimatePresence>
      {cards.map(card => (
        <CardContext.Provider
          key={`cardProv-${card.id}`}
          value={new CardsDataManager(card, installedCardSet.has(card.id))}>
          <LynxCard key={`${card.id}-card-key`} />
        </CardContext.Provider>
      ))}
    </AnimatePresence>
  );
};

/** Renders all available cards */
const AllCards = () => {
  const {allCards} = useModules();
  const installedCards = useCardsState('installedCards');
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  if (isEmpty(allCards)) return <Empty className="size-full" description="No Card to Display!" />;

  return (
    <AnimatePresence>
      {allCards.map(card => (
        <CardContext.Provider
          key={`cardProv-${card.id}`}
          value={new CardsDataManager(card, installedCardSet.has(card.id))}>
          <LynxCard key={`${card.id}-card-key`} />
        </CardContext.Provider>
      ))}
    </AnimatePresence>
  );
};

/** Renders the "PINNED" category section */
export const PinnedCars = memo(() => {
  const pinnedCards = useCardsState('pinnedCards');

  return (
    <HomeCategory title="PINNED" icon="CirclePin">
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(pinnedCards) ? (
          <Empty className="size-full" description="No Pinned Card to Display!" />
        ) : (
          <CardsById cardIds={pinnedCards} />
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "RECENTLY USED" category section
export const RecentlyCards = memo(() => {
  const recentlyUsedCards = useCardsState('recentlyUsedCards');

  return (
    <HomeCategory icon="CircleClock" title="RECENTLY USED">
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(recentlyUsedCards) ? (
          <Empty className="size-full" description="No Recently Used Card to Display!" />
        ) : (
          <CardsById cardIds={recentlyUsedCards} />
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "All" category section
export const AllCardsSection = memo(() => {
  return (
    <HomeCategory title="All" icon="CircleFill">
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

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <Empty className="w-full" description="No cards match your search." />
      ) : (
        filteredCards.map((card, index) => {
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
