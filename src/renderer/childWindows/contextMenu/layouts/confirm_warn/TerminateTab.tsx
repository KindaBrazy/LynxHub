import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Forward2} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow, setElementFocus} from '../Shared';
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
          <Button
            size="sm"
            color="success"
            className="w-20"
            onPress={hideContextWindow}
            startContent={<Forward2 className="rotate-180 shrink-0 size-3.5" />}>
            Cancel
          </Button>
          <Button
            size="sm"
            color="danger"
            className="w-25"
            onPress={onRemoveTab}
            ref={setElementFocus}
            startContent={<Power_Icon className="shrink-0 size-3.5" />}
            autoFocus>
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
