import {ScrollShadow} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ToolsPage_Icon} from '@lynx_assets/icons/pages';
import {motion, Variants} from 'framer-motion';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

const variants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
};

type Props = {show: boolean};

const ToolsPage = memo(({show}: Props) => {
  const {addComponent} = extensionsData.customizePages.tools;

  return (
    <Page show={show}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        <CardsContainer
          title="Tools"
          extraClassNames="mr-3"
          subTitle="Essential AI Utilities for Your Daily Tasks"
          icon={<ToolsPage_Icon className={CardContainerClasses} />}>
          <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
            {addComponent.map((Comp, index) => (
              <motion.div
                custom={index}
                initial="initial"
                animate="animate"
                variants={variants}
                key={`${index}_tools_card`}
                layout>
                <Comp key={index} />{' '}
              </motion.div>
            ))}
          </div>
        </CardsContainer>
      </ScrollShadow>
    </Page>
  );
});

export default ToolsPage;
