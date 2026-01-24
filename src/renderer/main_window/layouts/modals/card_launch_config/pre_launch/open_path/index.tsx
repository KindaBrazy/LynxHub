import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {Add_Icon, FileDuo_Icon, FolderDuo_Icon} from '@lynx_assets/icons';
import {PreOpenData} from '@lynx_common/types/ipc';
import filesIpc from '@lynx_shared/ipc/files';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {Empty} from 'antd';
import {filter, isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import LaunchConfigSection from '../../Section';
import PreOpenPathItem from './Item';

type Props = {id: string};
export default function PreOpenPath({id}: Props) {
  const [toOpen, setToOpen] = useState<PreOpenData>([]);

  useEffect(() => {
    storageUtilsIpc.invoke.preOpen('get', {id}).then(result => {
      setToOpen(result || []);
    });
  }, []);

  const onRemove = useCallback(
    (index: number) => {
      setToOpen(prevState => [...filter(prevState, (_, i) => i !== index)]);
      storageUtilsIpc.invoke.preOpen('remove', {id, open: index});
    },
    [id],
  );

  const selectFolder = useCallback(() => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        setToOpen(prevState => [...prevState, {path: result, type: 'folder'}]);
        storageUtilsIpc.invoke.preOpen('add', {id, open: {path: result, type: 'folder'}});
      }
    });
  }, [id]);

  const selectFile = useCallback(() => {
    filesIpc.openDlg({properties: ['openFile']}).then(result => {
      if (result) {
        setToOpen(prevState => [...prevState, {path: result, type: 'file'}]);
        storageUtilsIpc.invoke.preOpen('add', {id, open: {path: result, type: 'file'}});
      }
    });
  }, [id]);

  return (
    <LaunchConfigSection
      customButton={
        <Dropdown aria-label="Open file or folder">
          <LynxTooltip content="Add New Path" isEssential>
            <div>
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <Add_Icon />
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
          <DropdownMenu aria-label="Open file or folder">
            <DropdownSection title="Select">
              <DropdownItem key="add_folder" onPress={selectFolder} startContent={<FolderDuo_Icon />}>
                Folder
              </DropdownItem>
              <DropdownItem key="add_file" onPress={selectFile} startContent={<FileDuo_Icon />}>
                File
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      title="Open"
      description="Launch AI after opening selected files or folders">
      {isEmpty(toOpen) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items available to open" />
      ) : (
        <div className="space-y-2">
          {toOpen.map((open, index) => {
            const icon = open.type === 'folder' ? <FolderDuo_Icon /> : <FileDuo_Icon />;
            return (
              <PreOpenPathItem
                icon={icon}
                index={index}
                onRemove={onRemove}
                defaultText={open.path}
                key={`${index}_openThing`}
              />
            );
          })}
        </div>
      )}
    </LaunchConfigSection>
  );
}
