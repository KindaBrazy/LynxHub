import {DidStartNavigationEvent, WebviewTag} from 'electron';
import {isNil} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {useAllCards} from '../../Modules/ModuleLoader';
import {cardsActions} from '../../Redux/Reducer/CardsReducer';
import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {RunningCard} from '../../Utils/Types';
import {getUserAgent} from '../../Utils/UtilFunctions';
import Browser from './Browser/Browser';
import Terminal from './Terminal/Terminal';
import TopBar from './TopBar/TopBar';

type Props = {runningCard: RunningCard};

const RunningCardView = ({runningCard}: Props) => {
  const {currentView, id, tabId, isEmptyRunning} = runningCard;

  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const allCards = useAllCards();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const dispatch = useDispatch<AppDispatch>();

  const [terminalName, setTerminalName] = useState<string>('');

  const [webViewRef, setWebViewRef] = useState<WebviewTag | null>(null);
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

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
    const browserTitle = webViewRef && isDomReady ? webViewRef.getTitle() : 'Browser';

    const title = isBrowserView ? browserTitle : terminalTitle;

    const currentTitle = tabs.find(tab => tab.id === activeTab)?.title;
    if (title && title !== currentTitle) dispatch(tabsActions.setTabTitle({title, tabID: tabId}));
  }, [isEmptyRunning, id, tabId, currentView, webViewRef, activeTab, isDomReady, terminalName]);

  useEffect(() => {
    if (webViewRef) {
      const didNavigate = (e: DidStartNavigationEvent) => {
        if (e.isMainFrame) {
          webViewRef.setUserAgent(getUserAgent());
          dispatch(cardsActions.setRunningCardCurrentAddress({tabId: tabId, address: e.url}));
        }
      };
      webViewRef.removeEventListener('did-start-navigation', didNavigate);
      webViewRef.addEventListener('did-start-navigation', didNavigate);

      webViewRef.addEventListener('page-favicon-updated', e => {
        const url = e.favicons.find(icon => icon.includes('.ico')) || e.favicons[0] || '';
        dispatch(tabsActions.setTabFavIcon({show: true, url, tabID: tabId}));

        const targetUrl = (e.target as WebviewTag).src;
        rendererIpc.storageUtils.addBrowserRecentFavIcon(targetUrl, url);
      });

      const onLoading = (isLoading: boolean) => dispatch(tabsActions.setTabLoading({isLoading, tabID: tabId}));

      webViewRef.removeEventListener('did-start-loading', () => onLoading(true));
      webViewRef.removeEventListener('did-stop-loading', () => onLoading(false));
      webViewRef.addEventListener('did-start-loading', () => onLoading(true));
      webViewRef.addEventListener('did-stop-loading', () => onLoading(false));

      const setTitle = () => dispatch(tabsActions.setTabTitle({title: webViewRef.getTitle(), tabID: tabId}));
      webViewRef.addEventListener('page-title-updated', setTitle);

      return () => {
        webViewRef.removeEventListener('did-start-navigation', didNavigate);
        webViewRef.removeEventListener('page-title-updated', setTitle);
        webViewRef.removeEventListener('did-start-loading', () => onLoading(true));
        webViewRef.removeEventListener('did-stop-loading', () => onLoading(false));
      };
    }

    return () => {};
  }, [webViewRef, activeTab]);

  const initWebviewRef = useCallback((node: WebviewTag) => {
    if (node !== null) {
      setWebViewRef(node);
      node.addEventListener(
        'dom-ready',
        () => {
          setIsDomReady(true);
          rendererIpc.appWindow.webViewAttached(node.getWebContentsId());
        },
        // @ts-ignore
        {once: true},
      );
    }
  }, []);

  const [terminalContent, setTerminalContent] = useState<string>('');

  return (
    <>
      <TopBar
        tabID={tabId}
        webview={webViewRef}
        isDomReady={isDomReady}
        runningCard={runningCard}
        terminalContent={terminalContent}
      />
      {runningCard.type !== 'browser' &&
        (isNil(ExtTerminal) ? (
          <Terminal runningCard={runningCard} setTerminalContent={setTerminalContent} />
        ) : (
          <ExtTerminal />
        ))}
      {runningCard.type !== 'terminal' &&
        (isNil(ExtBrowser) ? (
          <Browser
            webViewRef={webViewRef}
            isDomReady={isDomReady}
            runningCard={runningCard}
            initWebviewRef={initWebviewRef}
          />
        ) : (
          <ExtBrowser />
        ))}
    </>
  );
};

export default RunningCardView;
