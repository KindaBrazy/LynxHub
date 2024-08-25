import {Button} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';

/** Render a button that allows the user to locate an existing installation of the Card,
 * handles saving the installation data, and displays an error modal if the installation is not found. */
export default function LocateButton() {
  const url = useModalsState('installModal').url;
  const cardId = useModalsState('installModal').cardId;

  const dispatch = useDispatch<AppDispatch>();

  // Locate an existing installation of the WebUI.
  const locateExisting = useCallback(() => {
    rendererIpc.git
      .locateCard(url)
      .then(path => {
        // If valid repo dir is selected, then save data
        if (path) {
          rendererIpc.storageUtils.addInstalledCard({dir: path, id: cardId});
          dispatch(modalActions.closeModal('installModal'));
        }
        // Otherwise show error modal
        else {
          dispatch(modalActions.setWarningContentId('LOCATE_REPO'));
          dispatch(modalActions.openModal('warningModal'));
        }
      })
      .catch(err => {
        dispatch(modalActions.setWarningContentId('LOCATE_REPO'));
        dispatch(modalActions.openModal('warningModal'));
        console.log(err);
      });
  }, [url, cardId, dispatch]);

  return (
    <Button color="default" variant="light" onPress={locateExisting} className="cursor-default">
      Locate
    </Button>
  );
}
