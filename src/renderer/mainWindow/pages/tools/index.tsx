import {ScrollShadow} from '@heroui-v3/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ToolsPage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

/**
 * Tools Page Component
 * Renders the Tools page with customized sections from extensions.
 */
const ToolsPage = memo(() => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = extensionsData.customizePages.tools.add;

  return (
    <Page>
      {top?.map((Top, index) => (
        <Top key={index} />
      ))}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop?.map((ScrollTop, index) => (
          <ScrollTop key={index} />
        ))}

        <CardsContainer
          title="Tools"
          extraClassNames="mr-3"
          subTitle="Essential AI Utilities for Your Daily Tasks"
          icon={<ToolsPage_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.tools} extensionsElements={cardsContainer} />
        </CardsContainer>

        {scrollBottom?.map((ScrollBottom, index) => (
          <ScrollBottom key={index} />
        ))}
      </ScrollShadow>

      {bottom?.map((Bottom, index) => (
        <Bottom key={index} />
      ))}
    </Page>
  );
});

export default ToolsPage;
