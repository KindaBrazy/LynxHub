import {useCardsState} from '@lynx/redux/reducers/cards';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {useMemo} from 'react';

/**
 * Custom hook to sort cards based on update availability and pinned status.
 *
 * Sorting priorities:
 * 1. Cards with updates come first.
 * 2. Pinned cards come second.
 * 3. Otherwise, maintain original relative order.
 *
 * @param cards The list of cards to sort.
 * @returns The sorted list of cards.
 */
export const useSortedCards = (cards: LoadedCardData[]): LoadedCardData[] => {
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

      const updateCompare = Number(bHasUpdate) - Number(aHasUpdate);
      const pinnedCompare = Number(bIsPinned) - Number(aIsPinned);

      return updateCompare || pinnedCompare;
    });
  }, [cards, updateAvailableIds, pinnedCardIds]);
};
