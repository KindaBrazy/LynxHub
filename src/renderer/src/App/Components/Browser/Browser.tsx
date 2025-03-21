import {WebviewTag} from 'electron';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {LYNXHUB_HOMEPAGE} from '../../../../../cross/CrossConstants';
import {cardsActions, useCardsState} from '../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {RunningCard} from '../../Utils/Types';
import Browser_TopBar from './Browser_TopBar/Browser_TopBar';

type Props = {runningCard: RunningCard};
const Browser = ({runningCard}: Props) => {
  const {currentView, id, webUIAddress} = runningCard;
  const zoomFactor = useCardsState('webViewZoomFactor');
  const webViewRef = useRef<WebviewTag>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  useEffect(() => {
    if (webViewRef.current) {
      const webview = webViewRef.current;
      webview.addEventListener('dom-ready', () => {
        setIsDomReady(true);

        rendererIpc.appWindow.webViewAttached(webview.getWebContentsId());
      });
    }
  }, [webViewRef, webUIAddress]);

  useEffect(() => {
    const factor = zoomFactor.find(zoom => zoom.id === id);
    if (webViewRef.current && isDomReady && factor) {
      webViewRef.current.setZoomFactor(factor.zoom);
    } else if (webViewRef.current && isDomReady && !factor) {
      dispatch(cardsActions.updateZoomFactor({id, zoom: 1.0}));
    }
  }, [webViewRef, zoomFactor, id, isDomReady]);

  return (
    <div className={`${currentView === 'browser' ? 'block' : 'hidden'}`}>
      <Browser_TopBar webview={webViewRef} isDomReady={isDomReady} currentView={currentView} />
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white shadow-md dark:bg-LynxRaisinBlack">
        {!webUIAddress && (
          <webview
            ref={webViewRef}
            id={webUIAddress}
            // @ts-ignore-next-line
            // eslint-disable-next-line react/no-unknown-property
            allowpopups="true"
            src={LYNXHUB_HOMEPAGE}
            className="relative size-full"
          />
        )}
      </div>
    </div>
  );
};

export default Browser;
