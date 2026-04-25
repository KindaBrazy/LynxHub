import {Button, Modal} from '@heroui-v3/react';
import {ISSUE_PAGE} from '@lynx_common/consts';
import {useDebounceBreadcrumb} from '@lynx_shared/sentry/Breadcrumbs';
import {SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {ReactNode, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../redux/reducers/modals';
import {AppDispatch} from '../../../redux/store';
import TabModal from '../../TabModal';

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
    </>
  ),
  LOCATE_REPO: (
    <>
      <p className="mt-4 font-semibold">Please ensure the following:</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-foreground-600">
        <li>The directory exists and you have the necessary permissions to access it.</li>
        <li>The directory is a valid Git repository matching the URL.</li>
      </ul>
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
    <TabModal
      onOpenChange={value => {
        if (!value) handleClose();
      }}
      size="lg"
      isOpen={isOpen}>
      <Modal.CloseTrigger /> {/* Optional: Close button */}
      <Modal.Header>
        <Modal.Heading>{warnTitle[contentId]}</Modal.Heading>
      </Modal.Header>
      <Modal.Body>{warnContent[contentId]}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onPress={() => window.open(ISSUE_PAGE)}>
          Report
          <SquareTopDown />
        </Button>
      </Modal.Footer>
    </TabModal>
  );
};

export default WarningModal;
