import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Tooltip} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import filesIpc from '@lynx_shared/ipc/files';
import {File, Folder, Inbox} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {useCallback} from 'react';

import {usePreOpenPath} from '../hooks/usePreOpenPath';
import LaunchConfigSection from '../LaunchConfigSection';
import PreOpenPathItem from './OpenPathItem';

type Props = {id: string};
export default function PreOpenPath({id}: Props) {
  const {items, addPath, removePath} = usePreOpenPath(id);

  const selectFolder = useCallback(() => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        addPath(result, 'folder');
      }
    });
  }, [addPath]);

  const selectFile = useCallback(() => {
    filesIpc.openDlg({properties: ['openFile']}).then(result => {
      if (result) {
        addPath(result, 'file');
      }
    });
  }, [addPath]);

  return (
    <LaunchConfigSection
      customButton={
        <Dropdown aria-label="Open file or folder">
          <Tooltip delay={300}>
            <Tooltip.Trigger>
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <Plus className="size-4" />
                </Button>
              </DropdownTrigger>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
              <Tooltip.Arrow />
              <p>Add New Path</p>
            </Tooltip.Content>
          </Tooltip>
          <DropdownMenu aria-label="Open file or folder">
            <DropdownSection title="Select">
              <DropdownItem key="add_folder" onPress={selectFolder} startContent={<Folder />}>
                Folder
              </DropdownItem>
              <DropdownItem key="add_file" onPress={selectFile} startContent={<File />}>
                File
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      title="Open"
      description="Launch AI after opening selected files or folders">
      {isEmpty(items) ? (
        <EmptyStateCard
          bodyClassName="py-8"
          icon={<Inbox size={40} />}
          description="No file or folder available to open!"
        />
      ) : (
        <div className="space-y-2">
          {items.map((open, index) => {
            const icon = open.type === 'folder' ? <Folder /> : <File />;
            return (
              <PreOpenPathItem
                icon={icon}
                index={index}
                path={open.path}
                onRemove={removePath}
                key={`${index}_openThing`}
              />
            );
          })}
        </div>
      )}
    </LaunchConfigSection>
  );
}
