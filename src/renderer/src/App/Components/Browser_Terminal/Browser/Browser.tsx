import {WebviewTag} from 'electron';
import {useEffect, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {RunningCard} from '../../../Utils/Types';
import EmptyPage from './EmptyPage';

type Props = {
  webViewRef: WebviewTag | null;
  isDomReady: boolean;
  runningCard: RunningCard;
  initWebviewRef: (node: any) => void;
};

const Browser = ({runningCard, webViewRef, initWebviewRef, isDomReady}: Props) => {
  const {currentView, id, webUIAddress, customAddress} = runningCard;
  const zoomFactor = useCardsState('webViewZoomFactor');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const factor = zoomFactor.find(zoom => zoom.id === id);
    if (webViewRef && isDomReady && factor) {
      webViewRef.setZoomFactor(factor.zoom);
    } else if (webViewRef && isDomReady && !factor) {
      dispatch(cardsActions.updateZoomFactor({id, zoom: 1.0}));
    }
  }, [webViewRef, zoomFactor, id, isDomReady]);

  const finalAddress = useMemo(() => customAddress || webUIAddress, [customAddress, webUIAddress]);

  return (
    <div className={`${currentView === 'browser' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white shadow-md dark:bg-LynxRaisinBlack">
        {finalAddress ? (
          <webview
            // @ts-ignore-next-line
            // eslint-disable-next-line react/no-unknown-property
            allowpopups="true"
            src={finalAddress}
            ref={initWebviewRef}
            className="relative size-full"
          />
        ) : (
          <EmptyPage />
        )}
      </div>
    </div>
  );
};

export default Browser;
