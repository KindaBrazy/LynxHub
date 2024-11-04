import {ScrollShadow} from '@nextui-org/react';
import {useState} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const imageGenRoutePath: string = '/imageGenerationPage';
export const imageGenElementId: string = 'imageGenElement';

// Generating images with AI
export default function ImageGenerationPage() {
  const [customizePage] = useState(extensionsData.customizePages.image);
  return (
    <Page className="pt-6" id={imageGenElementId}>
      {customizePage.add.top && customizePage.add.top.map((Top, index) => <Top key={index} />)}
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {customizePage.add.scrollTop &&
          customizePage.add.scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}
        <CardContainer icon="ImageGeneration" extraClassNames="mr-3" title="Image Generation">
          <GetComponentsByPath routePath={imageGenRoutePath} />
        </CardContainer>
        {customizePage.add.scrollBottom &&
          customizePage.add.scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>
      {customizePage.add.bottom && customizePage.add.bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
}
