import SessionView from '@lynx/features/session';
import HomePage from '@lynx/pages/home';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useTerminalState} from '@lynx/redux/reducers/terminal';
import {PageComponents} from '@lynx/utils/constants';
import ptyIpc from '@lynx_shared/ipc/pty';
import {memo, useEffect, useMemo} from 'react';

import {useRemoveTab} from './tabs/utils';

type Props = {tabID: string; pageID: string};

/**
 * Component that renders the content of the active tab.
 * It maps through all tabs and renders either the session view (browser/terminal) or the internal page.
 */
const AppPages = memo(({tabID, pageID}: Props) => {
  const runningCards = useCardsState('runningCard');
  const closeTabOnExit = useTerminalState('closeTabOnExit');

  const foundRunningCard = runningCards.find(card => card.tabId === tabID);

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

  if (foundRunningCard) return <RunningView runningCard={foundRunningCard} />;

  const Component = PageComponents[pageID] || HomePage;
  return <Component />;
});

export default AppPages;
