import {ScrollShadow} from '@heroui/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ToolsPage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

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
          <GetComponentsByPath routePath={PageID.tools} extensionsElements={addComponent} />
        </CardsContainer>
      </ScrollShadow>
    </Page>
  );
});

export default ToolsPage;
