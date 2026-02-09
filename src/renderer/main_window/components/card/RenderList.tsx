import {useHasArguments} from '@lynx/plugins/modules';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {motion, Variants} from 'framer-motion';
import {memo, useMemo} from 'react';

import Wrapper from './Wrapper';

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

const useSortedCards = (cards: LoadedCardData[]): LoadedCardData[] => {
  const updateAvailable = useCardsState('updateAvailable');
  const pinnedCards = useCardsState('pinnedCards');

  const updateAvailableIds = useMemo(() => new Set(updateAvailable), [updateAvailable]);
  const pinnedCardIds = useMemo(() => new Set(pinnedCards), [pinnedCards]);

  return useMemo(() => {
    const cardsToSort = cards?.filter(Boolean) ?? [];

    return [...cardsToSort].sort((a, b) => {
      const aHasUpdate = updateAvailableIds.has(a.id);
      const bHasUpdate = updateAvailableIds.has(b.id);
      const aIsPinned = pinnedCardIds.has(a.id);
      const bIsPinned = pinnedCardIds.has(b.id);

      // Sorting priorities:
      // 1. Cards with updates come first.
      // 2. Pinned cards come second.
      // 3. Otherwise, maintain original relative order.
      const updateCompare = Number(bHasUpdate) - Number(aHasUpdate);
      const pinnedCompare = Number(bIsPinned) - Number(aIsPinned);

      return updateCompare || pinnedCompare;
    });
  }, [cards, updateAvailableIds, pinnedCardIds]);
};

type Props = {cards: LoadedCardData[]};

const RenderCardList = memo(({cards}: Props) => {
  const sortedCards = useSortedCards(cards);
  const installedCards = useCardsState('installedCards');
  const hasArguments = useHasArguments();

  const installedCardIds = useMemo(() => new Set(installedCards.map(c => c.id)), [installedCards]);

  if (!sortedCards || sortedCards.length === 0) {
    return null;
  }

  return (
    <>
      {sortedCards.map((card, index) => (
        <motion.div
          key={card.id} // Simpler key is preferred and just as effective.
          custom={index}
          initial="initial"
          animate="animate"
          variants={variants}
          layout>
          <Wrapper
            cardData={card}
            hasArguments={hasArguments.has(card.id)}
            isInstalled={installedCardIds.has(card.id)}
          />
        </motion.div>
      ))}
    </>
  );
});

export default RenderCardList;
