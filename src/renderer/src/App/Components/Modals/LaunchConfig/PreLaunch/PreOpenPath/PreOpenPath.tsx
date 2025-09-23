import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Empty} from 'antd';
import {filter, isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {PreOpenData} from '../../../../../../../../cross/IpcChannelAndTypes';
import {Add_Icon, FileDuo_Icon, FolderDuo_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../RendererIpc';
import LynxTooltip from '../../../../Reusable/LynxTooltip';
import LaunchConfigSection from '../../LaunchConfig-Section';
import PreOpenPathItem from './PreOpenPath-Item';

type Props = {id: string};
export default function PreOpenPath({id}: Props) {
  const [toOpen, setToOpen] = useState<PreOpenData>([]);

  useEffect(() => {
    rendererIpc.storageUtils.preOpen('get', {id}).then(result => {
      setToOpen(result || []);
    });
  }, []);

  const onRemove = useCallback(
    (index: number) => {
      setToOpen(prevState => [...filter(prevState, (_, i) => i !== index)]);
      rendererIpc.storageUtils.preOpen('remove', {id, open: index});
    },
    [id],
  );

  const selectFolder = useCallback(() => {
    rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        setToOpen(prevState => [...prevState, {path: result, type: 'folder'}]);
        rendererIpc.storageUtils.preOpen('add', {id, open: {path: result, type: 'folder'}});
      }
    });
  }, [id]);

  const selectFile = useCallback(() => {
    rendererIpc.file.openDlg({properties: ['openFile']}).then(result => {
      if (result) {
        setToOpen(prevState => [...prevState, {path: result, type: 'file'}]);
        rendererIpc.storageUtils.preOpen('add', {id, open: {path: result, type: 'file'}});
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
                <Button size="sm" variant="light" className="cursor-default" isIconOnly>
                  <Add_Icon />
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
          <DropdownMenu aria-label="Open file or folder">
            <DropdownSection title="Select">
              <DropdownItem key="add_folder" onPress={selectFolder} className="cursor-default">
                Folder
              </DropdownItem>
              <DropdownItem key="add_file" onPress={selectFile} className="cursor-default">
                File
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      title="Open"
      description="Launch AI after opening selected files or folders">
      {isEmpty(toOpen) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items available to open" />
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
