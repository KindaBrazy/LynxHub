import {SerializeAddon} from '@xterm/addon-serialize';
import {isNil} from 'lodash';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {toMs} from '../../../../../cross/CrossUtils';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAllCardDataWithPath} from '../../Modules/ModuleLoader';
import {cardsActions} from '../../Redux/Reducer/CardsReducer';
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
    const removeListener = rendererIpc.pty.onTitle((_, targetID, title) => {
      if (targetID === id) setTerminalName(title);
    });

    return () => removeListener();
  }, []);

  useEffect(() => {
    const isBrowserView = currentView === 'browser';

    const terminalTitle = isEmptyRunning ? terminalName : allCardsData.find(card => card.id === id)?.title;

    const title = isBrowserView ? browserTitle : terminalTitle;

    const currentTitle = tabs.find(tab => tab.id === activeTab)?.title;
    if (title && title !== currentTitle) dispatch(tabsActions.setTabTitle({title, tabID: tabId}));
  }, [isEmptyRunning, id, tabId, currentView, activeTab, terminalName, browserTitle]);

  useEffect(() => {
    rendererIpc.storage.get('cardsConfig').then(result => {
      const custom = result.customRunBehavior.find(customRun => customRun.cardID === id);
      if (custom && custom.urlCatch.type === 'custom' && custom.urlCatch.customUrl) {
        const url = custom.urlCatch.customUrl;
        customUrlTimeout.current = setTimeout(
          () => {
            if (custom.browser === 'appBrowser') {
              dispatch(cardsActions.setRunningCardAddress({address: url, tabId: activeTab}));
              dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: activeTab}));
              rendererIpc.storageUtils.addBrowserRecent(url);
            } else {
              rendererIpc.win.openUrlDefaultBrowser(url);
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
  const [selectedTerminalText, setSelectedTerminalText] = useState<string>('');
  const clearTerminal = useRef<(() => void) | undefined>(undefined);

  return (
    <>
      <TopBar
        tabID={tabId}
        runningCard={runningCard}
        clearTerminal={clearTerminal}
        serializeAddon={serializeAddon}
        selectedTerminalText={selectedTerminalText}
      />
      {runningCard.type !== 'browser' &&
        (isNil(ExtTerminal) ? (
          <Terminal
            runningCard={runningCard}
            clearTerminal={clearTerminal}
            serializeAddon={serializeAddon}
            selectedTerminalText={selectedTerminalText}
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
