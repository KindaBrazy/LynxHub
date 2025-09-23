import {ScrollShadow} from '@heroui/react';
import {memo, useMemo} from 'react';

import {ImageGeneration_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {PageID} from '../../../Utils/Constants';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

type Props = {show: boolean};

const ImageGenerationPage = memo(({show}: Props) => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.image.add,
    [],
  );

  return (
    <Page show={show}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          extraClassNames="mr-3"
          title="Image Generation"
          subTitle="Create Stunning Visuals with AI-Powered Tools"
          icon={<ImageGeneration_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.imageGen} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
});

export default ImageGenerationPage;
