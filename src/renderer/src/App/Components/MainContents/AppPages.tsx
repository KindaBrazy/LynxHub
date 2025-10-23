import {useEffect, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useCardsState} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import {useTerminalState} from '../../Redux/Reducer/TerminalReducer';
import rendererIpc from '../../RendererIpc';
import {PageComponents} from '../../Utils/Constants';
import RunningCardView from '../Browser_Terminal/RunningCardView';
import HomePage from '../Pages/ContentPages/Home/HomePage';
import {useRemoveTab} from '../Tabs/Tab_Utils';

export default function AppPages() {
  const runningCards = useCardsState('runningCard');
  const closeTabOnExit = useTerminalState('closeTabOnExit');
  const tabs = useTabsState('tabs');
  const activePage = useTabsState('activePage');
  const activeTab = useTabsState('activeTab');

  const removeTab = useRemoveTab();

  const RunningView = useMemo(() => {
    const Container = extensionsData.runningAI.container;
    return Container ? Container : RunningCardView;
  }, []);

  useEffect(() => {
    const removeListener = rendererIpc.pty.onExit((_, id) => {
      if (closeTabOnExit) removeTab({id});
    });

    return () => removeListener();
  }, [closeTabOnExit, removeTab]);

  return (
    <>
      {tabs.map(tab => {
        const show = activePage === tab.pageID && activeTab === tab.id;
        const foundRunningCard = runningCards.find(card => card.tabId === tab.id);

        if (foundRunningCard) {
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
