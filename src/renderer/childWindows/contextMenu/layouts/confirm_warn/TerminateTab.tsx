import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Forward2} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

const TerminateTab = memo(() => {
  const id = useContextState('targetID');

  const removeTab = () => {
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
            onPress={hideContextWindow}
            startContent={<Forward2 className="rotate-180" />}>
            Cancel
          </Button>
          <Button
            size="sm"
            color="danger"
            onPress={removeTab}
            ref={setElementFocus}
            startContent={<Power_Icon />}
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
