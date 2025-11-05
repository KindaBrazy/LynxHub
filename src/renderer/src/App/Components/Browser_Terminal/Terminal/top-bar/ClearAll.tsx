import {Button} from '@heroui/react';
import {memo, RefObject, useCallback} from 'react';

import {BroomDuo_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';

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
    <Button size="sm" variant="light" onPress={clearTerm} isIconOnly>
      <BroomDuo_Icon className="size-3.5" />
    </Button>
  );
});

export default ClearAll;
