import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {Forward2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

/**
 * Component for the "Terminate Process" confirmation dialog.
 * Used when stopping or relaunching an AI process/card.
 */
const TerminateProcess = memo(() => {
  const id = useContextState('targetID');

  const onStop = () => {
    contextMenuIpc.send.stopAI(id);
    hideContextWindow();
  };
  const onRelaunch = () => {
    contextMenuIpc.send.relaunchAI(id);
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
          <div className="space-x-2">
            <Button
              size="sm"
              color="warning"
              className="w-25"
              onPress={onRelaunch}
              startContent={<Restart className="shrink-0 size-3.5" />}>
              Relaunch
            </Button>
            <Button
              size="sm"
              color="danger"
              className="w-25"
              onPress={onStop}
              ref={setElementFocus}
              startContent={<Power_Icon className="shrink-0 size-3.5" />}
              autoFocus>
              Terminate
            </Button>
          </div>
        </>
      }
      confirmName="terminateAIConfirm"
      title="Confirm Terminate Process"
      enabledTitle="Always terminate without confirmation"
    />
  );
});

export default TerminateProcess;
