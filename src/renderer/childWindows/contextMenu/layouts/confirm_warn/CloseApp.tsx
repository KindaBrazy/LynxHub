import {Button} from '@heroui/react';
import {isLinuxPortable} from '@lynx/utils/hooks';
import {Power_Icon} from '@lynx_assets/icons';
import applicationIpc from '@lynx_shared/ipc/application';
import {Forward2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {memo} from 'react';

import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

/**
 * Component for the "Close App" confirmation dialog.
 * Allows the user to exit, restart (if not portable), or cancel.
 */
const CloseApp = memo(() => {
  const onRestart = () => applicationIpc.send.changeWinState('restart');
  const onClose = () => applicationIpc.send.changeWinState('close');

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
            Stay
          </Button>
          <div className="space-x-2">
            {!isLinuxPortable && (
              <Button
                size="sm"
                color="warning"
                className="w-25"
                onPress={onRestart}
                startContent={<Restart className="shrink-0 size-3.5" />}>
                Restart
              </Button>
            )}
            <Button
              size="sm"
              color="danger"
              className="w-25"
              onPress={onClose}
              ref={setElementFocus}
              startContent={<Power_Icon className="shrink-0 size-3.5" />}
              autoFocus>
              Exit
            </Button>
          </div>
        </>
      }
      title="Confirm Exit"
      confirmName="closeConfirm"
      enabledTitle="Always exit without confirmation"
    />
  );
});

export default CloseApp;
