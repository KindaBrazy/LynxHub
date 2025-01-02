import {Button, ButtonGroup, ModalFooter} from '@nextui-org/react';
import {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import InstallButton from './InstallButton';
import LocateButton from './LocateButton';

/** Renders either a "Cancel" button during download or
 * "Close", "Locate", and "Install" buttons when not downloading. */
const InstallFooter = memo(() => {
  const downloading = useModalsState('installModal').downloading;

  const dispatch = useDispatch<AppDispatch>();

  const closeInstallModal = useCallback(() => dispatch(modalActions.closeModal('installModal')), []);

  const cancelDownload = useCallback(() => {
    rendererIpc.git.abortClone();
    dispatch(modalActions.setInstallDownloading(false));
  }, [dispatch]);

  return (
    <ModalFooter className="shrink-0 justify-between overflow-hidden bg-foreground-200 dark:bg-foreground-100">
      <ButtonGroup fullWidth>
        {downloading ? (
          <Button
            onPress={() => {
              cancelDownload();
              closeInstallModal();
            }}
            color="danger"
            variant="flat"
            className="cursor-default">
            Cancel
          </Button>
        ) : (
          <>
            <Button color="danger" variant="flat" className="cursor-default" onPress={closeInstallModal}>
              Close
            </Button>
            <LocateButton />
            <InstallButton />
          </>
        )}
      </ButtonGroup>
    </ModalFooter>
  );
});

export default InstallFooter;
