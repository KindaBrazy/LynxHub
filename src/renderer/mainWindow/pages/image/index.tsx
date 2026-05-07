import {ScrollShadow} from '@heroui/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {ImagePage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

/**
 * Image Generation Page Component
 * Renders the Image Generation page with customized sections from extensions.
 */
const ImageGenerationPage = memo(() => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = extensionsData.customizePages.image.add;

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
          extraClassNames="mr-3"
          title="Image Generation"
          subTitle="Create Stunning Visuals with AI-Powered Tools"
          icon={<ImagePage_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.imageGen} extensionsElements={cardsContainer} />
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

export default ImageGenerationPage;
