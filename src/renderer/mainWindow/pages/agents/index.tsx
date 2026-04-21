import {ScrollShadow} from '@heroui-v3/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {AgentPage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

type Props = {
  /** Whether the page is currently visible */
  show: boolean;
};

/**
 * Agents Page Component
 * Renders the Agents page with customized sections from extensions.
 */
const AgentsPage = memo(({show}: Props) => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = extensionsData.customizePages.agents.add;

  return (
    <Page show={show}>
      {top?.map((Top, index) => (
        <Top key={index} />
      ))}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop?.map((ScrollTop, index) => (
          <ScrollTop key={index} />
        ))}

        <CardsContainer
          title="Agents"
          extraClassNames="mr-3"
          subTitle="Work smarter with specialized AI agents."
          icon={<AgentPage_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.agents} extensionsElements={cardsContainer} />
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

export default AgentsPage;
