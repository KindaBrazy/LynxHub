import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';

type CommandType = 'preCommands' | 'customRun';

/**
 * Hook to manage terminal commands for PreLaunch and CustomRun.
 * Handles fetching, adding, removing, editing, and reordering commands via IPC.
 *
 * @param id - The card ID.
 * @param type - The type of commands to manage ('preCommands' or 'customRun').
 */
export function useTerminalCommands(id: string, type: CommandType) {
  const [commands, setCommands] = useState<string[]>([]);

  useEffect(() => {
    // Initial fetch
    if (type === 'preCommands') {
      storageUtilsIpc.invoke.preCommands('get', {id}).then(result => {
        setCommands(result || []);
      });
    } else {
      storageUtilsIpc.invoke.customRun('get', {id}).then(result => {
        setCommands(result || []);
      });
    }

    // Listen for updates
    const removeListener =
      type === 'preCommands'
        ? storageUtilsIpc.on.onPreCommands(result => {
            if (result.id === id) setCommands(result.commands);
          })
        : storageUtilsIpc.on.onCustomRun(result => {
            if (result.id === id) setCommands(result.commands);
          });

    return () => removeListener();
  }, [id, type]);

  const addCommand = useCallback(
    (command = '') => {
      if (type === 'preCommands') {
        storageUtilsIpc.invoke.preCommands('add', {command, id});
      } else {
        storageUtilsIpc.invoke.customRun('add', {command, id});
      }
    },
    [id, type],
  );

  const removeCommand = useCallback(
    (index: number) => {
      if (type === 'preCommands') {
        storageUtilsIpc.invoke.preCommands('remove', {command: index, id});
      } else {
        storageUtilsIpc.invoke.customRun('remove', {command: index, id});
      }
    },
    [id, type],
  );

  const editCommand = useCallback(
    (index: number, value: string) => {
      setCommands(prev => {
        const newCommands = prev.map((cmd, i) => (i === index ? value : cmd));
        // Optimistic update, but also send to IPC
        if (type === 'preCommands') {
          storageUtilsIpc.invoke.preCommands('set', {command: newCommands, id});
        } else {
          storageUtilsIpc.invoke.customRun('set', {command: newCommands, id});
        }
        return newCommands;
      });
    },
    [id, type],
  );

  const reorderCommands = useCallback((newOrder: string[]) => {
    setCommands(newOrder);
  }, []);

  const saveReorder = useCallback(() => {
    if (type === 'preCommands') {
      storageUtilsIpc.invoke.preCommands('set', {command: commands, id});
    } else {
      storageUtilsIpc.invoke.customRun('set', {command: commands, id});
    }
  }, [commands, id, type]);

  return {
    commands,
    addCommand,
    removeCommand,
    editCommand,
    reorderCommands,
    saveReorder,
  };
}
