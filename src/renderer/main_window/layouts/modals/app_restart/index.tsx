import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

import {isLinuxPortable} from '../../../hooks/utils';
import rendererIpc from '../../../ipc';
import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';

export function RestartModal() {
  const dispatch = useDispatch<AppDispatch>();
  const {isOpen, message} = useModalsState('restartModal');

  const handleClose = () => {
    dispatch(modalActions.closeRestartModal());
  };

  const handleRestart = () => {
    handleClose();
    rendererIpc.win.changeWinState('restart');
  };

  const handleExit = () => {
    handleClose();
    rendererIpc.win.changeWinState('close');
  };

  return (
    <Modal
      isOpen={isOpen}
      backdrop="blur"
      placement="center"
      isDismissable={false}
      onOpenChange={handleClose}
      isKeyboardDismissDisabled={true}
      classNames={{wrapper: 'top-10!', backdrop: 'top-10!'}}
      hideCloseButton>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="items-center gap-x-1">
              <ShieldWarning className="text-warning size-6" />
              <span>Restart Required</span>
            </ModalHeader>
            <ModalBody>{message}</ModalBody>
            <ModalFooter>
              <Button variant="light" color="warning" onPress={handleClose}>
                Restart Later
              </Button>
              <Button color="success" onPress={isLinuxPortable ? handleExit : handleRestart}>
                {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
