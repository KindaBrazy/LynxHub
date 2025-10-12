import {memo, useMemo} from 'react';

import {useCardsState} from '../../../Redux/Reducer/CardsReducer';
import {RunningCard} from '../../../Utils/Types';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_AddressBar from './Browser_AddressBar';
import Browser_Search from './Browser_Search';
import Browser_Zoom from './Browser_Zoom';

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
      <Browser_ActionButtons tabID={tabID} id={runningCard.id} webuiAddress={runningCard.webUIAddress} />
      <Browser_AddressBar runningCard={runningCard} setCustomAddress={setCustomAddress} />

      {isDomReady && (
        <>
          <Browser_Search id={runningCard.id} tabID={runningCard.tabId} />
          <Browser_Zoom id={runningCard.id} />
        </>
      )}
    </>
  );
});

export default Browser_TopBar;
