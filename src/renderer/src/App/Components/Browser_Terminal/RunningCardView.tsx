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
  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const allCards = useAllCards();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');
  const dispatch = useDispatch<AppDispatch>();

  const [webViewRef, setWebViewRef] = useState<WebviewTag | null>(null);
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  useEffect(() => {
    const isBrowserView = runningCard.currentView === 'browser';

    const terminalTitle = allCards.find(card => card.id === runningCard.id)?.title;
    const browserTitle = webViewRef && isDomReady ? webViewRef.getTitle() : undefined;

    const title = isBrowserView ? browserTitle : terminalTitle;

    const currentTitle = tabs.find(tab => tab.id === activeTab)?.title;
    if (title && title !== currentTitle) dispatch(tabsActions.setActiveTabTitle(title));
  }, [runningCard, webViewRef, tabs, activeTab, isDomReady]);

  useEffect(() => {
    if (webViewRef) {
      const didNavigate = (e: DidStartNavigationEvent) => {
        if (e.isMainFrame) {
          webViewRef.setUserAgent(getUserAgent());
          dispatch(cardsActions.setRunningCardCurrentAddress({tabId: activeTab, address: e.url}));
          dispatch(tabsActions.setActiveTabFavIcon({show: true, targetUrl: e.url}));
        }
      };
      webViewRef.removeEventListener('did-start-navigation', didNavigate);
      webViewRef.addEventListener('did-start-navigation', didNavigate);

      const onLoading = (isLoading: boolean) => dispatch(tabsActions.setActiveTabLoading(isLoading));

      webViewRef.removeEventListener('did-start-loading', () => onLoading(true));
      webViewRef.removeEventListener('did-stop-loading', () => onLoading(false));
      webViewRef.addEventListener('did-start-loading', () => onLoading(true));
      webViewRef.addEventListener('did-stop-loading', () => onLoading(false));

      const setTitle = () => dispatch(tabsActions.setActiveTabTitle(webViewRef.getTitle()));
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
        webview={webViewRef}
        isDomReady={isDomReady}
        runningCard={runningCard}
        terminalContent={terminalContent}
      />
      {isNil(ExtTerminal) ? (
        <Terminal runningCard={runningCard} setTerminalContent={setTerminalContent} />
      ) : (
        <ExtTerminal />
      )}
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
