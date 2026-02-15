import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {modalActions, useModalsState} from '@lynx/redux/reducers/modals';
import {AppDispatch} from '@lynx/redux/store';
import {isLinuxPortable} from '@lynx/utils/hooks';
import {Power_Icon} from '@lynx_assets/icons';
import applicationIpc from '@lynx_shared/ipc/application';
import {Forward2, Restart, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
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
            <ModalFooter className="justify-between">
              <Button
                variant="light"
                color="warning"
                onPress={handleClose}
                startContent={<Forward2 className="rotate-180 size-4" />}>
                Restart Later
              </Button>
              <Button
                color="success"
                onPress={isLinuxPortable ? handleExit : handleRestart}
                startContent={isLinuxPortable ? <Power_Icon className="size-3.5" /> : <Restart className="size-4" />}>
                {isLinuxPortable ? 'Exit Now' : 'Restart Now'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
