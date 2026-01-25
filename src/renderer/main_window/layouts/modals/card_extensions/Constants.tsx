import {Button, Link, Popover, PopoverContent, PopoverTrigger, Spinner} from '@heroui/react';
import {DownloadMinimalistic, Lock, LockUnlocked, ShieldWarning, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Empty} from 'antd';
import {Variants} from 'framer-motion';
import {X} from 'lucide-react';

export const tabContentVariants: Variants = {
  animate: {opacity: 1, scale: 1, transition: {duration: 0.2}},
  init: {opacity: 0, scale: 0.97},
};
export const extensionsColumns = [
  {key: 'name', label: 'Name'},
  {key: 'size', label: 'Size'},
  {key: 'update', label: 'Update Status'},
  {key: 'remove', label: 'Remove'},
  {key: 'disable', label: 'Disable'},
];

export const loadingTableElement = <Spinner label="Checking Extensions" />;
export const emptyTableElement = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No extensions to display." />;

export const useRowElements = {
  nameLink: (url: string, name: string) => (
    <Link href={url} color="foreground" className="text-small" isExternal>
      {name}
    </Link>
  ),
  removeBtn: {
    disabled: (
      <Button
        size="sm"
        color="danger"
        variant="light"
        isDisabled={true}
        startContent={<TrashBin2 className="size-4" />}
        isIconOnly
      />
    ),
    enabled: (
      name: string,
      onOpenChange: (isOpen: boolean) => void,
      isOpen: boolean,
      onDeletePerman: () => void,
      onMoveToTrash: () => void,
    ) => (
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
    ),
  },
  updateBtn: {
    available: (onPress: () => void) => (
      <Button size="sm" variant="flat" color="success" onPress={onPress} startContent={<DownloadMinimalistic />}>
        Available
      </Button>
    ),
    initializing: <Spinner size="sm" />,
    updated: (
      <Button size="sm" variant="light" color="default" isDisabled>
        Updated
      </Button>
    ),
    updating: <Button size="sm" variant="flat" color="success" isLoading />,
  },
  disableBtn: {
    disable: <Button size="sm" variant="light" isDisabled={true} isLoading isIconOnly />,
    enabled: (isDisabled: boolean, onPress: () => void) => (
      <Button size="sm" variant="light" onPress={onPress} color={isDisabled ? 'warning' : 'default'} isIconOnly>
        {isDisabled ? <Lock className="size-4" /> : <LockUnlocked className="size-4" />}
      </Button>
    ),
  },
};
