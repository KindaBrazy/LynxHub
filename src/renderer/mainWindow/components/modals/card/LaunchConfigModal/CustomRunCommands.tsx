import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {MoveToFolder} from '@solar-icons/react-perf/BoldDuotone';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';

import LynxTooltip from '../../../LynxTooltip';
import LaunchConfigSection from './Section';
import TerminalCommandItem from './TerminalCommand-Item';

type Props = {id: string};
export default function CustomRunCommands({id}: Props) {
  const [commands, setCommands] = useState<string[]>([]);

  useEffect(() => {
    storageUtilsIpc.invoke.customRun('get', {id}).then(result => {
      setCommands(result);
    });
    const removeListener = storageUtilsIpc.on.onCustomRun(preCommands => {
      if (preCommands.id === id) setCommands(preCommands.commands);
    });

    return () => removeListener();
  }, []);

  const editCommand = useCallback(
    (index: number, value: string) => {
      setCommands(prevState => {
        const result = prevState.map((command, i) => (i === index ? value : command));
        storageUtilsIpc.invoke.customRun('set', {command: result, id});
        return result;
      });
    },
    [id],
  );

  const removeCommand = useCallback(
    (index: number) => {
      storageUtilsIpc.invoke.customRun('remove', {command: index, id});
    },
    [id],
  );

  const addCommand = useCallback(() => {
    storageUtilsIpc.invoke.customRun('add', {command: '', id});
  }, [id]);

  const onReorder = (newOrder: string[]) => {
    setCommands(newOrder);
  };

  const cdFolder = () => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        const command = `cd "${result}"`;
        storageUtilsIpc.invoke.customRun('add', {command, id});
      }
    });
  };

  const onDoneReorder = () => {
    storageUtilsIpc.invoke.customRun('set', {command: commands, id});
  };

  return (
    <LaunchConfigSection
      customButton={
        <Dropdown aria-label="Add new command">
          <LynxTooltip content="Add New Command" isEssential>
            <div>
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <Plus className="size-4" />
                </Button>
              </DropdownTrigger>
            </div>
          </LynxTooltip>
          <DropdownMenu aria-label="Add new command">
            <DropdownSection title="Add">
              <DropdownItem key="add_folder" onPress={addCommand} startContent={<Terminal_Icon />}>
                Command
              </DropdownItem>
              <DropdownItem key="add_file" onPress={cdFolder} startContent={<MoveToFolder className="size-3.5" />}>
                Cd Folder
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      addTooltipTitle="Add New Command"
      title="AI Execution (Terminal Commands)"
      description="Execute these commands when launching AI, overriding default settings">
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
