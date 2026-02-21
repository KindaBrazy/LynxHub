import {useHasArguments} from '@lynx/plugins/modules';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {LoadedCardData} from '@lynx_common/types/plugins/modules';
import {motion, Variants} from 'framer-motion';
import {memo, useMemo} from 'react';

import {useSortedCards} from './useSortedCards';
import Wrapper from './Wrapper';

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

type Props = {
  /** The list of cards to render. */
  cards: LoadedCardData[];
};

/**
 * Component to render a list of sorted cards with animations.
 */
const RenderCardList = memo(({cards}: Props) => {
  const sortedCards = useSortedCards(cards);
  const installedCards = useCardsState('installedCards');
  const hasArguments = useHasArguments();

  const installedCardIds = useMemo(() => new Set(installedCards.map((c) => c.id)), [installedCards]);

  if (!sortedCards || sortedCards.length === 0) {
    return null;
  }

  return (
    <>
      {sortedCards.map((card, index) => (
        <motion.div
          key={card.id}
          animate="animate"
          custom={index}
          initial="initial"
          layout
          variants={variants}>
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
