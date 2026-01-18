import {Divider} from '@heroui/react';
import contextItemsIpc from '@lynx_shared/ipc/context_items';
import {isEmpty} from 'lodash';

import {ActionButton, createActionHandler} from './Utils';

type Props = {suggestions: string[]; id: number};
export function Suggestions({suggestions, id}: Props) {
  if (isEmpty(suggestions)) return null;

  return (
    <>
      <span key="suggestions_title" className="ml-2 text-sm mb-1 font-semibold text-gray-600 dark:text-gray-400 px-2">
        Suggestions
      </span>
      {...suggestions.map((text, index) => (
        <ActionButton
          onPress={createActionHandler(() => {
            contextItemsIpc.replaceMisspelling(id, text);
          })}
          title={text}
          className="text-sm"
          key={`suggestion_${text}_${index}`}
        />
      ))}
      <Divider className="my-2" key="sep_suggestions" />
    </>
  );
}
