import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {isLinuxPortable} from '@lynx/hooks/utils';
import {modalActions, useModalsState} from '@lynx/redux/reducers/modals';
import {AppDispatch} from '@lynx/redux/store';
import applicationIpc from '@lynx_shared/ipc/application';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {useDispatch} from 'react-redux';

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
