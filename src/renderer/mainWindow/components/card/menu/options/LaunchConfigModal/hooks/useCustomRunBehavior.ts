import {CustomRunBehaviorData} from '@lynx_common/types/ipc';
import storageIpc, {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {isEmpty} from 'lodash-es';
import {useCallback, useEffect, useState} from 'react';

/**
 * Hook to manage custom run behavior (terminal type, browser type, URL catching).
 *
 * @param id - The card ID.
 */
export function useCustomRunBehavior(id: string) {
  const [behavior, setBehavior] = useState<Partial<CustomRunBehaviorData>>({});

  useEffect(() => {
    storageIpc.get('cardsConfig').then(result => {
      if (!isEmpty(result.customRunBehavior)) {
        const data = result.customRunBehavior.find(customRun => customRun.cardID === id);
        if (data) {
          setBehavior(data);
        }
      }
    });
  }, [id]);

  const updateBehavior = useCallback(
    (updates: Partial<CustomRunBehaviorData>) => {
      setBehavior(prev => ({...prev, ...updates}));
      storageUtilsIpc.send.updateCustomRunBehavior({
        cardID: id,
        ...updates,
      } as any); // Type assertion needed as updateCustomRunBehavior might expect specific fields
    },
    [id],
  );

  return {
    behavior,
    updateBehavior,
  };
}
