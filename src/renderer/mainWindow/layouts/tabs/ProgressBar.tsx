import {Progress} from '@heroui/react';
import {memo, useMemo} from 'react';

type ProgressState = 0 | 1 | 2 | 3 | 4;

type Props = {
  progress?: {state: ProgressState; value: number};
};

const ProgressColors: Record<number, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
  1: 'primary', // Normal
  2: 'danger', // Error
  3: 'primary', // Indeterminate
  4: 'warning', // Paused/Warning
};

/**
 * Renders a progress bar at the bottom of the tab item.
 * Supports different states (normal, error, indeterminate, paused).
 */
const ProgressBar = memo(({progress}: Props) => {
  if (!progress || progress.state === 0) {
    return null;
  }

  const {state, value} = progress;

  const color = useMemo(() => ProgressColors[state] || 'primary', [state]);
  const isIndeterminate = state === 3;

  return (
    <div className="absolute bottom-0.75 inset-x-0">
      <Progress
        classNames={{
          base: 'h-0.5 max-h-0.5',
          track: 'h-0.5 bg-foreground-900/30',
          indicator: 'h-0.5',
        }}
        size="sm"
        radius="none"
        color={color}
        className="w-full"
        isIndeterminate={isIndeterminate}
        value={isIndeterminate ? undefined : value}
        aria-label="Tab progress"
      />
    </div>
  );
});

export default ProgressBar;
