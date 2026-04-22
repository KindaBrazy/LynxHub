import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Tooltip} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {Terminal_Icon} from '@lynx_assets/icons';
import filesIpc from '@lynx_shared/ipc/files';
import {Inbox, MoveToFolder} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {useCallback} from 'react';

import {useTerminalCommands} from '../hooks/useTerminalCommands';
import LaunchConfigSection from '../LaunchConfigSection';
import TerminalCommandItem from '../TerminalCommandItem';

type Props = {id: string};
export default function Commands({id}: Props) {
  const {commands, addCommand, editCommand, removeCommand, reorderCommands, saveReorder} = useTerminalCommands(
    id,
    'customRun',
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
              <p>Add New Command</p>
            </Tooltip.Content>
          </Tooltip>
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
      addTooltipTitle="Add New Command"
      title="AI Execution (Terminal Commands)"
      description="Execute these commands when launching AI, overriding default settings">
      {isEmpty(commands) ? (
        <EmptyStateCard
          bodyClassName="py-8"
          icon={<Inbox size={40} />}
          description="No custom command available to execute!"
        />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={commands} onReorder={reorderCommands} className="space-y-2 overflow-hidden">
            {commands.map((command, index) => (
              <TerminalCommandItem
                index={index}
                key={command}
                onEdit={editCommand}
                initialValue={command}
                onRemove={removeCommand}
                onDoneReorder={saveReorder}
              />
            ))}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
