import {useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useActivePage, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {PageComponents} from '../../Utils/Constants';
import HomePage from '../Pages/ContentPages/Home/HomePage';
import RunningCardView from '../RunningCardView/RunningCardView';

export default function AppPages() {
  const {isRunning} = useCardsState('runningCard');
  const activePage = useActivePage();
  const tabs = useTabsState('tabs');
  const activeTab = useTabsState('activeTab');

  const Container = useMemo(() => extensionsData.runningAI.container, []);

  return isRunning ? (
    Container ? (
      <Container />
    ) : (
      <RunningCardView />
    )
  ) : (
    tabs.map(tab => {
      const show = activePage === tab.pageID && activeTab === tab.id;

      const Component = PageComponents[tab.pageID];

      if (Component) {
        return <Component show={show} key={tab.id} />;
      }

      return <HomePage show={true} key={tab.id} />;
    })
  );
}
