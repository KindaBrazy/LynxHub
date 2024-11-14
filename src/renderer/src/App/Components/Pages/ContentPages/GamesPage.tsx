import {ScrollShadow} from '@nextui-org/react';

import {extensionsData} from '../../../Extensions/ExtensionLoader';
import CardContainer from '../CardContainer';
import Page from '../Page';

export const gamesRoutePath: string = '/gamesPage';

export default function GamesPage() {
  const {addComponent} = extensionsData.customizePages.games;

  return (
    <Page className="pt-6">
      <ScrollShadow size={20} className="size-full overflow-y-scroll pb-4 scrollbar-hide">
        <CardContainer
          title="Games"
          icon="GamePad"
          extraClassNames="mr-3"
          subTitle="Enjoy Games, Hobbies, and Fun AI Tools">
          {addComponent.map((Comp, index) => (
            <Comp key={index} />
          ))}
        </CardContainer>
      </ScrollShadow>
    </Page>
  );
}
