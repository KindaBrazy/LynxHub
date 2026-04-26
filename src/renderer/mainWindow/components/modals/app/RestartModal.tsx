import {Button, Modal} from '@heroui-v3/react';
import {Power_Icon} from '@lynx_assets/icons';
import applicationIpc from '@lynx_shared/ipc/application';
import {Forward2, Restart, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';
import {isLinuxPortable} from '../../../utils/hooks';
import TabModal from '../../TabModal';

/**
 * Modal that prompts the user to restart the application or exit.
 * Used when a configuration change requires a restart to take effect.
 */
export function RestartModal() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, message} = useModalsState('restartModal');

  const handleClose = () => {
    dispatch(modalActions.closeRestartModal());
  };

  const handleRestart = () => {
    handleClose();
    applicationIpc.send.changeWinState('restart');
  };

  const handleExit = () => {
    handleClose();
    applicationIpc.send.changeWinState('close');
  };

  return (
    <TabModal size="md" isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Header>
        <Modal.Heading className="flex items-center gap-x-1">
          <ShieldWarning className="text-warning size-6" />
          <span>Restart Required</span>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onPress={handleClose}>
          <Forward2 className="rotate-180 size-4" />
          Restart Later
        </Button>
        <Button onPress={isLinuxPortable ? handleExit : handleRestart}>
          {isLinuxPortable ? <Power_Icon className="size-3.5" /> : <Restart className="size-4" />}
          {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
        </Button>
      </Modal.Footer>
    </TabModal>
  );
}
