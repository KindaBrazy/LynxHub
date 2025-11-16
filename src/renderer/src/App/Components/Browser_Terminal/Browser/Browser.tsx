import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import {useIsActiveTab} from '../../Tabs/Tab_Utils';
import {Browser_Error} from './Browser_Error';
import EmptyPage from './EmptyPage';

type FailedLoad = {errorCode: number; errorDescription: string; validatedURL: string};
type Props = {runningCard: RunningCard};

const Browser = memo(({runningCard}: Props) => {
  const {currentView, id, webUIAddress, customAddress, type, tabId} = runningCard;
  const isActiveTab = useIsActiveTab(tabId);

  const [failedLoad, setFailedLoad] = useState<FailedLoad | undefined>(undefined);

  const finalAddress = useMemo(() => {
    const result = customAddress || webUIAddress;
    if (result) rendererIpc.browser.loadURL(id, result);
    return result;
  }, [customAddress, webUIAddress]);

  useEffect(() => {
    if (isActiveTab) rendererIpc.browser.focusWebView(id);
  }, [isActiveTab]);

  useEffect(() => {
    const offFailed = rendererIpc.browser.onFailedLoadUrl((_, targetID, errorCode, errorDescription, validatedURL) => {
      if (targetID === id) {
        setFailedLoad({errorCode, errorDescription, validatedURL});
      }
    });
    const offClearFailed = rendererIpc.browser.onClearFailed((_, targetID) => {
      if (targetID === id) setFailedLoad(undefined);
    });

    return () => {
      offFailed();
      offClearFailed();
    };
  }, []);

  useEffect(() => {
    const validAddress = !isEmpty(runningCard.customAddress || runningCard.webUIAddress) && !failedLoad;
    rendererIpc.browser.setVisible(
      runningCard.id,
      validAddress && isActiveTab && runningCard.currentView === 'browser',
    );
  }, [runningCard, isActiveTab]);

  const handleReload = useCallback(() => {
    rendererIpc.browser.reload(id);
  }, [id]);

  return (
    <div
      className={
        `absolute inset-0 !top-10 bg-white shadow-md overflow-hidden ` +
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
