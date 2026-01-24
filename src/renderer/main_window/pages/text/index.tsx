import {ScrollShadow} from '@heroui/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {TextGeneration_Icon} from '@lynx_assets/icons';
import {PageID} from '@lynx_common/consts';
import {memo, useMemo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

type Props = {show: boolean};

const TextGenerationPage = memo(({show}: Props) => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.text.add,
    [],
  );

  return (
    <Page show={show}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardsContainer
          extraClassNames="mr-3"
          title="Text Generation"
          subTitle="Unleash Your Creativity with AI-Assisted Writing"
          icon={<TextGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.textGen} extensionsElements={cardsContainer} />
        </CardsContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
});

export default TextGenerationPage;
