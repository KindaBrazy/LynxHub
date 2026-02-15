import {useCardsState} from '@lynx/redux/reducers/cards';
import {RunningCard} from '@lynx/types';
import {memo, useMemo} from 'react';

import BrowserActionButtons from './ActionButtons';
import BrowserAddressBar from './AddressBar';
import BrowserSearch from './Search';
import BrowserVolume from './Volume';
import BrowserZoom from './Zoom';

type Props = {
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
  tabID: string;
};

const BrowserTopBar = memo(({runningCard, setCustomAddress, tabID}: Props) => {
  const domReadyIds = useCardsState('browserDomReadyIds');

  const isDomReady = useMemo(() => domReadyIds.includes(runningCard.id), [domReadyIds, runningCard]);

  return (
    <>
      <BrowserActionButtons
        tabID={tabID}
        id={runningCard.id}
        isDomReady={isDomReady}
        webuiAddress={runningCard.webUIAddress}
      />
      <BrowserAddressBar runningCard={runningCard} setCustomAddress={setCustomAddress} />

      {isDomReady && (
        <>
          <BrowserSearch id={runningCard.id} tabID={runningCard.tabId} />
          <BrowserZoom id={runningCard.id} />
          <BrowserVolume id={runningCard.id} tabId={runningCard.tabId} />
        </>
      )}
    </>
  );
});

export default BrowserTopBar;
