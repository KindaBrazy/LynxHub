import {ScrollShadow} from '@heroui/react';
import {PageID} from '@lynx_cross/consts';
import {memo, useMemo} from 'react';

import {AudioGeneration_Icon} from '../../../shared/assets/icons';
import {GetComponentsByPath} from '../../components/card';
import {extensionsData} from '../../plugins/extensions/loader';
import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

type Props = {show: boolean};

const AudioGenerationPage = memo(({show}: Props) => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.audio.add,
    [],
  );

  return (
    <Page show={show}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardsContainer
          extraClassNames="mr-3"
          title="Audio Generation"
          subTitle="Compose and Manipulate Audio Effortlessly with AI"
          icon={<AudioGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.audioGen} extensionsElements={cardsContainer} />
        </CardsContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
});

export default AudioGenerationPage;
