import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../RendererIpc';
import LaunchConfigSection from '../LaunchConfig-Section';
import TerminalCommandItem from '../TerminalCommand-Item';

type Props = {id: string};
export default function CustomRunCommands({id}: Props) {
  const [commands, setCommands] = useState<string[]>([]);

  useEffect(() => {
    rendererIpc.storageUtils.customRun('get', {id}).then(result => {
      setCommands(result);
    });
    rendererIpc.storageUtils.onCustomRun((_, result) => {
      if (result.id === id) setCommands(result.commands);
    });

    return () => {
      rendererIpc.storageUtils.offCustomRun();
    };
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

  return (
    <LaunchConfigSection
      onAddPress={addCommand}
      addTooltipTitle="Add New Command"
      title="AI Execution (Terminal Commands)"
      description="Execute these commands when 'Run AI' is clicked, overriding default settings">
      {isEmpty(commands) ? (
        <Empty
          className="m-0"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No custom command available to execute"
        />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={commands} onReorder={onReorder} className="space-y-2">
            {commands.map((command, index) => {
              const focus = isEmpty(command);
              return (
                <TerminalCommandItem
                  index={index}
                  focus={focus}
                  key={command}
                  defaultText={command}
                  onRemove={removeCommand}
                  editCommand={editCommand}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
