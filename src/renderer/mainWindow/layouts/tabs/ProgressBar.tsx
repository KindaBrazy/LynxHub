import {ProgressBar as Progress, ProgressBarProps} from '@heroui-v3/react';
import {memo} from 'react';

type ProgressState = 0 | 1 | 2 | 3 | 4;

type Props = {
  progress?: {state: ProgressState; value: number};
};

const ProgressColors: Record<number, ProgressBarProps['color']> = {
  1: 'default', // Normal
  2: 'danger', // Error
  3: 'accent', // Indeterminate
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

  const color = ProgressColors[state] || 'default';
  const isIndeterminate = state === 3;

  return (
    <div className="absolute bottom-0.75 inset-x-0">
      <Progress
        size="sm"
        color={color}
        aria-label="Tab progress"
        isIndeterminate={isIndeterminate}
        value={isIndeterminate ? undefined : value}>
        <Progress.Track>
          <Progress.Fill />
        </Progress.Track>
      </Progress>
    </div>
  );
});

export default ProgressBar;
