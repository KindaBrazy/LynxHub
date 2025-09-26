import {Modal, ModalContent} from '@heroui/react';

import OnboardingWizard from './InitializerWizard';

export default function Initializer() {
  return (
    <Modal
      size="5xl"
      shadow="none"
      isOpen={true}
      placement="center"
      scrollBehavior="inside"
      className="bg-foreground/0"
      classNames={{wrapper: 'overflow-hidden'}}
      hideCloseButton>
      <ModalContent>
        <OnboardingWizard />
      </ModalContent>
    </Modal>
  );
}
