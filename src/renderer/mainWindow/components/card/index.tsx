import NavigatePluginsPage from '@lynx/components/NavigatePluginsPage';
import Page from '@lynx/pages/Page';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useGetCardsByPath} from '@lynx/plugins/modules';
import {AvailablePageIDs} from '@lynx_common/consts';
import {Result} from 'antd';
import {LayoutGroup} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {FC, memo, useMemo} from 'react';

import RenderCardList from './RenderList';

export const GetComponentsByPath = memo(
  ({routePath, extensionsElements}: {routePath: AvailablePageIDs; extensionsElements?: FC[]}) => {
    const cards = useGetCardsByPath(routePath);

    const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);

    return (
      <div className="flex size-full flex-row flex-wrap gap-7 overflow-visible">
        {isEmpty(cards) && isEmpty(extensionsElements) ? (
          <Page className="content-center">
            <Result
              status="info"
              extra={<NavigatePluginsPage size="md" />}
              title="Oops! No cards to display right now"
              subTitle="Please install related modules to see cards"
            />
          </Page>
        ) : (
          <>
            <LayoutGroup id={`${routePath}_cards`}>
              {isNil(ReplaceCards) ? <RenderCardList cards={cards} /> : <ReplaceCards cards={cards} />}
            </LayoutGroup>
            {extensionsElements?.map((Comp, index) => (
              <Comp key={index} />
            ))}
          </>
        )}
      </div>
    );
  },
);
