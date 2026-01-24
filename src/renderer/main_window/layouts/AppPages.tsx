import SessionView from '@lynx/features/session';
import HomePage from '@lynx/pages/home';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {PageComponents} from '@lynx/utils/constants';
import ptyIpc from '@lynx_shared/ipc/pty';
import {useEffect, useMemo} from 'react';

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
    return Container ? Container : SessionView;
  }, []);

  useEffect(() => {
    const removeListener = ptyIpc.onExit(id => {
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
