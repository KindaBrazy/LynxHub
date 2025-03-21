import {WebviewTag} from 'electron';
import {Dispatch, RefObject, SetStateAction, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {LYNXHUB_HOMEPAGE} from '../../../../../../cross/CrossConstants';
import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';

type Props = {
  webViewRef: RefObject<WebviewTag | null>;
  isDomReady: boolean;
  setIsDomReady: Dispatch<SetStateAction<boolean>>;
  runningCard: RunningCard;
};
const Browser = ({runningCard, webViewRef, isDomReady, setIsDomReady}: Props) => {
  const {currentView, id, webUIAddress} = runningCard;
  const zoomFactor = useCardsState('webViewZoomFactor');
  const dispatch = useDispatch<AppDispatch>();

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
