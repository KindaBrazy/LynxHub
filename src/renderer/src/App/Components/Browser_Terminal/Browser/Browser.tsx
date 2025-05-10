import {isEmpty} from 'lodash';
import {useMemo} from 'react';

import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import EmptyPage from './EmptyPage';

type Props = {runningCard: RunningCard};

const Browser = ({runningCard}: Props) => {
  const {currentView, id, webUIAddress, customAddress, type} = runningCard;

  const finalAddress = useMemo(() => {
    const result = customAddress || webUIAddress;
    if (result) rendererIpc.browser.loadURL(id, result);
    return result;
  }, [customAddress, webUIAddress]);

  return (
    <div className={`${currentView === 'browser' ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 !top-10 overflow-hidden bg-white shadow-md dark:bg-LynxRaisinBlack">
        {isEmpty(finalAddress) && <EmptyPage type={type} />}
      </div>
    </div>
  );
};

export default Browser;
