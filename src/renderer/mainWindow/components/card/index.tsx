import NavigateToPluginsButton from '@lynx/components/NavigateToPluginsButton';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useGetCardsByPath} from '@lynx/plugins/modules';
import {AvailablePageIDs} from '@lynx_common/consts';
import {LayoutGroup, motion, Variants} from 'framer-motion';
import {isEmpty, isNil} from 'lodash-es';
import {FC, memo, useMemo} from 'react';

import EmptyStateCard from '../EmptyStateCard';
import RenderCardList from './RenderList';

type GetComponentsByPathProps = {
  /** The route path ID to fetch cards for. */
  routePath: AvailablePageIDs;
  /** Optional additional elements from extensions. */
  extensionsElements?: FC[];
};

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

/**
 * Component that renders the grid of cards for a given route path.
 * It handles fetching cards, rendering empty states, and extension replacements.
 */
export const GetComponentsByPath = memo(({routePath, extensionsElements}: GetComponentsByPathProps) => {
  const cards = useGetCardsByPath(routePath);

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

  const renderEmptyState = () => (
    <div className="size-full flex items-center justify-center">
      <EmptyStateCard
        title="Oops! No cards to display right now"
        action={<NavigateToPluginsButton className="mt-2" />}
        description="Please install related modules to see cards"
      />
    </div>
  );

  return (
    <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
      {isEmpty(cards) && isEmpty(extensionsElements) ? (
        renderEmptyState()
      ) : (
        <>
          <LayoutGroup id={`${routePath}_cards`}>
            {isNil(ReplaceCards) ? <RenderCardList cards={cards} /> : <ReplaceCards cards={cards} />}
          </LayoutGroup>
          {extensionsElements?.map((Comp, index) => (
            <motion.div
              animate="animate"
              initial="initial"
              variants={variants}
              custom={index + cards.length}
              key={`extension_card_${index}`}
              layout>
              <Comp key={index} />{' '}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
});
