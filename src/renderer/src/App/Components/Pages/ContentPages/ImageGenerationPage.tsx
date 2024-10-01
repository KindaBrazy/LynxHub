import {ScrollShadow} from '@nextui-org/react';

import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const imageGenRoutePath: string = '/imageGenerationPage';
export const imageGenElementId: string = 'imageGenElement';

// Generating images with AI
export default function ImageGenerationPage() {
  return (
    <Page className="pt-6" id={imageGenElementId}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer icon="ImageGeneration" extraClassNames="mr-3" title="Image Generation">
          <GetComponentsByPath routePath={imageGenRoutePath} />
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
}
