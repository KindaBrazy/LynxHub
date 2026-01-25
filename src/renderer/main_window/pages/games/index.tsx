import {ScrollShadow} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {GamePage_Icon} from '@lynx_assets/icons/pages';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

type Props = {show: boolean};

const GamesPage = ({show}: Props) => {
  const {addComponent} = extensionsData.customizePages.games;

  return (
    <Page show={show}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        <CardsContainer
          title="Games"
          extraClassNames="mr-3"
          subTitle="Enjoy Games, Hobbies, and Fun AI Tools"
          icon={<GamePage_Icon className={CardContainerClasses} />}>
          <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
            {addComponent.map((Comp, index) => (
              <Comp key={index} />
            ))}
          </div>
        </CardsContainer>
      </ScrollShadow>
    </Page>
  );
};

export default GamesPage;
