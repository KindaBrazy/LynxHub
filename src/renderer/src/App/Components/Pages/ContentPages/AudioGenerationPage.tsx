import {ScrollShadow} from '@nextui-org/react';

import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const audioGenRoutePath: string = '/audioGenerationPage';
export const audioGenElementId: string = 'audioGenElement';

// Generating audios with AI
export default function AudioGenerationPage() {
  return (
    <Page className="pt-6" id={audioGenElementId}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer icon="AudioGeneration" extraClassNames="mr-3" title="Audio Generation">
          <GetComponentsByPath routePath={audioGenRoutePath} />
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
}
