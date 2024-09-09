import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {Empty} from 'antd';
import {filter, isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {PreOpenData} from '../../../../../../../../cross/IpcChannelAndTypes';
import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import {useModalsState} from '../../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../../RendererIpc';
import LynxTooltip from '../../../../Reusable/LynxTooltip';
import LaunchConfigSection from '../../LaunchConfig-Section';
import PreOpenPathItem from './PreOpenPath-Item';

/** Manage paths to be opened before launching the AI */
export default function PreOpenPath() {
  const {id} = useModalsState('cardLaunchConfig');
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
    rendererIpc.file.openDlg('openDirectory').then(result => {
      if (result) {
        setToOpen(prevState => [...prevState, {path: result, type: 'folder'}]);
        rendererIpc.storageUtils.preOpen('add', {id, open: {path: result, type: 'folder'}});
      }
    });
  }, [id]);

  const selectFile = useCallback(() => {
    rendererIpc.file.openDlg('openFile').then(result => {
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
                  {getIconByName('Add')}
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
          <DropdownMenu aria-label="Open file or folder">
            <DropdownSection title="Select">
              <DropdownItem onPress={selectFolder} className="cursor-default">
                Folder
              </DropdownItem>
              <DropdownItem onPress={selectFile} className="cursor-default">
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
            const icon =
              open.type === 'folder'
                ? getIconByName('Folder2', {className: 'absolute left-3 size-4'})
                : getIconByName('File', {className: 'absolute left-3 size-4'});
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