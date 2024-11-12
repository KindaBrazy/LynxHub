import {ScrollShadow} from '@nextui-org/react';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const imageGenRoutePath: string = '/imageGenerationPage';
export const imageGenElementId: string = 'imageGenElement';

// Generating images with AI
export default function ImageGenerationPage() {
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
          icon="ImageGeneration"
          extraClassNames="mr-3"
          title="Image Generation"
          subTitle="Create Stunning Visuals with AI-Powered Tools">
          <GetComponentsByPath routePath={imageGenRoutePath} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
}
