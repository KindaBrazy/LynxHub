import {Button, Chip, Link, Popover, PopoverContent, PopoverTrigger, Spinner} from '@heroui/react';
import {Empty, Space, Spin} from 'antd';
import {Variants} from 'framer-motion';

import {RepoDetails} from '../../../../../../cross/CrossTypes';
import {
  CrossShield_Icon,
  Lock_Icon,
  Star_Icon,
  Trash_Icon,
  Unlock_Icon,
} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {formatNumber} from '../../../Utils/UtilFunctions';

export const tabContentVariants: Variants = {
  animate: {opacity: 1, scale: 1, transition: {duration: 0.2}},
  init: {opacity: 0, scale: 0.97},
};

export const extensionsColumns = [
  {key: 'name', label: 'Name'},
  {key: 'stars', label: 'Stars'},
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
        className="cursor-default"
        startContent={<Trash_Icon className="size-4" />}
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
      <Popover size="sm" isOpen={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Button
            size="sm"
            color="danger"
            variant="light"
            className="cursor-default"
            startContent={<Trash_Icon className="size-4" />}
            isIconOnly
          />
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2">
            <h2 className="mb-4 mt-2 flex flex-row items-center font-bold">
              <CrossShield_Icon className="fill-danger size-5 mr-1 mb-0.5" /> Delete {name}
            </h2>
            <p>
              <span>This action will remove the extension and all its associated data from your device.</span>
              <br />
              <span>Are you sure you want to proceed?</span>
            </p>
            <div className="mt-4 flex items-end justify-end">
              <Space>
                <Button size="sm" color="danger" variant="light" onPress={onDeletePerman} className="cursor-default">
                  Delete permanently
                </Button>
                <Button size="sm" variant="light" color="warning" onPress={onMoveToTrash} className="cursor-default">
                  Move to trash
                </Button>
              </Space>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  stars: (details: RepoDetails | undefined) =>
    details ? (
      <Chip
        size="sm"
        variant="light"
        startContent={<Star_Icon className="fill-yellow-400 mx-1" />}
        className="transition duration-500 hover:bg-white dark:hover:bg-black">
        {formatNumber(details?.stars || 0)}
      </Chip>
    ) : (
      <Chip
        size="sm"
        variant="light"
        startContent={<Star_Icon className="fill-yellow-400 mx-1" />}
        className="transition duration-500 hover:bg-white dark:hover:bg-black">
        N/A
      </Chip>
    ),
  updateBtn: {
    available: (onPress: () => void) => (
      <Button size="sm" variant="flat" color="success" onPress={onPress}>
        Update
      </Button>
    ),
    initializing: <Spin size="small" />,
    updated: (
      <Button size="sm" variant="light" color="default" className="cursor-default" isDisabled>
        Updated
      </Button>
    ),
    updating: <Button size="sm" variant="flat" color="success" className="cursor-default" isLoading />,
  },
  disableBtn: {
    disable: <Button size="sm" variant="light" isDisabled={true} isLoading isIconOnly />,
    enabled: (isDisabled: boolean, onPress: () => void) => (
      <Button
        size="sm"
        variant="light"
        onPress={onPress}
        className="cursor-default"
        color={isDisabled ? 'warning' : 'default'}
        isIconOnly>
        {isDisabled ? <Lock_Icon className="size-4" /> : <Unlock_Icon className="size-4" />}
      </Button>
    ),
  },
};
