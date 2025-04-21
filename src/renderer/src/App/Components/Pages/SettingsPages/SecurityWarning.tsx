import {Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';

import {APP_AUTHOR_NAME} from '../../../../../../cross/CrossConstants';
import {ShieldWarning_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons5';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  type: 'extension' | 'module';
  onAgree: () => void;
  title?: string;
  owner?: string;
};

export default function SecurityWarning({isOpen, onAgree, setIsOpen, type, title, owner}: Props) {
  const storeKey = useMemo(() => `dont_show-${type}-security_notice`, [type]);
  const [dontShow, setDontShow] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const savedDontShow = window.localStorage.getItem(storeKey);
      if (
        owner?.toLowerCase() === APP_AUTHOR_NAME.toLowerCase() ||
        (savedDontShow !== null && JSON.parse(savedDontShow) === true)
      ) {
        setIsOpen(false);
        onAgree();
      }
    }
  }, [isOpen, storeKey, owner]);

  const handleAgree = () => {
    if (dontShow) window.localStorage.setItem(storeKey, 'true');
    setIsOpen(false);
    onAgree();
  };

  const handleDecline = () => {
    setIsOpen(false);
    setDontShow(false);
  };

  return (
    <Modal
      size="xl"
      shadow="none"
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      onOpenChange={setIsOpen}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 '}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="bg-foreground-100 justify-center text-warning items-center gap-x-2">
          <ShieldWarning_Icon className="size-7" />
          <span>Security Notice</span>
        </ModalHeader>
        <ModalBody className="py-6 scrollbar-hide">
          <p className="font-semibold text-success">
            LynxHub grants {type === 'extension' ? 'extensions' : 'modules'} full access, similar to standalone
            applications, to maximize their potential.
          </p>
          <p className="text-foreground-600">
            When an {type === 'extension' ? 'extension' : 'module'} is initially submitted, its code is reviewed for
            security and potential vulnerabilities.
            <br />
            However, after the initial review, {type === 'extension' ? 'extensions' : 'modules'} can update their
            functionality with commits, and developers can add any code they want.
          </p>
          <p className="text-foreground-600">
            Please exercise caution and only install trusted {type === 'extension' ? 'extensions' : 'modules'}. LynxHub
            is not responsible for vulnerabilities that may arise after the initial review and subsequent updates.
          </p>
          <p className="text-warning">
            By clicking <span className="font-semibold text-success">Agree</span>, you acknowledge and accept the
            potential security implications of installing
            <span className="font-semibold">{` "${title}" by "${owner}"`}</span>.
          </p>
        </ModalBody>
        <ModalFooter className="bg-foreground-100 py-3 justify-between">
          <Checkbox
            size="sm"
            isSelected={dontShow}
            onValueChange={setDontShow}
            classNames={{hiddenInput: 'cursor-default'}}>
            Do not show this message again
          </Checkbox>
          <div className="flex gap-x-2">
            <Button size="sm" variant="light" color="warning" onPress={handleDecline} className="cursor-default">
              Decline
            </Button>
            <Button size="sm" variant="flat" color="success" onPress={handleAgree}>
              Agree
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
