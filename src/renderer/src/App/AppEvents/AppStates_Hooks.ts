import {isEmpty, isEqual} from 'lodash';
import {useEffect} from 'react';

import {useCardsState} from '../Redux/Reducer/CardsReducer';
import rendererIpc from '../RendererIpc';

// Remove not installed cards from pinned cards
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
      rendererIpc.storageUtils.pinnedCards('set', '', filteredPins);
    }
  }, [installedCards, pinnedCards]);
}
