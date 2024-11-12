import {ScrollShadow} from '@nextui-org/react';
import {useMemo} from 'react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const textGenRoutePath: string = '/textGenerationPage';
export const textGenElementId: string = 'textGenElement';

// Chatting with AI
export default function TextGenerationPage() {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.text.add,
    [],
  );

  return (
    <Page className="pt-6" id={textGenElementId}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          icon="TextGeneration"
          extraClassNames="mr-3"
          title="Text Generation"
          subTitle="Unleash Your Creativity with AI-Assisted Writing">
          <GetComponentsByPath routePath={textGenRoutePath} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
}
