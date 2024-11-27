import {ScrollShadow} from '@nextui-org/react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const toolsRoutePath: string = '/toolsPage';

const ToolsPage = () => {
  const {addComponent} = extensionsData.customizePages.tools;

  return (
    <Page className="pt-6">
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer
          icon="Rocket"
          title="Tools"
          extraClassNames="mr-3"
          subTitle="Essential AI Utilities for Your Daily Tasks">
          {addComponent.map((Comp, index) => (
            <Comp key={index} />
          ))}
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
};

export default ToolsPage;
