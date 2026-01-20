import {toMs} from '@lynx_cross/utils';
import rendererIpc from '@lynx_shared/ipc';
import applicationIpc from '@lynx_shared/ipc/application';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {SearchAddon} from '@xterm/addon-search';
import {SerializeAddon} from '@xterm/addon-serialize';
import {isNil} from 'lodash';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../plugins/extensions/loader';
import {useAllCardDataWithPath} from '../../plugins/modules';
import {cardsActions} from '../../redux/reducers/cards';
import {tabsActions, useTabsState} from '../../redux/reducers/tabs';
import {AppDispatch} from '../../redux/store';
import {RunningCard} from '../../types';
import Browser from './browser';
import Terminal from './terminal';
import TopBar from './top_bar';

type Props = {runningCard: RunningCard};

const RunningCardView = ({runningCard}: Props) => {
  const {currentView, id, tabId, isEmptyRunning, browserTitle} = runningCard;

  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const allCardsData = useAllCardDataWithPath();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const dispatch = useDispatch<AppDispatch>();

  const [terminalName, setTerminalName] = useState<string>('');

  const customUrlTimeout = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (tabId === activeTab) {
      const isBrowserView = currentView === 'browser';
      dispatch(tabsActions.setTabIsTerminal({tabID: tabId, isTerminal: !isBrowserView}));
    }
  }, [tabId, currentView]);

  useEffect(() => {
    const offTitle = rendererIpc.pty.onTitle((_, targetID, title) => {
      if (targetID === id) setTerminalName(title);
    });

    return () => offTitle();
  }, []);

  useEffect(() => {
    const isBrowserView = currentView === 'browser';

    const terminalTitle = isEmptyRunning ? terminalName : allCardsData.find(card => card.id === id)?.title;

    const title = isBrowserView ? browserTitle : terminalTitle;

    const currentTitle = tabs.find(tab => tab.id === activeTab)?.title;
    if (title && title !== currentTitle) dispatch(tabsActions.setTabTitle({title, tabID: tabId}));
  }, [isEmptyRunning, id, tabId, currentView, activeTab, terminalName, browserTitle]);

  useEffect(() => {
    storageIpc.get('cardsConfig').then(result => {
      const custom = result.customRunBehavior.find(customRun => customRun.cardID === id);
      if (custom && custom.urlCatch.type === 'custom' && custom.urlCatch.customUrl) {
        const url = custom.urlCatch.customUrl;
        customUrlTimeout.current = setTimeout(
          () => {
            if (custom.browser === 'appBrowser') {
              dispatch(cardsActions.setRunningCardAddress({address: url, tabId: activeTab}));
              dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: activeTab}));
              storageUtilsIpc.send.addBrowserRecent(url);
            } else {
              applicationIpc.send.openUrlDefaultBrowser(url);
            }
          },
          toMs(custom.urlCatch.delay, 'seconds'),
        );
      }
    });

    return () => {
      clearTimeout(customUrlTimeout.current);
      customUrlTimeout.current = undefined;
    };
  }, [id]);

  const [serializeAddon] = useState<SerializeAddon>(new SerializeAddon());
  const [searchAddon] = useState<SearchAddon>(new SearchAddon());
  const [selectedTerminalText, setSelectedTerminalText] = useState<string>('');
  const clearTerminal = useRef<(() => void) | undefined>(undefined);

  return (
    <>
      <TopBar
        tabID={tabId}
        runningCard={runningCard}
        searchAddon={searchAddon}
        clearTerminal={clearTerminal}
        serializeAddon={serializeAddon}
        selectedTerminalText={selectedTerminalText}
      />
      {runningCard.type !== 'browser' &&
        (isNil(ExtTerminal) ? (
          <Terminal
            runningCard={runningCard}
            searchAddon={searchAddon}
            clearTerminal={clearTerminal}
            serializeAddon={serializeAddon}
            setSelectedTerminalText={setSelectedTerminalText}
          />
        ) : (
          <ExtTerminal />
        ))}
      {runningCard.type !== 'terminal' && (isNil(ExtBrowser) ? <Browser runningCard={runningCard} /> : <ExtBrowser />)}
    </>
  );
};

export default RunningCardView;
