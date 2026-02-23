import {FC} from 'react';

import {extensionRendererApi} from './loader';

/**
 * Collects custom user-input React components from all loaded extensions
 * that subscribe to the `card_collect_user_input` event.
 *
 * Each extension listener receives this event and calls `addElements` with its
 * contributed `FC[]`. Once **all** listeners have responded (tracked via a
 * counter), the `onComplete` callback is invoked with the full combined list.
 *
 * If no extension is listening to this event, `onComplete` is called immediately
 * with an empty array to avoid any blocking.
 *
 * @param cardId - The ID of the card initiating the input collection.
 * @param onComplete - Callback invoked once all extension inputs are gathered.
 */
export const collectExtensionUserInputs = (cardId: string, onComplete: (elements: FC[]) => void) => {
  const elements: FC[] = [];
  // Tracks how many listener responses we are still waiting for.
  let pendingResponses = 0;

  const listenerCount = extensionRendererApi.events.getListenerCount('card_collect_user_input');

  if (listenerCount > 0) {
    extensionRendererApi.events.emit('card_collect_user_input', {
      id: cardId,
      addElements: contributed => {
        elements.push(...contributed);
        pendingResponses += 1;

        // Only fire the callback once every listener has responded.
        if (pendingResponses === listenerCount) {
          onComplete(elements);
        }
      },
    });
  } else {
    // No extensions are listening — resolve immediately with an empty list.
    onComplete(elements);
  }
};
