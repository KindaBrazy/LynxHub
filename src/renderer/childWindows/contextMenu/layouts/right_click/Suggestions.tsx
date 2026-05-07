import {Separator} from '@heroui/react';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {isEmpty} from 'lodash-es';
import {memo} from 'react';

import {ActionButton, createActionHandler} from './Utils';

type SuggestionsProps = {
  suggestions: string[];
  id: number;
};

/**
 * Component that displays spelling suggestions in the context menu.
 */
export const Suggestions = memo(function Suggestions({suggestions, id}: SuggestionsProps) {
  if (isEmpty(suggestions)) return null;

  return (
    <>
      <span className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">Suggestions</span>
      {suggestions.map((text, index) => (
        <ActionButton
          onPress={createActionHandler(() => {
            contextMenuIpc.send.rightClickItems.replaceMisspelling(id, text);
          })}
          title={text}
          className="text-sm"
          key={`suggestion_${text}_${index}`}
        />
      ))}
      <Separator className="my-2" />
    </>
  );
});
