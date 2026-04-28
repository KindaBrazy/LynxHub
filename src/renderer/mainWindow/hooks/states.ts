import {useCardsState} from '@lynx/redux/reducers/cards';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {isEmpty, isEqual} from 'lodash-es';
import {useEffect} from 'react';

/**
 * Ensures that pinned cards list is consistent with installed cards.
 * Removes any pinned cards that are no longer installed.
 */
export function useFilterPinnedCards() {
  const installedCards = useCardsState('installedCards');
  const pinnedCards = useCardsState('pinnedCards');

  useEffect(() => {
    if (isEmpty(installedCards) || isEmpty(pinnedCards)) {
      return; // Exit early if either array is empty
    }

    const installedCardIds = new Set(installedCards.map(card => card.id));

    // Filter pinned cards based on whether their ID exists in the installed cards
    const filteredPins = pinnedCards.filter(pCard => installedCardIds.has(pCard));

    if (!isEqual(filteredPins, pinnedCards)) {
      storageUtilsIpc.invoke.pinnedCards('set', '', filteredPins);
    }
  }, [installedCards, pinnedCards]);
}
