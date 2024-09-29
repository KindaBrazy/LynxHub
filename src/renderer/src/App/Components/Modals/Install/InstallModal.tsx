import {Modal, ModalContent, ModalHeader} from '@nextui-org/react';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import InstallBody from './Install-Body';
import InstallFooter from './Install-Footer';

/** Manage downloading (Clone repo) and installing Card (WebUI, AI) */
const InstallModal = memo(() => {
  const {isOpen, title} = useModalsState('installModal');

  const dispatch = useDispatch<AppDispatch>();

  const onOpenChange = useCallback(
    (isOpen: boolean) =>
      dispatch(
        modalActions.setIsOpen({
          isOpen,
          modalName: 'installModal',
        }),
      ),
    [dispatch],
  );

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      backdrop="blur"
      isDismissable={false}
      scrollBehavior="inside"
      onOpenChange={onOpenChange}
      classNames={{backdrop: 'top-10', closeButton: 'cursor-default', wrapper: 'top-10'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader
          className={'shrink-0 justify-center overflow-hidden bg-foreground-200 shadow-md dark:bg-foreground-100'}>
          {title}
        </ModalHeader>
        <InstallBody />
        <InstallFooter />
      </ModalContent>
    </Modal>
  );
});

export default InstallModal;
