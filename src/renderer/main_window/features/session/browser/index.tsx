import browserIpc from '@lynx_shared/ipc/browser';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useIsActiveTab} from '../../../layouts/tabs/utils';
import {cardsActions, useCardsState} from '../../../redux/reducers/cards';
import {useVolumeState} from '../../../redux/reducers/volume';
import {AppDispatch} from '../../../redux/store';
import {RunningCard} from '../../../types';
import EmptyPage from './EmptyPage';
import {Browser_Error} from './Error';

type FailedLoad = {errorCode: number; errorDescription: string; validatedURL: string};
type Props = {runningCard: RunningCard};

const Browser = memo(({runningCard}: Props) => {
  const {currentView, id, webUIAddress, customAddress, type, tabId} = runningCard;
  const dispatch = useDispatch<AppDispatch>();
  const isActiveTab = useIsActiveTab(tabId);
  const browserDomReadyIds = useCardsState('browserDomReadyIds');
  const tabVolumes = useVolumeState('tabVolumes');
  const tabMuted = useVolumeState('tabMuted');
  const globalMuted = useVolumeState('globalMuted');
  const volumeAppliedRef = useRef(false);

  const [failedLoad, setFailedLoad] = useState<FailedLoad | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const isDomReady = useMemo(() => browserDomReadyIds.includes(id), [browserDomReadyIds, id]);

  const finalAddress = useMemo(() => customAddress || webUIAddress, [customAddress, webUIAddress]);

  useEffect(() => {
    if (finalAddress) {
      // Always load the URL when finalAddress changes, even if it's in history
      // This ensures clicking favorites/recents works even after navigating back
      browserIpc.send.loadURL(id, finalAddress);
    } else {
      // Load about:blank to establish navigation history entry for empty page
      browserIpc.send.loadURL(id, 'about:blank');
    }
  }, [id, finalAddress]);

  useEffect(() => {
    if (isActiveTab) browserIpc.send.focusWebView(id);
  }, [isActiveTab]);

  // Apply volume settings when browser becomes dom-ready
  useEffect(() => {
    if (isDomReady && !volumeAppliedRef.current) {
      volumeAppliedRef.current = true;

      const applyVolumeSettings = async () => {
        const tabVolume = tabVolumes[tabId] ?? 100;
        const isTabMuted = tabMuted[tabId] || false;

        // These calls may silently fail during page load - that's expected
        await browserIpc.invoke.setVolume(id, tabVolume);

        // Apply effective mute (tab muted OR global muted)
        const effectiveMute = isTabMuted || globalMuted;
        await browserIpc.invoke.setMuted(id, effectiveMute);
      };

      applyVolumeSettings();
    }
  }, [isDomReady, id, tabId, tabVolumes, tabMuted, globalMuted]);

  useEffect(() => {
    const offFailed = browserIpc.on.failedLoadUrl((targetID, errorCode, errorDescription, validatedURL) => {
      if (targetID === id) {
        setFailedLoad({errorCode, errorDescription, validatedURL});
      }
    });
    const offClearFailed = browserIpc.on.clearFailed(targetID => {
      if (targetID === id) setFailedLoad(undefined);
    });
    const offUrlChange = browserIpc.on.urlChanged((targetID, url) => {
      if (targetID === id) {
        setCurrentUrl(url);
        // Sync customAddress with actual browser URL for back/forward navigation
        if (url === 'about:blank' && customAddress) {
          // Clear customAddress when navigating back to blank page
          dispatch(cardsActions.setRunningCardCustomAddress({tabId, address: ''}));
        } else if (url !== 'about:blank' && customAddress !== url) {
          // Update customAddress when navigating forward/back to match actual URL
          dispatch(cardsActions.setRunningCardCustomAddress({tabId, address: url}));
        }
      }
    });

    return () => {
      offFailed();
      offClearFailed();
      offUrlChange();
    };
  }, [id, customAddress, tabId, dispatch]);

  useEffect(() => {
    const validAddress = !isEmpty(runningCard.customAddress || runningCard.webUIAddress) && !failedLoad;
    const isOnBlankPage = currentUrl === 'about:blank';
    const shouldShowWebview = validAddress && !isOnBlankPage && isActiveTab && runningCard.currentView === 'browser';
    browserIpc.send.setVisible(runningCard.id, shouldShowWebview);
  }, [runningCard, isActiveTab, failedLoad, currentUrl]);

  const handleReload = useCallback(() => {
    browserIpc.send.reload(id);
  }, [id]);

  const showEmptyPage = isEmpty(finalAddress) || currentUrl === 'about:blank';

  return (
    <div
      className={
        `absolute inset-0 top-10! bg-white shadow-md overflow-hidden ` +
        `dark:bg-LynxNearBlack ${currentView === 'browser' ? 'block' : 'hidden'}`
      }>
      {showEmptyPage ? (
        <EmptyPage type={type} />
      ) : failedLoad ? (
        <Browser_Error error={failedLoad} onReload={handleReload} />
      ) : null}
    </div>
  );
});

export default Browser;
