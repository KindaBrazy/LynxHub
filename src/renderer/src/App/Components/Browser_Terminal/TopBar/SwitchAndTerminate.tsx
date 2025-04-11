import {RunningCard} from '../../../Utils/Types';
import Switch from './Switch';
import Terminate from './Terminate';

type Props = {runningCard: RunningCard; isEmptyTerminal?: boolean};

export default function SwitchAndTerminate({runningCard, isEmptyTerminal}: Props) {
  return (
    <div className="flex flex-row gap-x-1">
      {!isEmptyTerminal && <Switch currentView={runningCard.currentView} />}
      <Terminate runningCard={runningCard} isEmptyTerminal={isEmptyTerminal} />
    </div>
  );
}
