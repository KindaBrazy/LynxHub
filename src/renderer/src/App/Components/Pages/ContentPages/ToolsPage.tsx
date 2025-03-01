import {ScrollShadow} from '@heroui/react';

import {Rocket_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

const ToolsPage = () => {
  const {addComponent} = extensionsData.customizePages.tools;

  return (
    <Page className="pt-6">
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer
          title="Tools"
          extraClassNames="mr-3"
          subTitle="Essential AI Utilities for Your Daily Tasks"
          icon={<Rocket_Icon className={CardContainerClasses} />}>
          {addComponent.map((Comp, index) => (
            <Comp key={index} />
          ))}
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
};

export default ToolsPage;
