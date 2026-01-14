import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Dispatch, SetStateAction} from 'react';

import {ShieldWarning_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {useTabVisibility} from '../../../Tabs/Tab_Utils';

type Props = {isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>; tabId: string};
export default function LocateWarning({isOpen, setIsOpen, tabId}: Props) {
  const onClose = () => setIsOpen(false);
  const show = useTabVisibility(tabId);
  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={setIsOpen}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! ${show}`}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-warning items-center gap-x-2">
          <ShieldWarning_Icon className="size-8" />
          <span className="font-bold">Installation Directory</span>
        </ModalHeader>
        <ModalBody>
          <span>
            Saving data to an application&#39;s installation directory can result in{' '}
            <span className="text-warning font-semibold">data loss</span>. Please move your data to a different folder.
          </span>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="warning" onPress={onClose} className="cursor-default">
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
