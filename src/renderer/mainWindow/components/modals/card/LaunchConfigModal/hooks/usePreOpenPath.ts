import {PreOpenData} from '@lynx_common/types/ipc';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {filter} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

/**
 * Hook to manage pre-launch file/folder opening.
 *
 * @param id - The card ID.
 */
export function usePreOpenPath(id: string) {
  const [items, setItems] = useState<PreOpenData>([]);

  useEffect(() => {
    storageUtilsIpc.invoke.preOpen('get', {id}).then(result => {
      setItems(result || []);
    });
  }, [id]);

  const addPath = useCallback(
    (path: string, type: 'file' | 'folder') => {
      const newItem = {path, type};
      setItems(prev => [...prev, newItem]);
      storageUtilsIpc.invoke.preOpen('add', {id, open: newItem});
    },
    [id],
  );

  const removePath = useCallback(
    (index: number) => {
      setItems(prev => filter(prev, (_, i) => i !== index));
      storageUtilsIpc.invoke.preOpen('remove', {id, open: index});
    },
    [id],
  );

  return {
    items,
    addPath,
    removePath,
  };
}
