import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {Add_Icon, FolderDuo_Icon, Terminal_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import rendererIpc from '../../../../RendererIpc';
import LynxTooltip from '../../../Reusable/LynxTooltip';
import LaunchConfigSection from '../LaunchConfig-Section';
import TerminalCommandItem from '../TerminalCommand-Item';

type Props = {id: string};
export default function CustomRunCommands({id}: Props) {
  const [commands, setCommands] = useState<string[]>([]);

  useEffect(() => {
    rendererIpc.storageUtils.customRun('get', {id}).then(result => {
      setCommands(result);
    });
    const removeListener = rendererIpc.storageUtils.onCustomRun((_, result) => {
      if (result.id === id) setCommands(result.commands);
    });

    return () => removeListener();
  }, []);

  const editCommand = useCallback(
    (index: number, value: string) => {
      setCommands(prevState => {
        const result = prevState.map((command, i) => (i === index ? value : command));
        rendererIpc.storageUtils.customRun('set', {command: result, id});
        return result;
      });
    },
    [id],
  );

  const removeCommand = useCallback(
    (index: number) => {
      rendererIpc.storageUtils.customRun('remove', {command: index, id});
    },
    [id],
  );

  const addCommand = useCallback(() => {
    rendererIpc.storageUtils.customRun('add', {command: '', id});
  }, [id]);

  const onReorder = (newOrder: string[]) => {
    setCommands(newOrder);
  };

  const cdFolder = () => {
    rendererIpc.file.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        const command = `cd "${result}"`;
        rendererIpc.storageUtils.customRun('add', {command, id});
      }
    });
  };

  const onDoneReorder = () => {
    rendererIpc.storageUtils.customRun('set', {command: commands, id});
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
      addTooltipTitle="Add New Command"
      title="AI Execution (Terminal Commands)"
      description="Execute these commands when 'Run AI' is clicked, overriding default settings">
      {isEmpty(commands) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No custom command available to execute" />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={commands} onReorder={onReorder} className="space-y-2 overflow-hidden">
            {commands.map((command, index) => (
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
