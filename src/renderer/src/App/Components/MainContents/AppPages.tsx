import {useEffect, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {useTerminalState} from '../../Redux/Reducer/TerminalReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {PageComponents} from '../../Utils/Constants';
import RunningCardView from '../Browser_Terminal/RunningCardView';
import HomePage from '../Pages/ContentPages/Home/HomePage';

export default function AppPages() {
  const runningCards = useCardsState('runningCard');
  const closeTabOnExit = useTerminalState('closeTabOnExit');
  const tabs = useTabsState('tabs');
  const activePage = useTabsState('activePage');
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  const RunningView = useMemo(() => {
    const Container = extensionsData.runningAI.container;
    return Container ? Container : RunningCardView;
  }, []);

  useEffect(() => {
    const stopAI = (id: string) => {
      const runningCard = runningCards.find(card => card.id === id);
      if (!runningCard) return;

      if (runningCard.isEmptyRunning) {
        rendererIpc.pty.emptyProcess(runningCard.id, 'stop');
      } else {
        rendererIpc.pty.process(runningCard.id, 'stop', runningCard.id);
      }

      dispatch(tabsActions.setActiveTabLoading(false));
      dispatch(tabsActions.setTabIsTerminal({tabID: activeTab, isTerminal: false}));
      dispatch(cardsActions.stopRunningCard({tabId: activeTab}));
      rendererIpc.win.setDiscordRpAiRunning({running: false});
    };

    const removeListener = rendererIpc.pty.onExit((_, id) => {
      if (closeTabOnExit) stopAI(id);
    });

    return () => removeListener();
  }, [dispatch, runningCards, closeTabOnExit]);

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
