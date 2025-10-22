import {Modal, ModalContent} from '@heroui/react';
import {useEffect, useState} from 'react';

import rendererIpc from '../../RendererIpc';
import OnboardingWizard from './InitializerWizard';

export default function Initializer() {
  const [isDone, setIsDone] = useState<boolean>(true);
  const [isOldDone, setIsOldDone] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(({initialized, inited}) => {
      const oldDone = initialized;
      const newDone = inited;
      const isWindows = window.osPlatform === 'win32';

      // If user completed old setup and is NOT on windows, skip the wizard.
      if (oldDone && !isWindows) {
        rendererIpc.storage.update('app', {inited: true});
        setIsDone(true);
      } else {
        setIsDone(newDone);
        setIsOldDone(oldDone);
      }
    });
  }, []);

  if (isDone) return null;

  return (
    <Modal
      size="5xl"
      shadow="none"
      placement="center"
      scrollBehavior="inside"
      className="bg-foreground/0"
      classNames={{wrapper: 'overflow-hidden'}}
      isOpen
      hideCloseButton>
      <ModalContent>
        <OnboardingWizard isOldDone={isOldDone} />
      </ModalContent>
    </Modal>
  );
}
