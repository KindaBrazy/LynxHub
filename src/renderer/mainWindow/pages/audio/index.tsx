import {ScrollShadow} from '@heroui-v3/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {AudioPage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

/**
 * Audio Generation Page Component
 * Renders the Audio Generation page with customized sections from extensions.
 */
const AudioGenerationPage = memo(() => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = extensionsData.customizePages.audio.add;

  return (
    <Page>
      {top?.map((Top, index) => (
        <Top key={index} />
      ))}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop?.map((ScrollTop, index) => (
          <ScrollTop key={index} />
        ))}

        <CardsContainer
          extraClassNames="mr-3"
          title="Audio Generation"
          icon={<AudioPage_Icon className={CardContainerClasses} />}
          subTitle="Compose and Manipulate Audio Effortlessly with AI">
          <GetComponentsByPath routePath={PageID.audioGen} extensionsElements={cardsContainer} />
        </CardsContainer>

        {scrollBottom?.map((ScrollBottom, index) => (
          <ScrollBottom key={index} />
        ))}
      </ScrollShadow>

      {bottom?.map((Bottom, index) => (
        <Bottom key={index} />
      ))}
    </Page>
  );
});

export default AudioGenerationPage;
