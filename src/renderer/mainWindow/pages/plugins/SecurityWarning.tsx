import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Button, Checkbox, Label} from '@heroui-v3/react';
import {useTabVisibility} from '@lynx/layouts/tabs/utils';
import {APP_AUTHOR_NAME} from '@lynx_common/consts';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState} from 'react';

/**
 * Props for the SecurityWarning component.
 */
interface SecurityWarningProps {
  /** Controls if the security warning modal is open. */
  isOpen: boolean;
  /** State setter to update the modal's open state. */
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  /** The type of plugin taking action (extension or module). */
  type: 'extension' | 'module';
  /** Callback fired when the user agrees to the warning or bypasses it. */
  onAgree: () => void;
  /** The title of the extension/module being installed. */
  title?: string;
  /** The owner or author of the extension/module. */
  owner?: string;
  /** ID of the tab to properly check visibility state. */
  tabId: string;
}

/**
 * Modal component that warns users about installing third-party plugins.
 * Users can agree and choose to not show this notice again for specific types.
 */
export default function SecurityWarning({isOpen, onAgree, setIsOpen, type, title, owner, tabId}: SecurityWarningProps) {
  const storeKey = useMemo(() => `dont_show-${type}-security_notice`, [type]);
  const [dontShow, setDontShow] = useState<boolean>(false);
  const show = useTabVisibility(tabId);

  // Use a ref to store the latest onAgree callback to prevent unnecessary effect triggers
  const onAgreeRef = useRef(onAgree);
  useEffect(() => {
    onAgreeRef.current = onAgree;
  }, [onAgree]);

  /**
   * Check if we should automatically bypass the warning if:
   *  - The author is the app's official author.
   *  - The user has previously decided not to show warnings for this type.
   */
  useEffect(() => {
    if (isOpen) {
      const savedDontShow = window.localStorage.getItem(storeKey);
      const isOfficialAuthor = owner?.toLowerCase() === APP_AUTHOR_NAME.toLowerCase();
      const userOptedOut = savedDontShow === 'true';

      if (isOfficialAuthor || userOptedOut) {
        setIsOpen(false);
        onAgreeRef.current();
      }
    }
  }, [isOpen, storeKey, owner, setIsOpen]);

  const handleAgree = useCallback(() => {
    if (dontShow) {
      window.localStorage.setItem(storeKey, 'true');
    }
    setIsOpen(false);
    onAgreeRef.current();
  }, [dontShow, storeKey, setIsOpen]);

  const handleDecline = useCallback(() => {
    setIsOpen(false);
    setDontShow(false);
  }, [setIsOpen]);

  return (
    <Modal
      size="2xl"
      shadow="none"
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      onOpenChange={setIsOpen}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! ${show}`}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="bg-surface-secondary justify-center text-warning items-center gap-x-2">
          <ShieldWarning className="size-7" />
          <span>Security Notice</span>
        </ModalHeader>

        <ModalBody className="py-6 scrollbar-hide leading-relaxed text-sm">
          <p className="font-semibold text-success text-base">
            LynxHub grants {type === 'extension' ? 'extensions' : 'modules'} full access, similar to standalone
            applications, to maximize their potential.
          </p>
          <p className="text-muted">
            When an {type === 'extension' ? 'extension' : 'module'} is initially submitted, its code is reviewed for
            security and potential vulnerabilities.
            <br />
            However, after the initial review, {type === 'extension' ? 'extensions' : 'modules'} can update their
            functionality with commits, and developers can add any code they want.
          </p>
          <p className="text-muted">
            Please exercise caution and only install trusted {type === 'extension' ? 'extensions' : 'modules'}. LynxHub
            is not responsible for vulnerabilities that may arise after the initial review and subsequent updates.
          </p>
          <p className="text-warning text-base">
            By clicking <span className="font-semibold text-accent">Agree</span>, you acknowledge and accept the
            potential security implications of installing
            <span className="font-semibold">{` "${title}" by "${owner}"`}</span>.
          </p>
        </ModalBody>

        <ModalFooter className="bg-surface-secondary py-3 justify-between">
          <Checkbox isSelected={dontShow} onChange={setDontShow}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>Do not show this message again</Label>
            </Checkbox.Content>
          </Checkbox>
          <div className="flex gap-x-2">
            <Button size="sm" variant="danger-soft" onPress={handleDecline}>
              Decline
            </Button>
            <Button size="sm" variant="primary" onPress={handleAgree}>
              Agree
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
