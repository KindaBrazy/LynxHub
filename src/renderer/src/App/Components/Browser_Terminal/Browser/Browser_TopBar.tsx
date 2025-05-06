import {WebviewTag} from 'electron';

import {RunningCard} from '../../../Utils/Types';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_Zoom from './Browser_Zoom';
import BrowserSearch from './BrowserSearch';

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
        isDomReady={isDomReady}
        webuiAddress={runningCard.webUIAddress}
      />
      <AddressInput runningCard={runningCard} setCustomAddress={setCustomAddress} />
      <BrowserSearch webview={webview} />
      <Browser_Zoom id={runningCard.id} />
    </>
  );
}
