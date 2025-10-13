import {motion, Variants} from 'framer-motion';

import {LoadedCardData} from '../../../../../../cross/plugin/ModuleTypes';
import {InstalledCards} from '../../../../../../cross/StorageTypes';
import LynxCardWrapper from './LynxCard-Wrapper';

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

type Props = {sortedCards: LoadedCardData[]; installedCards: InstalledCards; hasArguments: Set<string>};
export default function RenderCardList({sortedCards, installedCards, hasArguments}: Props) {
  return (
    <>
      {sortedCards.map((card, index) => {
        const isInstalled = installedCards.some(c => c.id === card.id);

        return (
          <motion.div
            custom={index}
            initial="initial"
            animate="animate"
            variants={variants}
            key={`${card.id}_card`}
            layout>
            <LynxCardWrapper cardData={card} isInstalled={isInstalled} hasArguments={hasArguments.has(card.id)} />
          </motion.div>
        );
      })}
    </>
  );
}
