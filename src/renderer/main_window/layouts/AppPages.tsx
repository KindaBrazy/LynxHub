import {useEffect, useMemo} from 'react';

import HomePage from '../pages/home';
import {extensionsData} from '../plugins/extensions/loader';
import {useCardsState} from '../redux/reducers/cards';
import {useTabsState} from '../redux/reducers/tabs';
import {useTerminalState} from '../redux/reducers/terminal';
import rendererIpc from '../services/RendererIpc';
import {PageComponents} from '../utils/constants';
import RunningCardView from './browser_terminal';
import {useRemoveTab} from './tabs/utils';

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
        const isActiveTab = activeTab === tab.id;
        const show = activePage === tab.pageID && activeTab === tab.id;
        const foundRunningCard = runningCards.find(card => card.tabId === tab.id);

        if (foundRunningCard) {
          return (
            <a className={isActiveTab ? 'block' : 'hidden'} key={`${foundRunningCard.id}_${foundRunningCard.tabId}`}>
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
