import {ScrollShadow} from '@heroui/react';
import {GetComponentsByPath} from '@lynx/components/card';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {GamePage_Icon} from '@lynx_assets/icons/pages';
import {PageID} from '@lynx_common/consts';
import {memo} from 'react';

import CardsContainer, {CardContainerClasses} from '../CardsContainer';
import Page from '../Page';

type Props = {show: boolean};

const GamesPage = memo(({show}: Props) => {
  const {addComponent} = extensionsData.customizePages.games;

  return (
    <Page show={show}>
      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        <CardsContainer
          title="Games"
          extraClassNames="mr-3"
          subTitle="Enjoy Games, Hobbies, and Fun AI Tools"
          icon={<GamePage_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.games} extensionsElements={addComponent} />
        </CardsContainer>
      </ScrollShadow>
    </Page>
  );
});

export default GamesPage;
