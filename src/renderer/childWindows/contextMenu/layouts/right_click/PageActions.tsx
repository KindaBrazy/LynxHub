import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Code} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {ActionButton, createActionHandler} from './Utils';

type PageActionsProps = {
  id: number;
  x: number;
  y: number;
};

/**
 * Component that renders page-level actions in the context menu.
 * Currently allows inspecting the element at the given coordinates.
 */
const PageActions = memo(function PageActions({id, x, y}: PageActionsProps) {
  return (
    <ActionButton
      onPress={createActionHandler(() => {
        contextMenuIpc.send.rightClickItems.inspectElement(id, x, y);
      })}
      title="Inspect Element"
      icon={<Code className="size-4" />}
    />
  );
});

export default PageActions;
