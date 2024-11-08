import {ScrollShadow} from '@nextui-org/react';
import {useState} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const textGenRoutePath: string = '/textGenerationPage';
export const textGenElementId: string = 'textGenElement';

// Chatting with AI
export default function TextGenerationPage() {
  const [customizePage] = useState(extensionsData.customizePages.text);
  return (
    <Page className="pt-6" id={textGenElementId}>
      {customizePage.add.top && customizePage.add.top.map((Top, index) => <Top key={index} />)}
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {customizePage.add.scrollTop &&
          customizePage.add.scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}
        <CardContainer icon="TextGeneration" extraClassNames="mr-3" title="Text Generation">
          <GetComponentsByPath routePath={textGenRoutePath} extensionsElements={customizePage.add.cardsContainer} />
        </CardContainer>
        {customizePage.add.scrollBottom &&
          customizePage.add.scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>
      {customizePage.add.bottom && customizePage.add.bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
}
