import {WebviewTag} from 'electron';
import {motion, Variants} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../Redux/AI/CardsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import TopBar from '../TopBar/TopBar';

const variants: Variants = {
  init: {scale: 0.95, opacity: 0},
  animate: {scale: 1, opacity: 1},
  exit: {scale: 0.95, opacity: 0},
};

/** Browser component that renders AI address in an iframe. */
const Browser = () => {
  const {address, browserId, currentView, id} = useCardsState('runningCard');
  const zoomFactor = useCardsState('webViewZoomFactor');
  const webViewRef = useRef<WebviewTag>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  const animate = useMemo(() => {
    return currentView === 'browser' ? 'animate' : 'exit';
  }, [currentView]);

  useEffect(() => {
    if (webViewRef.current) {
      const webview = webViewRef.current;
      webview.addEventListener('dom-ready', () => {
        setIsDomReady(true);

        rendererIpc.appWindow.webViewAttached(webview.getWebContentsId());
      });
    }
  }, [webViewRef, address]);

  useEffect(() => {
    const factor = zoomFactor.find(zoom => zoom.id === id);
    if (webViewRef.current && isDomReady && factor) {
      webViewRef.current.setZoomFactor(factor.zoom);
    } else if (webViewRef.current && isDomReady && !factor) {
      dispatch(cardsActions.updateZoomFactor({id, zoom: 1.0}));
    }
  }, [webViewRef, zoomFactor, id, isDomReady]);

  return (
    <>
      <TopBar />
      <motion.div
        className={
          `absolute top-11 bottom-1 inset-x-1 ${currentView === 'browser' && 'z-20'} overflow-hidden ` +
          `rounded-lg bg-white shadow-md dark:bg-LynxRaisinBlack`
        }
        tabIndex={-1}
        initial="init"
        animate={animate}
        variants={variants}>
        {address && (
          <webview
            src={address}
            id={browserId}
            ref={webViewRef}
            // @ts-ignore-next-line
            // eslint-disable-next-line react/no-unknown-property
            allowpopups="true"
            className="relative size-full"
          />
        )}
      </motion.div>
    </>
  );
};

export default Browser;
