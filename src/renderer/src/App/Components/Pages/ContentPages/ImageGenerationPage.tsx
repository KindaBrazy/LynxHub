import {ScrollShadow} from '@heroui/react';
import {useMemo} from 'react';

import {ImageGeneration_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons2';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

export const imageGenRoutePath: string = '/imageGenerationPage';
export const imageGenElementId: string = 'imageGenElement';

// Generating images with AI
const ImageGenerationPage = () => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.image.add,
    [],
  );

  return (
    <Page className="pt-6" id={imageGenElementId}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          extraClassNames="mr-3"
          title="Image Generation"
          subTitle="Create Stunning Visuals with AI-Powered Tools"
          icon={<ImageGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={imageGenRoutePath} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
};

export default ImageGenerationPage;
