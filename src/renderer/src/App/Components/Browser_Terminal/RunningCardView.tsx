import {DidStartNavigationEvent, WebviewTag} from 'electron';
import {isNil} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import {cardsActions} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
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

      return () => webViewRef.removeEventListener('did-start-navigation', didNavigate);
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

  return (
    <>
      <TopBar webview={webViewRef} isDomReady={isDomReady} runningCard={runningCard} />
      {isNil(ExtTerminal) ? <Terminal runningCard={runningCard} /> : <ExtTerminal />}
      {isNil(ExtBrowser) ? (
        <Browser
          webViewRef={webViewRef}
          isDomReady={isDomReady}
          runningCard={runningCard}
          initWebviewRef={initWebviewRef}
        />
      ) : (
        <ExtBrowser />
      )}
    </>
  );
};

export default RunningCardView;
