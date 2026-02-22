import SessionView from '@lynx/features/session';
import HomePage from '@lynx/pages/home';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {PageComponents} from '@lynx/utils/constants';
import ptyIpc from '@lynx_shared/ipc/pty';
import {memo, useEffect, useMemo} from 'react';

import {useRemoveTab} from './tabs/utils';

/**
 * Component that renders the content of the active tab.
 * It maps through all tabs and renders either the session view (browser/terminal) or the internal page.
 */
const AppPages = memo(() => {
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

  // Handle PTY exit events
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
            <div 
              className={isActiveTab ? 'block h-full' : 'hidden'} 
              key={tab.id}
            >
              <RunningView runningCard={foundRunningCard} />
            </div>
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
});

export default AppPages;
