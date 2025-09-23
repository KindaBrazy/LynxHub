import {Empty} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../RendererIpc';
import LaunchConfigSection from '../../LaunchConfig-Section';
import TerminalCommandItem from '../../TerminalCommand-Item';

type Props = {id: string};
export default function PreTerminalCommands({id}: Props) {
  const [preCommands, setPreCommands] = useState<string[]>([]);

  useEffect(() => {
    rendererIpc.storageUtils.preCommands('get', {id}).then(result => {
      setPreCommands(result);
    });
    rendererIpc.storageUtils.onPreCommands((_, result) => {
      if (result.id === id) setPreCommands(result.commands);
    });

    return () => {
      rendererIpc.storageUtils.offPreCommands();
    };
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

  return (
    <LaunchConfigSection
      onAddPress={addCommand}
      title="Terminal Commands"
      addTooltipTitle="Add New Command"
      description="Execute these terminal commands before launching the AI.">
      {isEmpty(preCommands) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No commans available to execute" />
      ) : (
        <AnimatePresence>
          <Reorder.Group axis="y" values={preCommands} onReorder={onReorder} className="space-y-2">
            {preCommands.map((command, index) => {
              const focus = isEmpty(command);
              return (
                <TerminalCommandItem
                  index={index}
                  focus={focus}
                  key={command}
                  defaultText={command}
                  onRemove={removeCommand}
                  editCommand={editCommand}
                  onDoneReorder={onDoneReorder}
                />
              );
            })}
          </Reorder.Group>
        </AnimatePresence>
      )}
    </LaunchConfigSection>
  );
}
