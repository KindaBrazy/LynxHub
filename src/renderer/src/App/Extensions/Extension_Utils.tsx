import {FC} from 'react';

import {extensionRendererApi} from './ExtensionLoader';

export const eventUtil_CollectUserInputs = (id: string, job: (elements: FC[]) => void) => {
  const elements: FC[] = [];
  let doneAdd: number = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_collect_user_input');
  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_collect_user_input', {
      id,
      addElements: element => {
        elements.push(...element);
        doneAdd += 1;

        if (doneAdd === listenerCount) {
          job(elements);
        }
      },
    });
  } else {
    job(elements);
  }
};
