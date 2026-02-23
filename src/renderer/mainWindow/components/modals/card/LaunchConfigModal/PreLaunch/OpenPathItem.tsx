import {Card} from '@heroui/card';
import {Button} from '@heroui/react';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {memo, ReactNode, useCallback} from 'react';

type Props = {
  /** The icon to display (file or folder) */
  icon: ReactNode;
  /** Index of the item */
  index: number;
  /** The path string to display */
  path: string;
  /** Callback to remove the item */
  onRemove?: (index: number) => void;
};

/**
 * Display a file or folder path item with a remove button.
 */
const PreOpenPathItem = memo(({path, icon, index, onRemove}: Props) => {
  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  return (
    <Card shadow="none" className="flex flex-row items-center p-2 gap-x-2">
      {icon}
      <span title={path} className="w-full truncate text-xs">
        {path}
      </span>
      <Button size="sm" color="danger" variant="light" onPress={remove} isIconOnly>
        <TrashBin2 className="size-4" />
      </Button>
    </Card>
  );
});

export default PreOpenPathItem;
