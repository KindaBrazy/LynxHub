import {useMemo} from 'react';

import {RunningCard} from '../../../Utils/Types';
import Switch from './Switch';
import Terminate from './Terminate';

type Props = {runningCard: RunningCard};

export default function SwitchAndTerminate({runningCard}: Props) {
  const {type, currentView} = useMemo(() => runningCard, [runningCard]);

  return (
    <div className="flex flex-row gap-x-1">
      {type === 'both' && <Switch currentView={currentView} />}
      {(type === 'both' || type === 'terminal') && <Terminate runningCard={runningCard} />}
    </div>
  );
}
