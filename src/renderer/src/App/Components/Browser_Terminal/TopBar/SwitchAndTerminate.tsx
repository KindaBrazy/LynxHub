import {Button} from '@heroui/react';

import {Stop_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import Switch from './Switch';

type Props = {currentView: 'browser' | 'terminal'};

export default function SwitchAndTerminate({currentView}: Props) {
  return (
    <div className="flex flex-row gap-x-2">
      <Switch currentView={currentView} />
      <Button size="sm" variant="light" className="cursor-default" isIconOnly>
        <Stop_Icon className="size-4 text-danger" />
      </Button>
    </div>
  );
}
