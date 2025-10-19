import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import {Browser_Error} from './Browser_Error';
import EmptyPage from './EmptyPage';

type FailedLoad = {errorCode: number; errorDescription: string; validatedURL: string};
type Props = {runningCard: RunningCard};

const Browser = memo(({runningCard}: Props) => {
  const activeTab = useTabsState('activeTab');
  const {currentView, id, webUIAddress, customAddress, type, tabId} = runningCard;

  const [failedLoad, setFailedLoad] = useState<FailedLoad | undefined>(undefined);

  const finalAddress = useMemo(() => {
    const result = customAddress || webUIAddress;
    if (result) rendererIpc.browser.loadURL(id, result);
    return result;
  }, [customAddress, webUIAddress]);

  useEffect(() => {
    if (activeTab === tabId) rendererIpc.browser.focusWebView(id);
  }, [activeTab, tabId]);

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
      validAddress && runningCard.tabId === activeTab && runningCard.currentView === 'browser',
    );
  }, [runningCard, activeTab]);

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
