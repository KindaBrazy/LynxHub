import {ScrollShadow} from '@nextui-org/react';

import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const textGenRoutePath: string = '/textGenerationPage';
export const textGenElementId: string = 'textGenElement';

// Chatting with AI
export default function TextGenerationPage() {
  return (
    <Page className="pt-6" id={textGenElementId}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer icon="TextGeneration" extraClassNames="mr-3" title="Text Generation">
          <GetComponentsByPath routePath={textGenRoutePath} />
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
}
