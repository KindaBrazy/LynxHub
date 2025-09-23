import {ScrollShadow} from '@heroui/react';
import {memo, useMemo} from 'react';

import {PageID} from '../../../../../../cross/CrossConstants';
import {MagicStickDuo_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../Extensions/ExtensionLoader';
import {GetComponentsByPath} from '../../Cards/Cards';
import CardContainer, {CardContainerClasses} from '../CardContainer';
import Page from '../Page';

type Props = {show: boolean};

const OthersPage = memo(({show}: Props) => {
  const {top, scrollTop, scrollBottom, bottom, cardsContainer} = useMemo(
    () => extensionsData.customizePages.others.add,
    [],
  );

  return (
    <Page show={show}>
      {top && top.map((Top, index) => <Top key={index} />)}

      <ScrollShadow size={20} className="size-full overflow-y-scroll p-5 scrollbar-hide">
        {scrollTop && scrollTop.map((ScrollTop, index) => <ScrollTop key={index} />)}

        <CardContainer
          title="Others"
          extraClassNames="mr-3"
          subTitle="Explore miscellaneous tools and other AI features."
          icon={<MagicStickDuo_Icon className={CardContainerClasses} />}>
          <GetComponentsByPath routePath={PageID.agents} extensionsElements={cardsContainer} />
        </CardContainer>

        {scrollBottom && scrollBottom.map((ScrollBottom, index) => <ScrollBottom key={index} />)}
      </ScrollShadow>

      {bottom && bottom.map((Bottom, index) => <Bottom key={index} />)}
    </Page>
  );
});

export default OthersPage;
