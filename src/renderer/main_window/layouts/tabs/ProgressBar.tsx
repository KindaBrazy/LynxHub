import {Progress} from '@heroui/react';
import {memo} from 'react';

type Props = {
  progress?: {state: 0 | 1 | 2 | 3 | 4; value: number};
};

const ProgressBar = memo(({progress}: Props) => {
  if (!progress || progress.state === 0) return null;

  const {state, value} = progress;

  // Determine color based on state
  // 1: Normal, 2: Error, 3: Indeterminate, 4: Paused/Warning
  const getColor = () => {
    switch (state) {
      case 2:
        return 'danger';
      case 4:
        return 'warning';
      default:
        return 'primary';
    }
  };

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
        color={getColor()}
        className="w-full"
        isIndeterminate={isIndeterminate}
        value={isIndeterminate ? undefined : value}
      />
    </div>
  );
});

export default ProgressBar;
