import {isNil} from 'lodash';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAllCards} from '../../Modules/ModuleLoader';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {RunningCard} from '../../Utils/Types';
import Browser from './Browser/Browser';
import Terminal from './Terminal/Terminal';
import TopBar from './TopBar/TopBar';

type Props = {runningCard: RunningCard};

const RunningCardView = ({runningCard}: Props) => {
  const {currentView, id, tabId, isEmptyRunning, browserTitle} = runningCard;

  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const allCards = useAllCards();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const dispatch = useDispatch<AppDispatch>();

  const [terminalName, setTerminalName] = useState<string>('');

  useEffect(() => {
    if (tabId === activeTab) {
      const isBrowserView = currentView === 'browser';
      dispatch(tabsActions.setTabIsTerminal({tabID: tabId, isTerminal: !isBrowserView}));
    }
  }, [tabId, currentView]);

  useEffect(() => {
    rendererIpc.pty.onTitle((_, targetID, title) => {
      if (targetID === id) setTerminalName(title);
    });

    return () => rendererIpc.pty.offTitle();
  }, []);

  useEffect(() => {
    const isBrowserView = currentView === 'browser';

    const terminalTitle = isEmptyRunning ? terminalName : allCards.find(card => card.id === id)?.title;

    const title = isBrowserView ? browserTitle : terminalTitle;

    const currentTitle = tabs.find(tab => tab.id === activeTab)?.title;
    if (title && title !== currentTitle) dispatch(tabsActions.setTabTitle({title, tabID: tabId}));
  }, [isEmptyRunning, id, tabId, currentView, activeTab, terminalName, browserTitle]);

  const [terminalContent, setTerminalContent] = useState<string>('');

  return (
    <>
      <TopBar tabID={tabId} runningCard={runningCard} terminalContent={terminalContent} />
      {runningCard.type !== 'browser' &&
        (isNil(ExtTerminal) ? (
          <Terminal runningCard={runningCard} setTerminalContent={setTerminalContent} />
        ) : (
          <ExtTerminal />
        ))}
      {runningCard.type !== 'terminal' && (isNil(ExtBrowser) ? <Browser runningCard={runningCard} /> : <ExtBrowser />)}
    </>
  );
};

export default RunningCardView;
