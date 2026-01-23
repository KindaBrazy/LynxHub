import {Button, Tooltip} from '@heroui/react';
import {BroomDuo_Icon} from '@lynx_assets/icons';
import {memo, RefObject, useCallback} from 'react';

type Props = {
  clearTerminal: RefObject<(() => void) | undefined>;
};

const ClearAll = memo(({clearTerminal}: Props) => {
  const clearTerm = useCallback(() => {
    if (clearTerminal.current) {
      clearTerminal.current();
    }
  }, [clearTerminal]);

  return (
    <Tooltip delay={500} content="Clear all">
      <Button size="sm" variant="light" onPress={clearTerm} isIconOnly>
        <BroomDuo_Icon className="size-3.5" />
      </Button>
    </Tooltip>
  );
});

export default ClearAll;
