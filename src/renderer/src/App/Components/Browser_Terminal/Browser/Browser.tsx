import {isEmpty} from 'lodash';
import {useEffect, useMemo} from 'react';

import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import EmptyPage from './EmptyPage';

type Props = {runningCard: RunningCard};

const Browser = ({runningCard}: Props) => {
  const activeTab = useTabsState('activeTab');
  const {currentView, id, webUIAddress, customAddress, type, tabId} = runningCard;

  const finalAddress = useMemo(() => {
    const result = customAddress || webUIAddress;
    if (result) rendererIpc.browser.loadURL(id, result);
    return result;
  }, [customAddress, webUIAddress]);

  useEffect(() => {
    if (activeTab === tabId) rendererIpc.browser.focusWebView(id);
  }, [activeTab, tabId]);

  return (
    <div
      className={
        `absolute inset-0 !top-10 bg-white shadow-md overflow-hidden ` +
        `dark:bg-LynxRaisinBlack ${currentView === 'browser' ? 'block' : 'hidden'}`
      }>
      {isEmpty(finalAddress) && <EmptyPage type={type} />}
    </div>
  );
};

export default Browser;
