import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import filesIpc from '@lynx_shared/ipc/files';
import {File, Folder} from '@solar-icons/react-perf/BoldDuotone';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {useCallback} from 'react';

import LynxTooltip from '../../../../LynxTooltip';
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
          <LynxTooltip content="Add New Path" isEssential>
            <div>
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <Plus className="size-4" />
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
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
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items available to open" />
      ) : (
        <div className="space-y-2">
          {items.map((open, index) => {
            const icon = open.type === 'folder' ? <Folder /> : <File />;
            return (
              <PreOpenPathItem
                icon={icon}
                index={index}
                onRemove={removePath}
                path={open.path}
                key={`${index}_openThing`}
              />
            );
          })}
        </div>
      )}
    </LaunchConfigSection>
  );
}
