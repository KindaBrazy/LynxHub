import {WebviewTag} from 'electron';

import {RunningCard} from '../../../Utils/Types';
import AddressInput from './AddressInput';
import Browser_ActionButtons from './Browser_ActionButtons';
import Browser_Zoom from './Browser_Zoom';

type Props = {
  webview: WebviewTag | null;
  isDomReady: boolean;
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
};

export default function Browser_TopBar({webview, isDomReady, runningCard, setCustomAddress}: Props) {
  return (
    <>
      <Browser_ActionButtons webview={webview} isDomReady={isDomReady} webuiAddress={runningCard.webUIAddress} />
      <AddressInput runningCard={runningCard} setCustomAddress={setCustomAddress} />
      <Browser_Zoom id={runningCard.id} />
    </>
  );
}
