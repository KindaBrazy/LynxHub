import {RunningCard} from '../../../Utils/Types';
import Switch from './Switch';
import Terminate from './Terminate';

type Props = {runningCard: RunningCard};

export default function SwitchAndTerminate({runningCard}: Props) {
  return (
    <div className="flex flex-row gap-x-1">
      <Switch currentView={runningCard.currentView} />
      <Terminate runningCard={runningCard} />
    </div>
  );
}
