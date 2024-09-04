import {Button} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {GitProgressCallback} from '../../../../../../cross/IpcChannelAndTypes';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

/** Render a button that initiates the installation process by cloning the repository
 * and handles progress updates and error scenarios. */
export default function InstallButton() {
  const directory = useModalsState('installModal').directory;
  const url = useModalsState('installModal').url;
  const cardId = useModalsState('installModal').cardId;

  const dispatch = useDispatch<AppDispatch>();

  // Starts the installation process by cloning the repository.
  const install = useCallback(() => {
    dispatch(modalActions.setInstallDownloading(true));

    // Start cloning
    rendererIpc.git.cloneRepo(url, directory);
    const onProgress: GitProgressCallback = (_e, id, state, result) => {
      if (id) return;

      switch (state) {
        case 'Progress':
          dispatch(modalActions.setInstallProgress(result as SimpleGitProgressEvent));
          break;
        case 'Failed':
          dispatch(modalActions.setWarningContentId('CLONE_REPO'));
          dispatch(modalActions.openModal('warningModal'));
          dispatch(modalActions.setInstallDownloading(false));
          break;
        case 'Completed':
          dispatch(modalActions.setInstallDownloading(false));
          rendererIpc.storageUtils.addInstalledCard({dir: directory, id: cardId});
          dispatch(modalActions.closeModal('installModal'));
          break;
      }
    };

    // Update ui with progress
    rendererIpc.git.offProgress();
    rendererIpc.git.onProgress(onProgress);

    return () => {
      rendererIpc.git.offProgress();
    };
  }, [url, directory, cardId, dispatch]);

  return (
    <Button color="success" variant="light" onPress={install} className="cursor-default">
      Install
    </Button>
  );
}
