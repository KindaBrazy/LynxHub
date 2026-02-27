import {
  Accordion,
  AccordionItem,
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {ReactNode, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';

/**
 * Component to display "Open Issue" instructions in the warning modal.
 */
const OpenIssue = () => (
  <Accordion
    className="px-0"
    variant="splitted"
    selectionMode="multiple"
    itemClasses={{base: 'bg-foreground-100 shadow-none', trigger: 'cursor-default'}}>
    <AccordionItem key="report" title={<span className="text-warning">📣 Report an Issue</span>}>
      <p className="text-sm text-warning">
        <span>If you continue to experience problems, please open a new issue on my GitHub repository.</span>
        <br />
        <span>This will allow me to investigate and address the issue more effectively.</span>
      </p>
    </AccordionItem>
  </Accordion>
);

/**
 * Titles for warning modals mapped by content ID.
 */
const warnTitle: Record<string, ReactNode> = {
  CLONE_REPO: <p className="font-semibold">Unable to clone repository.</p>,
  LOCATE_REPO: <p className="font-semibold">Unable to access selected directory as Git repository.</p>,
};

/**
 * Content for warning modals mapped by content ID.
 */
const warnContent: Record<string, ReactNode> = {
  CLONE_REPO: (
    <>
      <p className="mt-4 font-semibold">Please ensure you have a stable internet connection and try again.</p>
      <p className="text-sm text-foreground-600">
        If the issue persists, it could be due to one of the following reasons:
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-600">
        <li>The directory is empty and you have the necessary permissions to access it..</li>
        <li>The repository is too large, and your network is unable to handle the file transfer.</li>
        <li>Firewalls or proxy settings are blocking the connection.</li>
      </ul>
      <OpenIssue />
    </>
  ),
  LOCATE_REPO: (
    <>
      <p className="mt-4 font-semibold">Please ensure the following:</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-600">
        <li>The directory exists and you have the necessary permissions to access it.</li>
        <li>The directory is a valid Git repository matching the URL.</li>
      </ul>
      <OpenIssue />
    </>
  ),
};

/**
 * Component that displays a warning modal based on the global warning state.
 * Uses HeroUI modal components.
 */
const WarningModal = () => {
  const {contentId, isOpen} = useModalsState('warningModal');
  const dispatch = useDispatch<AppDispatch>();

  useDebounceBreadcrumb('Warning Modal: ', [isOpen, contentId]);

  const handleClose = useCallback(() => {
    dispatch(modalActions.closeWarning());
  }, [dispatch]);

  return (
    <Modal
      onOpenChange={open => {
        if (!open) handleClose();
      }}
      isOpen={isOpen}
      placement="center"
      classNames={{backdrop: 'top-10!', wrapper: 'top-10! scrollbar-hide'}}
      isDismissable
      hideCloseButton>
      <ModalContent>
        <ModalHeader>{warnTitle[contentId]}</ModalHeader>
        <ModalBody>{warnContent[contentId]}</ModalBody>
        <ModalFooter>
          <div className="flex flex-row gap-x-2">
            <Button
              as={Link}
              variant="light"
              color="warning"
              href={ISSUE_PAGE}
              className="hover:text-warning"
              isExternal
              showAnchorIcon>
              Report
            </Button>
            <Button color="danger" variant="light" onPress={handleClose} className="cursor-default">
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WarningModal;
