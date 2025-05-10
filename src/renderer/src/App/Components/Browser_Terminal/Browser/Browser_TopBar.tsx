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
  return (
    <>
      <Browser_ActionButtons tabID={tabID} id={runningCard.id} webuiAddress={runningCard.webUIAddress} />
      <AddressInput runningCard={runningCard} setCustomAddress={setCustomAddress} />
      <Browser_Search id={runningCard.id} />
      <Browser_Zoom id={runningCard.id} />
    </>
  );
}
