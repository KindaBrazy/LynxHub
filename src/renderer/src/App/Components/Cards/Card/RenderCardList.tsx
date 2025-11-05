import {motion, Variants} from 'framer-motion';
import {memo} from 'react';

import {LoadedCardData} from '../../../../../../cross/plugin/ModuleTypes';
import {useHasArguments} from '../../../Modules/ModuleLoader';
import {useCardsState} from '../../../Redux/Reducer/CardsReducer';
import Wrapper from './Wrapper';

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

type Props = {cards: LoadedCardData[]};

const RenderCardList = memo(({cards}: Props) => {
  const installedCards = useCardsState('installedCards');
  const hasArguments = useHasArguments();

  return (
    <>
      {cards.map((card, index) => {
        const isInstalled = installedCards.some(c => c.id === card.id);

        return (
          <motion.div
            custom={index}
            initial="initial"
            animate="animate"
            variants={variants}
            key={`${card.id}_card`}
            layout>
            <Wrapper cardData={card} isInstalled={isInstalled} hasArguments={hasArguments.has(card.id)} />
          </motion.div>
        );
      })}
    </>
  );
});

export default RenderCardList;
