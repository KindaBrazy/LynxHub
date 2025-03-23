import {WebviewTag} from 'electron';
import {isNil} from 'lodash';
import {useCallback, useMemo, useState} from 'react';
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

  const setAddressBar = useCallback(
    (address: string) => {
      dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address}));
    },
    [activeTab],
  );

  const initWebviewRef = useCallback(node => {
    if (node !== null) {
      setWebViewRef(node);

      node.addEventListener(
        'dom-ready',
        () => {
          console.log('dom ready');
          setIsDomReady(true);
          rendererIpc.appWindow.webViewAttached(node.getWebContentsId());
          node.addEventListener('did-navigate-in-page', e => {
            setAddressBar(e.url);
          });
        },
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
