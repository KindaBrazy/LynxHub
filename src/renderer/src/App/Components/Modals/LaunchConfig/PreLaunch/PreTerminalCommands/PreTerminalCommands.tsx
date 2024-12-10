import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {useModalsState} from '../../../../../Redux/AI/ModalsReducer';
import rendererIpc from '../../../../../RendererIpc';
import LaunchConfigSection from '../../LaunchConfig-Section';
import TerminalCommandItem from '../../TerminalCommand-Item';

/** Manage terminal commands to be executed before launching the AI */
export default function PreTerminalCommands() {
  const {id} = useModalsState('cardLaunchConfig');
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

  return (
    <LaunchConfigSection
      onAddPress={addCommand}
      title="Terminal Commands"
      addTooltipTitle="Add New Command"
      description="Execute these terminal commands before launching the AI.">
      {isEmpty(preCommands) ? (
        <Empty className="m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description="No commans available to execute" />
      ) : (
        <div className="space-y-2">
          {preCommands.map((command, index) => {
            const focus = isEmpty(command);
            return (
              <TerminalCommandItem
                index={index}
                focus={focus}
                defaultText={command}
                onRemove={removeCommand}
                editCommand={editCommand}
                key={`${index}_${command}`}
              />
            );
          })}
        </div>
      )}
    </LaunchConfigSection>
  );
}
