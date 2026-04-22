import {Button} from '@heroui-v3/react';
import {Power_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Forward2} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow} from '../Shared';
import ConfirmElement from './ConfirmElement';

/**
 * Component for the "Terminate Tab" confirmation dialog.
 * Used when closing a tab that requires confirmation.
 */
const TerminateTab = memo(() => {
  const id = useContextState('targetID');

  const onRemoveTab = () => {
    contextMenuIpc.send.removeTab(id);
    hideContextWindow();
  };

  return (
    <ConfirmElement
      buttons={
        <>
          <Button size="sm" className="w-22" variant="secondary" onPress={hideContextWindow}>
            <Forward2 className="rotate-180 shrink-0 size-3.5" />
            Cancel
          </Button>
          <Button size="sm" variant="danger" className="w-27" onPress={onRemoveTab}>
            <Power_Icon className="shrink-0 size-3.5" />
            Terminate
          </Button>
        </>
      }
      confirmName="closeTabConfirm"
      title="Confirm Terminate Process"
      enabledTitle="Always terminate without confirmation"
    />
  );
});

export default TerminateTab;
