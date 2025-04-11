import {RunningCard} from '../../../Utils/Types';
import Switch from './Switch';
import Terminate from './Terminate';

type Props = {runningCard: RunningCard; isEmptyTerminal?: boolean; isEmptyBrowser?: boolean};

export default function SwitchAndTerminate({runningCard, isEmptyTerminal, isEmptyBrowser}: Props) {
  return (
    <div className="flex flex-row gap-x-1">
      {!isEmptyTerminal && !isEmptyBrowser && <Switch currentView={runningCard.currentView} />}
      {!isEmptyBrowser && <Terminate runningCard={runningCard} isEmptyTerminal={isEmptyTerminal} />}
    </div>
  );
}
