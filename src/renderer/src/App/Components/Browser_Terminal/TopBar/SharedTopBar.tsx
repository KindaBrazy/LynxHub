import {useMemo} from 'react';

import {RunningCard} from '../../../Utils/Types';
import Switch from './Switch';
import Terminate_AI from './Terminate_AI';

type Props = {runningCard: RunningCard};

export default function SharedTopBar({runningCard}: Props) {
  const {type, currentView} = useMemo(() => runningCard, [runningCard]);

  return (
    <div className="flex flex-row gap-x-1">
      {type === 'both' && <Switch currentView={currentView} />}
      {(type === 'both' || type === 'terminal') && <Terminate_AI id={runningCard.id} />}
    </div>
  );
}
