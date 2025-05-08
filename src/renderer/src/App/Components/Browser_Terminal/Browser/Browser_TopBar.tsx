import {WebviewTag} from 'electron';

import {RunningCard} from '../../../Utils/Types';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_Search from './Browser_Search';
import Browser_Zoom from './Browser_Zoom';

type Props = {
  webview: WebviewTag | null;
  isDomReady: boolean;
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
  tabID: string;
};

export default function Browser_TopBar({webview, isDomReady, runningCard, setCustomAddress, tabID}: Props) {
  return (
    <>
      <Browser_ActionButtons
        tabID={tabID}
        webview={webview}
        id={runningCard.id}
        isDomReady={isDomReady}
        webuiAddress={runningCard.webUIAddress}
      />
      <AddressInput runningCard={runningCard} setCustomAddress={setCustomAddress} />
      <Browser_Search id={runningCard.id} />
      <Browser_Zoom id={runningCard.id} />
    </>
  );
}
