import {Button, Tooltip} from '@heroui/react';
import {Broom} from '@solar-icons/react-perf/BoldDuotone';
import {memo, RefObject, useCallback} from 'react';

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
    <Tooltip delay={500} content="Clear all">
      <Button size="sm" variant="light" onPress={clearTerm} isIconOnly aria-label="Clear all">
        <Broom className="size-3.5" />
      </Button>
    </Tooltip>
  );
});

TerminalClearAll.displayName = 'TerminalClearAll';

export default TerminalClearAll;
