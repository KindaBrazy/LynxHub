import {DidStartNavigationEvent, WebviewTag} from 'electron';
import {isNil} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
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
  const ExtTerminal = useMemo(() => extensionsData.runningAI.terminal, []);
  const ExtBrowser = useMemo(() => extensionsData.runningAI.browser, []);

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const [webViewRef, setWebViewRef] = useState<WebviewTag | null>(null);
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  useEffect(() => {
    if (isDomReady && webViewRef) {
      const didNavigate = (e: DidStartNavigationEvent) => {
        if (e.isMainFrame) dispatch(cardsActions.setRunningCardCurrentAddress({tabId: activeTab, address: e.url}));
      };
      webViewRef.removeEventListener('did-start-navigation', didNavigate);
      webViewRef.addEventListener('did-start-navigation', didNavigate);

      const onLoading = (isLoading: boolean) => dispatch(tabsActions.setActiveTabLoading(isLoading));

      webViewRef.removeEventListener('did-start-loading', () => onLoading(true));
      webViewRef.removeEventListener('did-stop-loading', () => onLoading(false));
      webViewRef.addEventListener('did-start-loading', () => onLoading(true));
      webViewRef.addEventListener('did-stop-loading', () => onLoading(false));

      return () => {
        webViewRef.removeEventListener('did-start-navigation', didNavigate);
        webViewRef.removeEventListener('did-start-loading', () => onLoading(true));
        webViewRef.removeEventListener('did-stop-loading', () => onLoading(false));
      };
    }

    return () => {};
  }, [isDomReady, webViewRef, activeTab]);

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
