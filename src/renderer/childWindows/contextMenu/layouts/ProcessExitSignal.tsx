import {Button} from '@heroui/react';
import {terminalLineEnding} from '@lynx_common/utils';
import ptyIpc from '@lynx_shared/ipc/pty';
import {Exit, Forward2} from '@solar-icons/react-perf/BoldDuotone';

import {useContextState} from '../redux/reducer';
import ConfirmElement from './confirm_warn/ConfirmElement';
import {hideContextWindow, useFocus} from './Shared';

export default function ProcessExitSignal() {
  const id = useContextState('targetID');
  const focusRef = useFocus();

  const exit = () => {
    ptyIpc.write(id, '\x03');
    hideContextWindow();
  };

  const exitWithY = () => {
    ptyIpc.write(id, '\x03');
    ptyIpc.write(id, 'y' + terminalLineEnding);
    hideContextWindow();
  };

  return (
    <>
      <ConfirmElement
        buttons={
          <>
            <Button
              size="sm"
              tabIndex={2}
              color="success"
              className="w-20"
              onPress={hideContextWindow}
              startContent={<Forward2 className="rotate-180 shrink-0 size-3.5" />}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button
                size="sm"
                tabIndex={1}
                onPress={exit}
                color="warning"
                className="w-25"
                startContent={<Exit className="shrink-0 size-3.5" />}>
                Exit
              </Button>
              <Button
                size="sm"
                tabIndex={0}
                color="danger"
                ref={focusRef}
                className="w-25"
                onPress={exitWithY}
                startContent={<Exit className="shrink-0 size-3.5" />}>
                Exit <span className="bg-danger-600 px-1 py-0.5 rounded-sm">Y</span>
              </Button>
            </div>
          </>
        }
        confirmName="exitSignalConfirm"
        title="Confirm Sending Exit Signal"
        enabledTitle="Always send without confirmation"
      />
    </>
  );
}
