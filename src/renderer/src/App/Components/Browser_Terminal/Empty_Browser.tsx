import {DidStartNavigationEvent, WebviewTag} from 'electron';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions} from '../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {RunningCard} from '../../Utils/Types';
import Browser from './Browser/Browser';
import Browser_TopBar from './Browser/Browser_TopBar';
import SwitchAndTerminate from './TopBar/SwitchAndTerminate';

const initialTerminal: RunningCard = {
  currentView: 'browser',
  id: '',
  tabId: '',
  webUIAddress: '',
  customAddress: '',
  currentAddress: '',
  startTime: '',
};

type Props = {tabId: string};

export default function Empty_Browser({tabId}: Props) {
  const [runningCard, setRunningCard] = useState<RunningCard>({
    ...initialTerminal,
    id: tabId,
    startTime: new Date().toString(),
  });
  const [webViewRef, setWebViewRef] = useState<WebviewTag | null>(null);
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  const setCustomAddress = (address: string) => {
    setRunningCard(prevState => ({...prevState, customAddress: address}));
  };

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

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

  return (
    <>
      <div
        className={
          'h-10 inset-x-0 top-0 absolute bg-white dark:bg-LynxRaisinBlack' +
          ' flex flex-row gap-x-1 px-2 py-1 items-center justify-between'
        }>
        <Browser_TopBar
          webview={webViewRef}
          isDomReady={isDomReady}
          runningCard={runningCard}
          setCustomAddress={setCustomAddress}
        />
        <SwitchAndTerminate isEmptyBrowser={true} runningCard={runningCard} />
      </div>
      <Browser
        webViewRef={webViewRef}
        isDomReady={isDomReady}
        runningCard={runningCard}
        initWebviewRef={initWebviewRef}
      />
    </>
  );
}
