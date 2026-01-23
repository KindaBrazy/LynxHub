import browserIpc from '@lynx_shared/ipc/browser';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useIsActiveTab} from '../../../layouts/tabs/utils';
import {useCardsState} from '../../../redux/reducers/cards';
import {useVolumeState} from '../../../redux/reducers/volume';
import {RunningCard} from '../../../types';
import EmptyPage from './EmptyPage';
import {Browser_Error} from './Error';

type FailedLoad = {errorCode: number; errorDescription: string; validatedURL: string};
type Props = {runningCard: RunningCard};

const Browser = memo(({runningCard}: Props) => {
  const {currentView, id, webUIAddress, customAddress, type, tabId} = runningCard;
  const isActiveTab = useIsActiveTab(tabId);
  const browserDomReadyIds = useCardsState('browserDomReadyIds');
  const tabVolumes = useVolumeState('tabVolumes');
  const tabMuted = useVolumeState('tabMuted');
  const globalMuted = useVolumeState('globalMuted');
  const volumeAppliedRef = useRef(false);

  const [failedLoad, setFailedLoad] = useState<FailedLoad | undefined>(undefined);

  const isDomReady = useMemo(() => browserDomReadyIds.includes(id), [browserDomReadyIds, id]);

  const finalAddress = useMemo(() => customAddress || webUIAddress, [customAddress, webUIAddress]);

  useEffect(() => {
    if (finalAddress) browserIpc.send.loadURL(id, finalAddress);
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

    return () => {
      offFailed();
      offClearFailed();
    };
  }, []);

  useEffect(() => {
    const validAddress = !isEmpty(runningCard.customAddress || runningCard.webUIAddress) && !failedLoad;
    browserIpc.send.setVisible(runningCard.id, validAddress && isActiveTab && runningCard.currentView === 'browser');
  }, [runningCard, isActiveTab]);

  const handleReload = useCallback(() => {
    browserIpc.send.reload(id);
  }, [id]);

  return (
    <div
      className={
        `absolute inset-0 top-10! bg-white shadow-md overflow-hidden ` +
        `dark:bg-LynxNearBlack ${currentView === 'browser' ? 'block' : 'hidden'}`
      }>
      {isEmpty(finalAddress) ? (
        <EmptyPage type={type} />
      ) : failedLoad ? (
        <Browser_Error error={failedLoad} onReload={handleReload} />
      ) : null}
    </div>
  );
});

export default Browser;
