import {ScrollShadow} from '@heroui/react';
import {useMemo} from 'react';

import {TextGeneration_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

export const textGenPageID: string = 'textGen';

// Chatting with AI
const TextGenerationPage = () => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.text.add,
    [],
  );

  return (
    <Page className="pt-6">
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          extraClassNames="mr-3"
          title="Text Generation"
          subTitle="Unleash Your Creativity with AI-Assisted Writing"
          icon={<TextGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={textGenPageID} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
};

export default TextGenerationPage;
