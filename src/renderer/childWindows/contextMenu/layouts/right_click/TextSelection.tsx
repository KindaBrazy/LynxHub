import {Separator} from '@heroui-v3/react';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Magnifier} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {ActionButton, createActionHandler} from './Utils';

type TextSelectionProps = {
  /** The currently selected text */
  selection: string;
};

/**
 * Component that renders context menu actions for selected text.
 * Currently allows searching the selection with Google.
 */
const TextSelection = memo(function TextSelection({selection}: TextSelectionProps) {
  if (!selection) return null;

  return (
    <>
      <ActionButton
        onPress={createActionHandler(() => {
          contextMenuIpc.send.rightClickItems.searchWithGoogle(selection);
        })}
        title={`Search with Google`}
        icon={<Magnifier className="size-4" />}
      />
      <Separator className="my-2" />
    </>
  );
});

export default TextSelection;
