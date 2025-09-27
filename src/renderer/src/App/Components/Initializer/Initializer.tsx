import {Modal, ModalContent} from '@heroui/react';
import {useEffect, useState} from 'react';

import rendererIpc from '../../RendererIpc';
import OnboardingWizard from './InitializerWizard';

export default function Initializer() {
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isOldDone, setIsOldDone] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(({initialized, inited}) => {
      setIsDone(inited);
      setIsOldDone(initialized);
    });
  }, []);

  return (
    <Modal
      size="5xl"
      shadow="none"
      isOpen={!isDone}
      placement="center"
      scrollBehavior="inside"
      className="bg-foreground/0"
      classNames={{wrapper: 'overflow-hidden'}}
      hideCloseButton>
      <ModalContent>
        <OnboardingWizard isOldDone={isOldDone} />
      </ModalContent>
    </Modal>
  );
}
