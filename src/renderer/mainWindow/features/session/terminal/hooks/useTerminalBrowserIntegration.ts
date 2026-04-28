import {getCardMethod, useAllCardMethods} from '@lynx/plugins/modules';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {AppDispatch} from '@lynx/redux/store';
import {CustomRunBehaviorData} from '@lynx_common/types/ipc';
import {toMs} from '@lynx_common/utils';
import applicationIpc from '@lynx_shared/ipc/application';
import ptyIpc from '@lynx_shared/ipc/pty';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {isEmpty} from 'lodash-es';
import {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {catchTerminalAddress} from '../utils';

export function useTerminalBrowserIntegration(id: string, tabId: string, webUIAddress: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const allMethods = useAllCardMethods();

  const [browserBehavior, setBrowserBehavior] = useState<CustomRunBehaviorData['browser']>('appBrowser');
  const [urlCatchBehavior, setUrlCatchBehavior] = useState<CustomRunBehaviorData['urlCatch'] | undefined>(undefined);

  useEffect(() => {
    storageIpc.get('cardsConfig').then(result => {
      const custom = result.customRunBehavior.find(customRun => customRun.cardID === id);
      if (custom) {
        setBrowserBehavior(custom.browser);
        setUrlCatchBehavior(custom.urlCatch);
      }
    });
  }, [id]);

  // Store refs for values needed in setTimeout/callbacks
  const browserBehaviorRef = useRef(browserBehavior);
  const tabIdRef = useRef(tabId);

  useEffect(() => {
    browserBehaviorRef.current = browserBehavior;
  }, [browserBehavior]);

  useEffect(() => {
    tabIdRef.current = tabId;
  }, [tabId]);

  useEffect(() => {
    const openUrl = (url: string | undefined, delaySeconds?: number) => {
      if (!url) return;

      const effectiveDelaySeconds = typeof delaySeconds === 'number' ? delaySeconds : 0;
      const delayMs = effectiveDelaySeconds > 0 ? toMs(effectiveDelaySeconds, 'seconds') : 0;

      const executeOpen = () => {
        if (browserBehaviorRef.current === 'appBrowser') {
          dispatch(cardsActions.setRunningCardAddress({address: url, tabId: tabIdRef.current}));
          dispatch(cardsActions.setRunningCardView({view: 'browser', tabId: tabIdRef.current}));
          storageUtilsIpc.send.addBrowserRecent(url);
        } else {
          applicationIpc.send.openUrlDefaultBrowser(url);
        }
      };

      if (delayMs > 0) {
        setTimeout(executeOpen, delayMs);
      } else {
        executeOpen();
      }
    };

    const offData = ptyIpc.onData((dataID, data) => {
      if (dataID === id) {
        const isAddressEmpty = isEmpty(webUIAddress);

        if (isAddressEmpty) {
          const catchUrlByModule = urlCatchBehavior ? urlCatchBehavior.type === 'module' : true;
          const catchLine = urlCatchBehavior ? urlCatchBehavior.type === 'findLine' : false;
          const targetLine = urlCatchBehavior?.findLine;

          if (catchUrlByModule) {
            const catchAddress = getCardMethod(allMethods, id, 'catchAddress');
            const url = catchAddress ? catchAddress(data) : undefined;
            const moduleDelay = urlCatchBehavior?.moduleDelay ?? 0;
            openUrl(url, moduleDelay);
          } else if (catchLine && targetLine) {
            const url = catchTerminalAddress(data, targetLine);
            openUrl(url);
          }
        }
      }
    });

    return () => offData();
  }, [id, webUIAddress, browserBehavior, dispatch, allMethods, tabId, urlCatchBehavior]);

  return {browserBehavior, urlCatchBehavior};
}
