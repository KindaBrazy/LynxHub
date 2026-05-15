import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {isEmpty} from 'lodash-es';
import {memo} from 'react';

import Separator from './Separator';
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
      <Separator />
    </>
  );
});
