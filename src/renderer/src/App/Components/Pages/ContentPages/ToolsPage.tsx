import {ScrollShadow} from '@heroui/react';
import {memo} from 'react';

import {Rocket_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

type Props = {show: boolean};

const ToolsPage = memo(({show}: Props) => {
  const {addComponent} = extensionsData.customizePages.tools;

  return (
    <Page show={show}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        <CardContainer
          title="Tools"
          extraClassNames="mr-3"
          subTitle="Essential AI Utilities for Your Daily Tasks"
          icon={<Rocket_Icon className={CardContainerClasses} />}>
          <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
            {addComponent.map((Comp, index) => (
              <Comp key={index} />
            ))}
          </div>
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
});

export default ToolsPage;
