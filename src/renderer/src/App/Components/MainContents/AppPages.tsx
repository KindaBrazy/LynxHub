import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../RendererIpc';
import {PageComponents} from '../../Utils/Constants';
import RunningCardView from '../Browser_Terminal/RunningCardView';
import HomePage from '../Pages/ContentPages/Home/HomePage';

export default function AppPages() {
  const runningCard = useCardsState('runningCard');
  const tabs = useTabsState('tabs');
  const activePage = useTabsState('activePage');
  const activeTab = useTabsState('activeTab');

  const RunningView = useMemo(() => {
    const Container = extensionsData.runningAI.container;
    return Container ? Container : RunningCardView;
  }, []);

  return (
    <>
      {tabs.map(tab => {
        const show = activePage === tab.pageID && activeTab === tab.id;
        const foundRunningCard = runningCard.find(card => card.tabId === tab.id);

        if (foundRunningCard) {
          const validAddress = !isEmpty(foundRunningCard.customAddress || foundRunningCard.webUIAddress);
          rendererIpc.browser.setVisible(
            foundRunningCard.id,
            validAddress && foundRunningCard.tabId === activeTab && foundRunningCard.currentView === 'browser',
          );
          return (
            <a
              key={`${foundRunningCard.id}_${foundRunningCard.tabId}`}
              className={foundRunningCard.tabId === activeTab ? 'block' : 'hidden'}>
              <RunningView runningCard={foundRunningCard} />
            </a>
          );
        }

        const Component = PageComponents[tab.pageID];

        if (Component) {
          return <Component show={show} key={tab.id} />;
        }

        return <HomePage show={true} key={tab.id} />;
      })}
    </>
  );
}
