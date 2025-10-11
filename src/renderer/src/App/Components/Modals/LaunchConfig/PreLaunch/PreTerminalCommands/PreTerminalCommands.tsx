import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {Add_Icon, FolderDuo_Icon, Terminal_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../../RendererIpc';
import LynxTooltip from '../../../../Reusable/LynxTooltip';
import LaunchConfigSection from '../../LaunchConfig-Section';
import TerminalCommandItem from '../../TerminalCommand-Item';

type Props = {id: string};
export default function PreTerminalCommands({id}: Props) {
  const [preCommands, setPreCommands] = useState<string[]>([]);

  useEffect(() => {
    rendererIpc.storageUtils.preCommands('get', {id}).then(result => {
      setPreCommands(result);
    });
    const removeListener = rendererIpc.storageUtils.onPreCommands((_, result) => {
      if (result.id === id) setPreCommands(result.commands);
    });

    return () => removeListener();
  }, []);

  const editCommand = useCallback(
    (index: number, value: string) => {
      setPreCommands(prevState => {
        const result = prevState.map((command, i) => (i === index ? value : command));
        rendererIpc.storageUtils.preCommands('set', {command: result, id});
        return result;
      });
    },
    [id],
  );

  const removeCommand = useCallback(
    (index: number) => {
      rendererIpc.storageUtils.preCommands('remove', {command: index, id});
    },
    [id],
  );

  const addCommand = useCallback(() => {
    rendererIpc.storageUtils.preCommands('add', {command: '', id});
  }, [id]);

  const onReorder = (newOrder: string[]) => {
    setPreCommands(newOrder);
  };

  const onDoneReorder = () => {
    rendererIpc.storageUtils.preCommands('set', {command: preCommands, id});
  };

  const cdFolder = () => {
    rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        const command = `cd "${result}"`;
        rendererIpc.storageUtils.preCommands('add', {command, id});
      }
    });
  };

  return (
    <LaunchConfigSection
      customButton={
        <Dropdown aria-label="Add new command">
          <LynxTooltip content="Add New Command" isEssential>
            <div>
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <Add_Icon />
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
          <DropdownMenu aria-label="Add new command">
            <DropdownSection title="Add">
              <DropdownItem key="add_folder" onPress={addCommand} startContent={<Terminal_Icon />}>
                Command
              </DropdownItem>
              <DropdownItem key="add_file" onPress={cdFolder} startContent={<FolderDuo_Icon />}>
                Cd Folder
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      title="Terminal Commands"
      addTooltipTitle="Add New Command"
      description="Execute these terminal commands before launching the AI.">
      {isEmpty(preCommands) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No commans available to execute" />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={preCommands} onReorder={onReorder} className="space-y-2 overflow-hidden">
            {preCommands.map((command, index) => (
              <TerminalCommandItem
                index={index}
                key={command}
                defaultText={command}
                onRemove={removeCommand}
                editCommand={editCommand}
                onDoneReorder={onDoneReorder}
              />
            ))}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
