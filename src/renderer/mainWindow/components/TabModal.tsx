import {Modal, ModalBackdropProps, ModalContainerProps} from '@heroui-v3/react';
import {ReactNode, useEffect, useState} from 'react';
import {UNSAFE_PortalProvider} from 'react-aria';

import {useTabsState} from '../redux/reducers/tabs';

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  size?: ModalContainerProps['size'];
  isDismissable?: boolean;
  backdropVariant?: ModalBackdropProps['variant'];
};

export default function TabModal({
  isOpen,
  onOpenChange,
  children,
  size = 'cover',
  isDismissable = false,
  backdropVariant,
}: Props) {
  const activeTab = useTabsState('activeTab');

  const [targetContainer, setTargetContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTargetContainer(isOpen ? document.getElementById(`${activeTab}_wrapper`) : null);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      {targetContainer && (
        <UNSAFE_PortalProvider getContainer={() => targetContainer}>
          <Modal.Backdrop className="h-full" variant={backdropVariant} isDismissable={isDismissable}>
            <Modal.Container size={size} scroll="inside" className="h-full max-h-full">
              <Modal.Dialog className="h-full max-h-full">
                <UNSAFE_PortalProvider getContainer={() => document.body}>{children}</UNSAFE_PortalProvider>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </UNSAFE_PortalProvider>
      )}
    </Modal>
  );
}
