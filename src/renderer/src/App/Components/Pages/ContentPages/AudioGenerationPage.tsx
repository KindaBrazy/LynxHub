import {ScrollShadow} from '@heroui/react';
import {useMemo} from 'react';

import {AudioGeneration_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

export const audioGenRoutePath: string = '/audioGenerationPage';
export const audioGenElementId: string = 'audioGenElement';

// Generating audios with AI
const AudioGenerationPage = () => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.audio.add,
    [],
  );

  return (
    <Page className="pt-6" id={audioGenElementId}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          extraClassNames="mr-3"
          title="Audio Generation"
          subTitle="Compose and Manipulate Audio Effortlessly with AI"
          icon={<AudioGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={audioGenRoutePath} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
};

export default AudioGenerationPage;
