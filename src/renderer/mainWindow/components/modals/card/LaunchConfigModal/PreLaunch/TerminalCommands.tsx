import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Terminal_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import {MoveToFolder} from '@solar-icons/react-perf/BoldDuotone';
import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {useCallback} from 'react';

import LynxTooltip from '../../../../LynxTooltip';
import {useTerminalCommands} from '../hooks/useTerminalCommands';
import LaunchConfigSection from '../LaunchConfigSection';
import TerminalCommandItem from '../TerminalCommandItem';

type Props = {id: string};
export default function PreTerminalCommands({id}: Props) {
  const {commands, addCommand, editCommand, removeCommand, reorderCommands, saveReorder} = useTerminalCommands(
    id,
    'preCommands',
  );

  const cdFolder = useCallback(() => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(result => {
      if (result) {
        const command = `cd "${result}"`;
        addCommand(command);
      }
    });
  }, [addCommand]);

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
              <DropdownItem key="add_folder" onPress={() => addCommand()} startContent={<Terminal_Icon />}>
                Command
              </DropdownItem>
              <DropdownItem key="add_file" onPress={cdFolder} startContent={<MoveToFolder className="size-3.5" />}>
                Cd Folder
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      }
      title="Terminal Commands"
      addTooltipTitle="Add New Command"
      description="Execute these terminal commands before launching the AI.">
      {isEmpty(commands) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No commands available to execute" />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={commands} onReorder={reorderCommands} className="space-y-2 overflow-hidden">
            {commands.map((command, index) => (
              <TerminalCommandItem
                index={index}
                key={command}
                initialValue={command}
                onRemove={removeCommand}
                onEdit={editCommand}
                onDoneReorder={saveReorder}
              />
            ))}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
