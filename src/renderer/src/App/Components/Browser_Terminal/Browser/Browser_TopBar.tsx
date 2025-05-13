import {useEffect, useState} from 'react';

import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_Search from './Browser_Search';
import Browser_Zoom from './Browser_Zoom';

type Props = {
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
  tabID: string;
};

export default function Browser_TopBar({runningCard, setCustomAddress, tabID}: Props) {
  const [isDomReady, setIsDomReady] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.browser.offDomReady();
    rendererIpc.browser.onDomReady((_, id, isReady) => {
      if (id === runningCard.id && isReady) setIsDomReady(true);
    });

    return () => rendererIpc.browser.offDomReady();
  }, [runningCard]);

  return (
    <>
      <Browser_ActionButtons tabID={tabID} id={runningCard.id} webuiAddress={runningCard.webUIAddress} />
      <AddressInput runningCard={runningCard} setCustomAddress={setCustomAddress} />

      {isDomReady && (
        <>
          <Browser_Search id={runningCard.id} />
          <Browser_Zoom id={runningCard.id} />
        </>
      )}
    </>
  );
}
