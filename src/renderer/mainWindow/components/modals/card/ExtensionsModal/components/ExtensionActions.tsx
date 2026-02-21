import {Button, Popover, PopoverContent, PopoverTrigger, Spinner} from '@heroui/react';
import {DownloadMinimalistic, Lock, LockUnlocked, ShieldWarning, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {X} from 'lucide-react';
import {memo} from 'react';

type RemoveButtonProps = {
  isDisabled: boolean;
  name: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeletePerman: () => void;
  onMoveToTrash: () => void;
};

export const RemoveButton = memo(
  ({isDisabled, name, isOpen, onOpenChange, onDeletePerman, onMoveToTrash}: RemoveButtonProps) => {
    if (isDisabled) {
      return (
        <Button
          size="sm"
          color="danger"
          variant="light"
          isDisabled={true}
          startContent={<TrashBin2 className="size-4" />}
          isIconOnly
        />
      );
    }

    return (
      <Popover size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Button size="sm" color="danger" variant="light" startContent={<TrashBin2 className="size-4" />} isIconOnly />
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2">
            <span className="mb-2 flex flex-row items-center font-bold">
              <ShieldWarning className="text-warning size-5 mr-1 mb-0.5" /> Delete {name}
            </span>
            <div className="mt-2 flex items-end justify-between gap-x-1">
              <Button size="sm" variant="light" color="warning" onPress={onMoveToTrash} startContent={<TrashBin2 />}>
                Move to trash
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={onDeletePerman}
                startContent={<X className="size-3.5" />}>
                Delete permanently
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

type UpdateButtonProps = {
  status: 'available' | 'initializing' | 'updated' | 'updating';
  onPress?: () => void;
};

export const UpdateButton = memo(({status, onPress}: UpdateButtonProps) => {
  switch (status) {
    case 'available':
      return (
        <Button size="sm" variant="flat" color="success" onPress={onPress} startContent={<DownloadMinimalistic />}>
          Available
        </Button>
      );
    case 'initializing':
      return <Spinner size="sm" />;
    case 'updated':
      return (
        <Button size="sm" variant="light" color="default" isDisabled>
          Updated
        </Button>
      );
    case 'updating':
      return <Button size="sm" variant="flat" color="success" isLoading />;
  }
});

type DisableButtonProps = {
  isDisabled: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  isActionDisabled?: boolean;
};

export const DisableButton = memo(({isDisabled, isLoading, onPress, isActionDisabled}: DisableButtonProps) => {
  if (isActionDisabled) {
    return <Button size="sm" variant="light" isDisabled={true} isLoading={isLoading} isIconOnly />;
  }

  return (
    <Button size="sm" variant="light" onPress={onPress} color={isDisabled ? 'warning' : 'default'} isIconOnly>
      {isDisabled ? <Lock className="size-4" /> : <LockUnlocked className="size-4" />}
    </Button>
  );
});
