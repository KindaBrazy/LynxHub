import {Button} from '@heroui/react';
import {Broom} from '@solar-icons/react-perf/BoldDuotone';
import {memo, RefObject, useCallback} from 'react';

import LynxTooltip from '../../../../components/LynxTooltip';

type Props = {
  /**
   * Reference to the clear terminal function.
   */
  clearTerminal: RefObject<(() => void) | undefined>;
};

/**
 * A button to clear the terminal content.
 */
const TerminalClearAll = memo(({clearTerminal}: Props) => {
  const clearTerm = useCallback(() => {
    if (clearTerminal.current) {
      clearTerminal.current();
    }
  }, [clearTerminal]);

  return (
    <LynxTooltip delay={500} content="Clear all">
      <Button size="sm" variant="ghost" onPress={clearTerm} aria-label="Clear all" isIconOnly>
        <Broom className="size-3.5" />
      </Button>
    </LynxTooltip>
  );
});

TerminalClearAll.displayName = 'TerminalClearAll';

export default TerminalClearAll;
