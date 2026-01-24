import {useCardsState} from '@lynx/redux/reducers/cards';
import {RunningCard} from '@lynx/types';
import {memo, useMemo} from 'react';

import Browser_ActionButtons from './ActionButtons';
import Browser_AddressBar from './AddressBar';
import Browser_Search from './Search';
import Browser_Volume from './Volume';
import Browser_Zoom from './Zoom';

type Props = {
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
  tabID: string;
};

const Browser_TopBar = memo(({runningCard, setCustomAddress, tabID}: Props) => {
  const domReadyIds = useCardsState('browserDomReadyIds');

  const isDomReady = useMemo(() => domReadyIds.includes(runningCard.id), [domReadyIds, runningCard]);

  return (
    <>
      <Browser_ActionButtons
        tabID={tabID}
        id={runningCard.id}
        isDomReady={isDomReady}
        webuiAddress={runningCard.webUIAddress}
      />
      <Browser_AddressBar runningCard={runningCard} setCustomAddress={setCustomAddress} />

      {isDomReady && (
        <>
          <Browser_Search id={runningCard.id} tabID={runningCard.tabId} />
          <Browser_Zoom id={runningCard.id} />
          <Browser_Volume id={runningCard.id} tabId={runningCard.tabId} />
        </>
      )}
    </>
  );
});

export default Browser_TopBar;
