import {ScrollShadow} from '@heroui/react';

import {GamePad_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

type Props = {show: boolean};

const GamesPage = ({show}: Props) => {
  const {addComponent} = extensionsData.customizePages.games;

  return (
    <Page show={show} className="pt-6">
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer
          title="Games"
          extraClassNames="mr-3"
          subTitle="Enjoy Games, Hobbies, and Fun AI Tools"
          icon={<GamePad_Icon className={CardContainerClasses} />}>
          {addComponent.map((Comp, index) => (
            <Comp key={index} />
          ))}
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
};

export default GamesPage;
