import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import {Code} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {ActionButton, createActionHandler} from './Utils';

type Props = {id: number; x: number; y: number};
const PageActions = memo(({id, x, y}: Props) => {
  return (
    <ActionButton
      onPress={createActionHandler(() => {
        contextMenuIpc.send.rightClickItems.inspectElement(id, x, y);
      })}
      title="Inspect Element"
      key="context_inspectElement"
      icon={<Code className="size-4" />}
    />
  );
});

export default PageActions;
