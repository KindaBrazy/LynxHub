import {Card} from '@heroui/card';
import {Button} from '@heroui/react';
import {ReactNode, useCallback} from 'react';

import {TrashDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';

type Props = {icon: ReactNode; index: number; defaultText: string; onRemove?: (index: number) => void};

/** Manage pre-opened items, display paths, and remove */
export default function PreOpenPathItem({defaultText, icon, index, onRemove}: Props) {
  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  return (
    <Card shadow="none" className="flex flex-row items-center p-2 gap-x-2">
      {icon}
      <span className="w-full truncate text-xs">{defaultText}</span>
      <Button size="sm" color="danger" variant="light" onPress={remove} isIconOnly>
        <TrashDuo_Icon className="size-4" />
      </Button>
    </Card>
  );
}
